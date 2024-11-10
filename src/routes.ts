import { Application } from "express";
import { verifyGatewayRequest } from "@auth/config";
import { authRoutes } from "@auth/routes/auth";
import { currentUserRoutes } from "@auth/routes/current-user";
import { healthRoutes } from "./routes/health";
import { searchRoutes } from "./routes/search";

const BASE_PATH = "/api/v1/auth";

export function appRoutes(app: Application): void {
  app.use("", healthRoutes());
  app.use(BASE_PATH, searchRoutes());

  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
}
