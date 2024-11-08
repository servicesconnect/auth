import express, { Express } from "express";
import { start } from "@auth/server";
import { cloudinaryConfig, databaseConnection } from "@auth/config";

const initialize = (): void => {
  cloudinaryConfig.cloudinaryConfig();
  const app: Express = express();
  databaseConnection();
  start(app);
};

initialize();
