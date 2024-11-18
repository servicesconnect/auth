import { projects, singleProjectById } from "@auth/controllers";
import express, { Router } from "express";

const router: Router = express.Router();

export function searchRoutes(): Router {
  router.get("/search/project/:from/:size/:type", projects);
  router.get("/search/project/:projectId", singleProjectById);

  return router;
}
