import { Request, Response } from "express";
import {
  authMock,
  authMockRequest,
  authMockResponse,
  authUserPayload,
} from "@auth/controllers/test/mocks/auth.mock";
import { readCurrentUser, resendEmail } from "@auth/controllers";
import * as auth from "@auth/services/auth.service";
import * as helper from "@auth/config";
import { Sequelize } from "sequelize";

jest.mock("@auth/services/auth.service");
jest.mock("@auth/queues/auth.producer");
jest.mock("@elastic/elasticsearch");

const USERNAME = "Manny";
const EMAIL = "Manny@email.com";
const PASSWORD = "manny1";

let mockConnection: Sequelize;

describe("CurrentUser", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    mockConnection = new Sequelize(
      `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`,
      {
        dialect: "mysql",
        logging: false,
        dialectOptions: {
          multipleStatements: true,
        },
      }
    );
    await mockConnection.sync({ force: true });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await mockConnection.close();
  });

  describe("read method", () => {
    it("should return authenticated user", async () => {
      const req: Request = authMockRequest(
        {},
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, "getAuthUserById").mockResolvedValue(authMock);

      await readCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authenticated user",
        user: authMock,
      });
    });

    it("should return empty user", async () => {
      const req: Request = authMockRequest(
        {},
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, "getAuthUserById").mockResolvedValue({} as never);

      await readCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authenticated user",
        user: null,
      });
    });
  });

  describe("resendEmail method", () => {
    it("should call BadRequestError for invalid email", async () => {
      const req: Request = authMockRequest(
        {},
        { email: USERNAME, password: PASSWORD },
        authUserPayload
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, "getUserByEmail").mockResolvedValue({} as never);

      resendEmail(req, res).catch(() => {
        expect(helper.BadRequestError).toHaveBeenCalledWith(
          "Email is invalid",
          "CurrentUser resentEmail() method error"
        );
      });
    });

    it("should call updateVerifyEmailField method", async () => {
      const req: Request = authMockRequest(
        {},
        { email: EMAIL, password: PASSWORD },
        authUserPayload
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, "getUserByEmail").mockResolvedValue(authMock);

      await resendEmail(req, res);
      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
    });

    it("should return authenticated user", async () => {
      const req: Request = authMockRequest(
        {},
        { email: EMAIL, password: PASSWORD },
        authUserPayload
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, "getUserByEmail").mockResolvedValue(authMock);
      jest.spyOn(auth, "getAuthUserById").mockResolvedValue(authMock);

      await resendEmail(req, res);
      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email verification sent",
        user: authMock,
      });
    });
  });
});
