import crypto from "crypto";

import {
  getAuthUserById,
  getUserByEmail,
  updateVerifyEmailField,
} from "@auth/services/auth.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, lowerCase, envConfig } from "@auth/config";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { IAuthDocument, IEmailMessageDetails } from "@auth/models";

export async function readCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  let user = null;
  const existingUser: IAuthDocument | undefined = await getAuthUserById(
    req.currentUser!.id
  );
  if (Object.keys(existingUser!).length) {
    user = existingUser;
  }
  res.status(StatusCodes.OK).json({ message: "Authenticated user", user });
}

export async function resendEmail(req: Request, res: Response): Promise<void> {
  const { email, userId } = req.body;
  const checkIfUserExist: IAuthDocument | undefined = await getUserByEmail(
    lowerCase(email)
  );
  if (!checkIfUserExist) {
    throw new BadRequestError(
      "Email is invalid",
      "CurrentUser resentEmail() method error"
    );
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString("hex");
  const verificationLink = `${envConfig.client_url}/confirm_email?v_token=${randomCharacters}`;
  await updateVerifyEmailField(parseInt(userId), 0, randomCharacters);
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: "verifyEmail",
  };
  await publishDirectMessage(
    authChannel,
    "jobber-email-notification",
    "auth-email",
    JSON.stringify(messageDetails),
    "Verify email message has been sent to notification service."
  );
  const updatedUser = await getAuthUserById(parseInt(userId));
  res
    .status(StatusCodes.OK)
    .json({ message: "Email verification sent", user: updatedUser });
}
