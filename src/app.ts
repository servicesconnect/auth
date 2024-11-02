import express, { Express } from "express";
import { start } from "@auth/server";
import { databaseConnectiongit qad } from "@auth/config";
// import { config } from "@auth/config";

const initialize = (): void => {
  //   config.cloudinaryConfig();
  const app: Express = express();
  databaseConnection();
  start(app);
};

initialize();
