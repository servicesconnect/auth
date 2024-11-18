import crypto from "crypto";

import { isChangePassword, isValidEmail, isSetPassword } from "@auth/config";
import {
  getAuthUserByPasswordToken,
  getUserByEmail,
  getUserByUsername,
  updatePassword,
  updatePasswordToken,
} from "@auth/services/auth.service";
import { AuthModel } from "@auth/models";
import { IAuthDocument, IEmailMessageDetails } from "@auth/interfaces";
import { Request, Response } from "express";
import { envConfig, BadRequestError } from "@auth/config";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { StatusCodes } from "http-status-codes";

export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = await Promise.resolve(isValidEmail.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password forgotPassword() method error"
    );
  }
  const { email } = req.body;
  const existingUser: IAuthDocument | undefined = await getUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError(
      "Invalid credentials",
      "Password forgotPassword() method error"
    );
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString("hex");
  const date: Date = new Date();
  date.setHours(date.getHours() + 1);
  await updatePasswordToken(existingUser.id!, randomCharacters, date);
  const resetLink = `${envConfig.client_url}/reset_password?token=${randomCharacters}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    resetLink,
    username: existingUser.username,
    template: "forgotPassword",
  };
  await publishDirectMessage(
    authChannel,
    "servicesconnect-email-notification",
    "auth-email",
    JSON.stringify(messageDetails),
    "Forgot password message sent to notification service."
  );
  res.status(StatusCodes.OK).json({ message: "Password reset email sent." });
}

export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = await Promise.resolve(isSetPassword.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password resetPassword() method error"
    );
  }
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  if (password !== confirmPassword) {
    throw new BadRequestError(
      "Passwords do not match",
      "Password resetPassword() method error"
    );
  }

  const existingUser: IAuthDocument | undefined =
    await getAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError(
      "Reset token has expired",
      "Password resetPassword() method error"
    );
  }
  const hashedPassword: string = await AuthModel.prototype.hashPassword(
    password
  );
  await updatePassword(existingUser.id!, hashedPassword);
  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: "resetPasswordSuccess",
  };
  await publishDirectMessage(
    authChannel,
    "servicesconnect-email-notification",
    "auth-email",
    JSON.stringify(messageDetails),
    "Reset password success message sent to notification service."
  );
  res
    .status(StatusCodes.OK)
    .json({ message: "Password successfully updated." });
}

export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = await Promise.resolve(isChangePassword.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password changePassword() method error"
    );
  }
  const { newPassword } = req.body;

  const existingUser: IAuthDocument | undefined = await getUserByUsername(
    `${req.currentUser?.username}`
  );
  if (!existingUser) {
    throw new BadRequestError(
      "Invalid password",
      "Password changePassword() method error"
    );
  }
  const hashedPassword: string = await AuthModel.prototype.hashPassword(
    newPassword
  );
  await updatePassword(existingUser.id!, hashedPassword);
  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: "resetPasswordSuccess",
  };
  await publishDirectMessage(
    authChannel,
    "servicesconnect-email-notification",
    "auth-email",
    JSON.stringify(messageDetails),
    "Password change success message sent to notification service."
  );
  res
    .status(StatusCodes.OK)
    .json({ message: "Password successfully updated." });
}
