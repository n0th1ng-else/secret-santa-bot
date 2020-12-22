import { TgMessage } from "../api/types";
import { GenericAction } from "./common";
import { isHelloMessage } from "../helpers";
import { BotCommand, BotMessageModel, TelegramMessagePrefix } from "../types";
import { LabelId } from "../../text/labels";
import { Logger } from "../../logger";
import { collectAnalytics } from "../../analytics";
import { LanguageCode } from "../../text/types";
import { EventRowScheme } from "../../db/sql/events";

const logger = new Logger("telegram-bot");

export class StartAction extends GenericAction {
  public runAction(
    msg: TgMessage,
    mdl: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    const text = (msg && msg.text) || "";
    const [, eventId] = text.split(" ");

    if (eventId) {
      return this.checkUserAndJoinEvent(eventId, mdl, prefix);
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
    eventId: string,
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
      .then((user) => this.findAndJoinEvent(eventId, user.user_id));
  }

  private findAndJoinEvent(eventId: string, userId: string) {
    return this.stat.events.getEvent(eventId).then((event) => {
      if (!event) {
        throw new Error("event not found"); // TODO
      }

      return this.joinEvent(event, userId);
    });
  }

  private joinEvent(event: EventRowScheme, userId: string) {
    return this.stat.relations.createRow(event.event_id, userId).then(() => {
      // TODO
    });
  }
}
