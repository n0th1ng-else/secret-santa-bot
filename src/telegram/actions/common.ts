import { TgInlineKeyboardButton, TgMessage } from "../api/types";
import {
  BotMessageModel,
  MessageOptions,
  TelegramMessagePrefix,
} from "../types";
import { LanguageCode } from "../../text/types";
import { Logger } from "../../logger";
import { TextModel } from "../../text";
import { LabelId } from "../../text/labels";
import { TelegramApi } from "../api";
import { DbClient } from "../../db";
import { flattenPromise } from "../../common/helpers";

const logger = new Logger("telegram-bot");

export abstract class GenericAction {
  protected readonly text = new TextModel();

  constructor(
    protected readonly stat: DbClient,
    protected readonly bot: TelegramApi
  ) {}

  public abstract runAction(
    msg: TgMessage,
    mdl: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void>;

  public abstract runCondition(msg: TgMessage, mdl: BotMessageModel): boolean;

  public getChatLanguage(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    lang?: LanguageCode
  ): Promise<LanguageCode> {
    if (lang) {
      return Promise.resolve(lang);
    }

    logger.info(`${prefix.getPrefix()} Fetching language`);
    return this.stat.users
      .getLangId(model.chatId, model.name, model.userLogin, LanguageCode.Ru) // TODO model.userLanguage
      .catch((err) => {
        const errorMessage = "Unable to get the lang";
        logger.error(`${prefix.getPrefix()} ${errorMessage}`, err);
        model.analytics.setError(errorMessage);
        return this.text.fallbackLanguage;
      });
  }

  protected getUserId(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<string> {
    return this.stat.users.getRows(model.chatId).then((rows) => {
      const row = rows.shift();
      if (!row || rows.length) {
        throw new Error("something went wrong"); // TODO
      }
      return row.user_id;
    });
  }

  public sendMessage(
    messageId: number,
    chatId: number,
    ids: LabelId | LabelId[],
    meta: MessageOptions,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    const msgs = Array.isArray(ids) ? ids : [ids];
    if (!msgs.length) {
      return Promise.resolve();
    }

    const part = msgs.shift();
    if (!part) {
      return Promise.resolve();
    }

    logger.info(`${prefix.getPrefix()} Sending the message`);
    return this.sendRawMessage(
      chatId,
      this.text.t(part, meta.lang),
      meta.options
    )
      .then(() => this.sendMessage(messageId, chatId, msgs, meta, prefix))
      .catch((err) => {
        logger.error(`${prefix.getPrefix()} Unable to send the message`, err);
        throw err;
      });
  }

  public editMessage(
    chatId: number,
    messageId: number,
    text: string,
    prefix: TelegramMessagePrefix,
    options?: TgInlineKeyboardButton[][]
  ): Promise<void> {
    return this.bot
      .editMessageText(chatId, messageId, text, options)
      .then(() => logger.info(`${prefix.getPrefix()} Updated message`))
      .catch((err) => {
        logger.error(`${prefix.getPrefix()} Unable to update the message`, err);
        throw err;
      });
  }

  protected sendRawMessage(
    chatId: number,
    message: string,
    options?: TgInlineKeyboardButton[][]
  ): Promise<void> {
    return this.bot.sendMessage(chatId, message, options).then(flattenPromise);
  }
}

export class CoreAction extends GenericAction {
  public runAction(): Promise<void> {
    return Promise.resolve();
  }

  public runCondition(): boolean {
    return false;
  }
}
