import { winstonLogger } from "./logger";
import { Logger } from "winston";
import { Sequelize } from "sequelize";
import { envConfig } from "./env";

const log: Logger = winstonLogger("authDatabaseServer", "debug");

const mysqlUri = `mysql://${envConfig.mysql_user}:${envConfig.mysql_password}@${envConfig.mysql_host}:${envConfig.mysql_port}/${envConfig.mysql_database}`;

export const sequelize: Sequelize = new Sequelize(mysqlUri, {
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    multipleStatements: true,
  },
});

export async function databaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    log.info(
      "AuthService Mysql database connection has been established successfully."
    );
  } catch (error) {
    log.error("Auth Service - Unable to connect to database.");
    log.log("error", "AuthService databaseConnection() method error:", error);
  }
}
