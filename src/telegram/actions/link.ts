import { TgMessage } from "../api/types";
import { GenericAction } from "./common";
import {
  BotMessageModel,
  TelegramButtonModel,
  TelegramMessagePrefix,
} from "../types";
import { LabelId } from "../../text/labels";
import { Logger } from "../../logger";
import { AnalyticsData } from "../../analytics/api/types";
import { LanguageCode } from "../../text/types";
import { EventRowScheme } from "../../db/sql/events";
import { WizardStep } from "../../db/wizards";
import { WizardRowScheme } from "../../db/sql/wizards";
import { flattenPromise } from "../../common/helpers";

const logger = new Logger("telegram-bot");

export class LinkAction extends GenericAction {
  public runAction(
    msg: TgMessage,
    mdl: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    return this.createAndShare(msg, mdl, prefix);
  }

  public runCallback(
    msg: TgMessage,
    button: TelegramButtonModel,
    analytics: AnalyticsData
  ): Promise<void> {
    const model = new BotMessageModel(msg, analytics);
    const prefix = new TelegramMessagePrefix(model.chatId, button.logPrefix);
    const eventId = button.value;

    return this.sendLink(model, prefix, eventId);
  }

  public runCondition(msg: TgMessage, mdl: BotMessageModel): boolean {
    return false;
  }

  private sendLink(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    eventId: string
  ) {
    return this.stat.users
      .getUserId(model.chatId)
      .then((userId) =>
        Promise.all([
          this.getChatLanguage(model, prefix),
          this.stat.relations.getRelation(eventId, userId),
          this.stat.events.getEvent(eventId),
        ])
      )
      .then(([lang, relation, event]) => {
        if (!relation || !event) {
          return this.sendMessage(
            model.id,
            model.chatId,
            [LabelId.RelationNotFound],
            { lang },
            prefix
          );
        }

        return this.shareUrl(model, prefix, lang, event);
      });
  }

  private shareUrl(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    lang: LanguageCode,
    event: EventRowScheme
  ) {
    const title = this.text.t(LabelId.ShareTitleText, lang);
    const name = this.text.t(LabelId.ShareNameText, lang);
    const budget = this.text.t(LabelId.ShareBudgetText, lang);
    const link = this.text.t(LabelId.ShareLinkText, lang);

    const url = `t.me/SantaAnonBot?start=${event.url}`;

    const messages = [title, `${name} ${event.name}`];
    if (event.budget) {
      messages.push(`${budget} ${event.budget}`);
    }

    messages.push(`${link} ${url}`);

    return this.sendRawMessage(model.chatId, messages.join("\n"));
  }

  private createAndShare(
    msg: TgMessage,
    model: BotMessageModel,
    prefix: TelegramMessagePrefix
  ) {
    return this.getWizardStep(model, prefix).then((row) => {
      switch (row.step) {
        case WizardStep.Name:
          return this.createEvent(row, model, prefix);
        case WizardStep.Url: // TODO
        case WizardStep.Budget: // TODO
        default:
          return Promise.resolve();
      }
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
        return Promise.all([
          this.sendLink(model, prefix, eventId),
          this.stat.wizards.resetRowState(row.wizard_id),
        ]);
      })
      .then(flattenPromise);
  }
}
