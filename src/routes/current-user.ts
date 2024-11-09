import { readCurrentUser, resendEmail } from "@auth/controllers/current-user";
import { token } from "@auth/controllers";
import express, { Router } from "express";

const router: Router = express.Router();

export function currentUserRoutes(): Router {
  router.get("/refresh-token/:username", token);
  router.get("/currentuser", readCurrentUser);
  router.post("/resend-email", resendEmail);

  return router;
}
