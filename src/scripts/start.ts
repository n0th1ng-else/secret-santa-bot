import {
  appPort,
  enableSSL,
  selfUrl,
  telegramBotApi,
  nextReplicaUrl,
  replicaLifecycleInterval,
  authorTelegramAccount,
  appVersion,
  ngRokToken,
  memoryLimit,
  launchTime,
  dbPostgres,
} from "../env";
import { Logger } from "../logger";
import { TelegramBotModel } from "../telegram/bot";
import { ExpressServer } from "../server/express";
import { getHostName } from "../server/tunnel";
import { ScheduleDaemon } from "../scheduler";
import { printCurrentMemoryStat } from "../memory";
import { StopListener } from "../process";
import { httpsOptions } from "../../certs";
import { DbClient } from "../db";
import { getLaunchDelay } from "./init";

const logger = new Logger("start-script");

export function run(threadId = 0): void {
  const launchDelay = getLaunchDelay(threadId);

  const server = new ExpressServer(
    appPort,
    enableSSL,
    appVersion,
    httpsOptions
  );

  const db = new DbClient({
    user: dbPostgres.user,
    password: dbPostgres.password,
    host: dbPostgres.host,
    database: dbPostgres.database,
    port: dbPostgres.port,
  }).setClientName(threadId);

  const bot = new TelegramBotModel(telegramBotApi, db).setAuthor(
    authorTelegramAccount
  );

  const daemon = new ScheduleDaemon("memory", () =>
    printCurrentMemoryStat(memoryLimit)
  ).start();
  const stopListener = new StopListener().addTrigger(() => daemon.stop());

  db.init()
    .then(() => getHostName(appPort, selfUrl, ngRokToken))
    .then((host) => {
      logger.info(`Telling telegram our location is ${Logger.y(host)}`);
      bot.setHostLocation(host, launchTime);
      return server
        .setSelfUrl(host)
        .setBots([bot])
        .setStat(db)
        .setThreadId(threadId)
        .start();
    })
    .then((stopFn) => {
      stopListener.addTrigger(() => stopFn());
      return server.triggerDaemon(
        nextReplicaUrl,
        replicaLifecycleInterval,
        launchDelay
      );
    })
    .catch((err) => logger.error("Failed to run the server", err));
}
