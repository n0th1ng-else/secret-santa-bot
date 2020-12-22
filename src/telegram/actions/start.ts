import { TgMessage } from "../api/types";
import { GenericAction } from "./common";
import { isHelloMessage } from "../helpers";
import { BotCommand, BotMessageModel, TelegramMessagePrefix } from "../types";
import { LabelId } from "../../text/labels";
import { Logger } from "../../logger";
import { collectAnalytics } from "../../analytics";
import { LanguageCode } from "../../text/types";
import { EventRowScheme } from "../../db/sql/events";
import { formEventDetails } from "../messages";

const logger = new Logger("telegram-bot");

export class StartAction extends GenericAction {
  public runAction(
    msg: TgMessage,
    mdl: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    const text = (msg && msg.text) || "";
    const [, urlId] = text.split(" ");

    if (urlId) {
      return this.checkUserAndJoinEvent(urlId, mdl, prefix);
    }

    return this.sendHelloMessage(mdl, prefix);
  }

  public runCondition(msg: TgMessage, mdl: BotMessageModel): boolean {
    return isHelloMessage(mdl, msg);
  }

  private sendHelloMessage(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    logger.info(`${prefix.getPrefix()} Sending hello message`);
    return this.getChatLanguage(model, prefix)
      .then((lang) =>
        this.sendMessage(
          model.id,
          model.chatId,
          [LabelId.WelcomeMessage],
          { lang },
          prefix
        )
      )
      .then(() => logger.info(`${prefix.getPrefix()} Hello message sent`))
      .catch((err) => {
        const errorMessage = "Unable to send hello message";
        logger.error(`${prefix.getPrefix()} ${errorMessage}`, err);
        model.analytics.setError(errorMessage);
      })
      .then(() =>
        collectAnalytics(
          model.analytics.setCommand("Hello message", BotCommand.Start)
        )
      );
  }

  private checkUserAndJoinEvent(
    urlId: string,
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ) {
    return this.stat.users
      .createRowIfNotExists(
        model.chatId,
        model.name,
        model.userLogin,
        LanguageCode.Ru
      ) // TODO model.userLanguage
      .then((user) =>
        this.findAndJoinEvent(model, prefix, urlId, user.user_id)
      );
  }

  private findAndJoinEvent(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    urlId: string,
    userId: string
  ) {
    return this.stat.events.getRows(urlId).then((events) => {
      const event = events.shift();
      if (!event || events.length) {
        throw new Error("event not found"); // TODO
      }

      return this.joinEvent(model, prefix, event, userId);
    });
  }

  private joinEvent(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    event: EventRowScheme,
    userId: string
  ) {
    return this.stat.relations
      .createRow(event.event_id, userId)
      .then(() => this.getChatLanguage(model, prefix))
      .then((lang) => {
        const title = this.text.t(LabelId.JoinedEventText, lang);
        const messages = [title, formEventDetails(lang, event)];
        return this.sendRawMessage(model.chatId, messages.join("\n"));
      });
  }
}
