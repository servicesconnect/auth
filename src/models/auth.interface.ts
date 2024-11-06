declare global {
  namespace Express {
    interface Request {
      currentUser?: IAuthPayload;
    }
  }
}

export interface IAuthPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
}

export interface IAuthDocument {
  id?: number;
  profilePublicId?: string;
  username?: string;
  email?: string;
  password?: string;
  country?: string;
  profilePicture?: string;
  emailVerified?: number;
  emailVerificationToken?: string;
  browserName?: string;
  deviceType?: string;
  otp?: string;
  otpExpiration?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface IAuthBuyerMessageDetails {
  username?: string;
  profilePicture?: string;
  email?: string;
  country?: string;
  createdAt?: Date;
  type?: string;
}

export interface IEmailMessageDetails {
  receiverEmail?: string;
  template?: string;
  verifyLink?: string;
  resetLink?: string;
  username?: string;
  otp?: string;
}
