import { TgCallbackQuery, TgMessage, TgUpdate } from "./api/types";
import { Logger } from "../logger";
import { BotMessageModel, TelegramMessagePrefix } from "./types";
import { isChatGroup, isMessageSupported } from "./helpers";
import { runPromiseWithRetry } from "../common/helpers";
import { getMd5Hash } from "../common/hash";
import { BotActions } from "./actions";
import { botCommands } from "./data";
import { TelegramApi } from "./api";
import { collectAnalytics } from "../analytics";
import { DbClient } from "../db";
import { AnalyticsData } from "../analytics/api/types";

const logger = new Logger("telegram-bot");

export class TelegramBotModel {
  private readonly bot: TelegramApi;
  private readonly actions: BotActions;
  private id = "";
  private host = "";
  private path = "";

  constructor(private readonly token: string, stat: DbClient) {
    this.bot = new TelegramApi(this.token);
    this.actions = new BotActions(stat, this.bot);
  }

  public setHostLocation(
    host: string,
    launchTime = new Date().getTime(),
    path = "/bot/message"
  ): this {
    this.host = host;
    this.path = path;
    this.id = getMd5Hash(this.host, this.path, this.token, launchTime);
    return this;
  }

  public setAuthor(url: string): this {
    return this;
  }

  public applyHostLocationIfNeeded(timeoutMs: number): Promise<boolean> {
    const hookUrl = `${this.host}${this.getPath()}`;
    logger.warn(`WebHook url is ${Logger.y(hookUrl)}`);

    return runPromiseWithRetry("bot.getWebHookInfo", () =>
      this.bot.getWebHookInfo()
    ).then((info) => {
      if (info.url === hookUrl) {
        return true;
      }

      return this.applyHostLocation(timeoutMs);
    });
  }

  private applyHostLocation(timeoutMs: number): Promise<boolean> {
    const hookUrl = `${this.host}${this.getPath()}`;
    logger.warn(`Applying WebHook url is ${Logger.y(hookUrl)}`);
    return runPromiseWithRetry(
      "bot.applyHostLocation",
      () => this.bot.setWebHook(hookUrl),
      timeoutMs
    ).then(() =>
      runPromiseWithRetry("bot.setMyCommands", () =>
        this.bot.setMyCommands(botCommands)
      )
    );
  }

  public getHostLocation(): Promise<string> {
    return this.bot.getWebHookInfo().then((info) => info.url);
  }

  public getPath(): string {
    return `${this.path}/${this.id}`;
  }

  public handleApiMessage(
    message: TgUpdate,
    analytics: AnalyticsData
  ): Promise<void> {
    return Promise.resolve()
      .then(() => {
        if (message.message) {
          return this.handleMessage(message.message, analytics);
        }
        if (message.callback_query) {
          return this.handleCallbackQuery(message.callback_query, analytics);
        }

        logger.warn("Message is not recognized", Object.keys(message));
      })
      .catch((err) => {
        logger.error("Failed to handle api request", err);
      });
  }

  private handleMessage(
    msg: TgMessage,
    analytics: AnalyticsData
  ): Promise<void> {
    const model = new BotMessageModel(msg, analytics);
    const prefix = new TelegramMessagePrefix(model.chatId);

    logger.info(`${prefix.getPrefix()} Incoming message`);

    if (!isMessageSupported(msg)) {
      return TelegramBotModel.logNotSupportedMessage(model, prefix);
    }

    if (isChatGroup(msg)) {
      return Promise.resolve();
    }

    if (this.actions.start.runCondition(msg, model)) {
      return this.actions.start.runAction(msg, model, prefix);
    }

    if (this.actions.event.runCondition(msg, model)) {
      return this.actions.event.runAction(msg, model, prefix);
    }

    if (this.actions.list.runCondition(msg, model)) {
      return this.actions.list.runAction(msg, model, prefix);
    }

    return this.actions.link.runAction(msg, model, prefix);
  }

  private static logNotSupportedMessage(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    logger.warn(`${prefix.getPrefix()} Message is not supported`);
    return collectAnalytics(
      model.analytics.setCommand("Message is not supported", "/bot")
    );
  }

  private handleCallbackQuery(
    msg: TgCallbackQuery,
    analytics: AnalyticsData
  ): Promise<void> {
    return this.actions.handleCallback(msg, analytics);
  }
}
