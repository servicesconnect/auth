import { AuthModel, IAuthDocument } from "@auth/models/";
import {
  getUserByEmail,
  getUserByUsername,
  signToken,
} from "@auth/services/auth.service";
import { BadRequestError, isEmail, isLogin } from "@auth/config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit } from "lodash";

export async function read(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(isLogin.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "SignIn read() method error"
    );
  }
  const { username, password } = req.body;
  const isValidEmail: boolean = isEmail(username);
  const existingUser: IAuthDocument | undefined = !isValidEmail
    ? await getUserByUsername(username)
    : await getUserByEmail(username);
  if (!existingUser) {
    throw new BadRequestError(
      "Invalid credentials",
      "SignIn read() method error"
    );
  }
  const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(
    password,
    `${existingUser.password}`
  );
  if (!passwordsMatch) {
    throw new BadRequestError(
      "Invalid credentials",
      "SignIn read() method error"
    );
  }

  const userJWT = signToken(
    existingUser.id!,
    existingUser.email!,
    existingUser.username!
  );
  const userData = omit(existingUser, ["password"]);

  res.status(StatusCodes.OK).json({
    message: "User login successfully",
    user: userData,
    token: userJWT,
  });
}
