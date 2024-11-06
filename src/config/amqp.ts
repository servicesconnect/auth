import { envConfig, winstonLogger } from "@auth/config";
import client, { Channel, Connection } from "amqplib";
import { Logger } from "winston";

const log: Logger = winstonLogger("authQueueConnection", "debug");

async function createQueueConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(
      `${envConfig.rabbitmq_endpoint}`
    );
    const channel: Channel = await connection.createChannel();
    log.info("Auth server connected to queue successfully...");
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log("error", "AuthService error createConnection() method:", error);
    return undefined;
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.once("SIGINT", async () => {
    await channel.close();
    await connection.close();
  });
}

export { createQueueConnection };
