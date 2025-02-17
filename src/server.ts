import http from "http";

import "express-async-errors";
import {
  winstonLogger,
  envConfig,
  CustomError,
  createQueueConnection,
  startAndCheckElasticConnection,
  createIndex,
} from "@auth/config";
import { IAuthPayload, IErrorResponse } from "@auth/interfaces";
import { Logger } from "winston";
import {
  Application,
  Request,
  Response,
  NextFunction,
  json,
  urlencoded,
} from "express";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { verify } from "jsonwebtoken";
import compression from "compression";
import { Channel } from "amqplib";
import { appRoutes } from "@auth/routes";

const log: Logger = winstonLogger("authenticationServer", "debug");

export let authChannel: Channel;

export function start(app: Application): void {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
}

function securityMiddleware(app: Application): void {
  app.set("trust proxy", 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: envConfig.api_gateway_url,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const payload: IAuthPayload = verify(
        token,
        envConfig.jwt_token!
      ) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({ limit: "200mb" }));
  app.use(urlencoded({ extended: true, limit: "200mb" }));
}

function routesMiddleware(app: Application): void {
  appRoutes(app);
}

async function startQueues(): Promise<void> {
  authChannel = (await createQueueConnection()) as Channel;
}

function startElasticSearch(): void {
  startAndCheckElasticConnection();
  createIndex("projects");
}

function authErrorHandler(app: Application): void {
  app.use(
    (
      error: IErrorResponse,
      _req: Request,
      res: Response,
      next: NextFunction
    ) => {
      log.log("error", `AuthService ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    }
  );
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(
      `Authentication server has started with process id ${process.pid}`
    );
    httpServer.listen(envConfig.port, () => {
      log.info(`Authentication server running on port ${envConfig.port}`);
    });
  } catch (error) {
    log.log("error", "AuthService startServer() method error:", error);
  }
}
