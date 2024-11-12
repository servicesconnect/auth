import crypto from "crypto";
import {
  createAuthUser,
  getUserByUsernameOrEmail,
  signToken,
} from "@auth/services/auth.service";
import { Request, Response } from "express";
import { v4 as uuidV4 } from "uuid";
import { UploadApiResponse } from "cloudinary";
import {
  envConfig,
  isSignUp,
  BadRequestError,
  firstLetterUppercase,
  lowerCase,
  cloudinaryConfig,
} from "@auth/config";
import { IAuthDocument, IEmailMessageDetails } from "@auth/interfaces";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { StatusCodes } from "http-status-codes";

export async function create(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(isSignUp.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "SignUp create() method error"
    );
  }
  const {
    username,
    email,
    password,
    country,
    profilePicture,
    browserName,
    deviceType,
  } = req.body;
  const checkIfUserExist: IAuthDocument | undefined =
    await getUserByUsernameOrEmail(username, email);
  if (checkIfUserExist) {
    throw new BadRequestError(
      "Invalid credentials. Email or Username",
      "SignUp create() method error"
    );
  }

  const profilePublicId = uuidV4();
  const uploadResult: UploadApiResponse = (await cloudinaryConfig.uploads(
    profilePicture,
    `${profilePublicId}`,
    true,
    true
  )) as UploadApiResponse;
  if (!uploadResult.public_id) {
    throw new BadRequestError(
      "File upload error. Try again",
      "SignUp create() method error"
    );
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString("hex");
  const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    profilePublicId,
    password,
    country,
    profilePicture: uploadResult?.secure_url,
    emailVerificationToken: randomCharacters,
    browserName,
    deviceType,
  } as IAuthDocument;
  const result: IAuthDocument = (await createAuthUser(
    authData,
    false
  )) as IAuthDocument;
  const verificationLink = `${envConfig.client_url}/confirm_email?v_token=${authData.emailVerificationToken}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
    verifyLink: verificationLink,
    template: "verifyEmail",
  };
  await publishDirectMessage(
    authChannel,
    "servicesconnect-email-notification",
    "auth-email",
    JSON.stringify(messageDetails),
    "Verify email message has been sent to notification service."
  );
  const userJWT: string = signToken(
    result.id!,
    result.email!,
    result.username!
  );
  res.status(StatusCodes.CREATED).json({
    message: "User created successfully",
    user: result,
    token: userJWT,
  });
}
