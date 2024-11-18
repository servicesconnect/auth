import JWT from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "./error-handler";
import { envConfig } from "./env";

const tokens: string[] = [
  "auth",
  "seller",
  "project",
  "search",
  "buyer",
  "message",
  "order",
  "review",
];

export function verifyGatewayRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.headers?.gatewaytoken) {
    throw new NotAuthorizedError(
      "Invalid request",
      "verifyGatewayRequest() method: Request not coming from api gateway"
    );
  }
  const token: string = req.headers?.gatewaytoken as string;
  if (!token) {
    throw new NotAuthorizedError(
      "Invalid request",
      "verifyGatewayRequest() method: Request not coming from api gateway"
    );
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(
      token,
      envConfig.gateway_jwt_token!
    ) as { id: string; iat: number };
    if (!tokens.includes(payload.id)) {
      throw new NotAuthorizedError(
        "Invalid request",
        "verifyGatewayRequest() method: Request payload is invalid"
      );
    }
  } catch (error) {
    throw new NotAuthorizedError(
      "Invalid request",
      "verifyGatewayRequest() method: Request not coming from api gateway"
    );
  }
  next();
}
