import { TgMessage } from "../api/types";
import { GenericAction } from "./common";
import { isEventMessage } from "../helpers";
import { BotCommand, BotMessageModel, TelegramMessagePrefix } from "../types";
import { LabelId } from "../../text/labels";
import { Logger } from "../../logger";
import { collectAnalytics } from "../../analytics";
import { WizardRowScheme } from "../../db/sql/wizards";
import { WizardStep } from "../../db/wizards";
import { flattenPromise } from "../../common/helpers";

const logger = new Logger("telegram-bot");

export class EventAction extends GenericAction {
  public runAction(
    msg: TgMessage,
    mdl: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    return this.sendEventMessage(mdl, prefix);
  }

  public runCondition(msg: TgMessage, mdl: BotMessageModel): boolean {
    return isEventMessage(mdl, msg);
  }

  public evalWizardStep(model: BotMessageModel, prefix: TelegramMessagePrefix) {
    return this.getWizardStep(model, prefix).then((row) => {
      switch (row.step) {
        case WizardStep.Name:
          return this.createEvent(row, model, prefix);
        case WizardStep.Url:
        case WizardStep.Budget:
        default:
      }
    });
  }

  private sendEventMessage(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    return this.startWizard(model, prefix)
      .then(() => {
        logger.info(`${prefix.getPrefix()} Sending event message`);
        return this.getChatLanguage(model, prefix);
      })
      .then((lang) =>
        this.sendMessage(
          model.id,
          model.chatId,
          [LabelId.EventMessage],
          { lang },
          prefix
        )
      )
      .then(() => logger.info(`${prefix.getPrefix()} Event message sent`))
      .catch((err) => {
        const errorMessage = "Unable to send event message";
        logger.error(`${prefix.getPrefix()} ${errorMessage}`, err);
        model.analytics.setError(errorMessage);
      })
      .then(() =>
        collectAnalytics(
          model.analytics.setCommand("Event message", BotCommand.Event)
        )
      );
  }

  private startWizard(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<WizardRowScheme> {
    return this.getUserId(model, prefix).then((userId) =>
      this.stat.wizards.createRowIfNotExists(userId)
    );
  }

  private getUserId(
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

  private getWizardStep(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<WizardRowScheme> {
    return this.getUserId(model, prefix)
      .then((userId) => this.stat.wizards.getRows(userId))
      .then((rows) => {
        const row = rows.shift();
        if (!row || rows.length) {
          throw new Error("something went wrong"); // TODO
        }
        return row;
      });
  }

  private createEvent(
    row: WizardRowScheme,
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ) {
    return this.stat.events
      .createRow(row.event_id, row.user_id, model.text)
      .then(() => this.stat.relations.createRow(row.event_id, row.user_id))
      .then((relation) => {
        const eventId = relation.event_id;
        return this.sendRawMessage(
          model.chatId,
          `t.me/SantaAnonBot?start=${eventId}`
        );
      })
      .then(flattenPromise);
  }
}
