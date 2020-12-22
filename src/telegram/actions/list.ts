import { TgInlineKeyboardButton, TgMessage } from "../api/types";
import { GenericAction } from "./common";
import { isListMessage } from "../helpers";
import {
  BotMessageModel,
  TelegramButtonModel,
  TelegramButtonType,
  TelegramMessagePrefix,
} from "../types";
import { LabelId } from "../../text/labels";
import { Logger } from "../../logger";
import { LanguageCode } from "../../text/types";
import { RelationRowScheme } from "../../db/sql/relations";
import { AnalyticsData } from "../../analytics/api/types";
import { formEventDetails } from "../messages";

const logger = new Logger("telegram-bot");

export class ListAction extends GenericAction {
  public runAction(
    msg: TgMessage,
    mdl: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    return this.sendEventList(mdl, prefix);
  }

  public runCondition(msg: TgMessage, mdl: BotMessageModel): boolean {
    return isListMessage(mdl, msg);
  }

  public runCallback(
    msg: TgMessage,
    button: TelegramButtonModel,
    analytics: AnalyticsData
  ): Promise<void> {
    return this.showEventDetails(msg, button, analytics);
  }

  private sendEventList(model: BotMessageModel, prefix: TelegramMessagePrefix) {
    return this.stat.users
      .getUserId(model.chatId)
      .then((userId) =>
        Promise.all([
          Promise.resolve(userId),
          this.getChatLanguage(model, prefix),
          this.stat.relations.getEvents(userId),
        ])
      )
      .then(([userId, lang, rows]) => {
        if (!rows.length) {
          return this.sendMessage(
            model.id,
            model.chatId,
            [LabelId.EventMessage],
            { lang },
            prefix
          );
        }

        return this.sendEvents(model, prefix, lang, userId, rows);
      });
  }

  private sendEvents(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    lang: LanguageCode,
    userId: string,
    rows: RelationRowScheme[]
  ) {
    return Promise.all(
      rows.map((row) => this.stat.events.getEvent(row.event_id))
    ).then((events) => {
      const buttons: TgInlineKeyboardButton[][] = events.reduce<
        TgInlineKeyboardButton[][]
      >((list, event) => {
        if (!event) {
          return list;
        }

        const dto = new TelegramButtonModel(
          TelegramButtonType.Event,
          event.event_id,
          prefix.id
        ).getDtoString();

        const isOwned = event.user_id === userId ? "🌚 " : "";

        list.push([
          {
            callback_data: dto,
            text: `${isOwned}${event.name}`,
          },
        ]);
        return list;
      }, [] as TgInlineKeyboardButton[][]);

      return this.sendMessage(
        model.id,
        model.chatId,
        [LabelId.EventListMessage],
        { lang, options: buttons },
        prefix
      );
    });
  }

  private showEventDetails(
    msg: TgMessage,
    button: TelegramButtonModel,
    analytics: AnalyticsData
  ) {
    const model = new BotMessageModel(msg, analytics);
    const prefix = new TelegramMessagePrefix(model.chatId, button.logPrefix);
    const eventId = button.value;

    return this.stat.users
      .getUserId(model.chatId)
      .then((userId) =>
        Promise.all([
          Promise.resolve(userId),
          this.getChatLanguage(model, prefix),
          this.stat.relations.getRelation(eventId, userId),
          this.stat.events.getEvent(eventId),
        ])
      )
      .then(([userId, lang, relation, event]) => {
        if (!relation || !event) {
          return this.editMessage(
            model.chatId,
            msg.message_id,
            this.text.t(LabelId.RelationNotFound, lang),
            prefix
          );
        }

        const isAdmin = event.user_id === userId;
        const isOwned = isAdmin ? "🌚 " : "";

        const myBuddyBtn = new TelegramButtonModel(
          TelegramButtonType.Delivery,
          event.event_id,
          prefix.id
        );

        const eventLinkBtn = new TelegramButtonModel(
          TelegramButtonType.EventLink,
          event.event_id,
          prefix.id
        );

        const activateBtn = new TelegramButtonModel(
          TelegramButtonType.Activate,
          event.event_id,
          prefix.id
        );

        const participantsBtn = new TelegramButtonModel(
          TelegramButtonType.Participants,
          event.event_id,
          prefix.id
        );

        const btns: TgInlineKeyboardButton[][] = [
          [
            {
              text: this.text.t(LabelId.MyBuddyBtn, lang),
              callback_data: myBuddyBtn.getDtoString(),
            },
          ],
          [
            {
              text: this.text.t(LabelId.EventLinkBtn, lang),
              callback_data: eventLinkBtn.getDtoString(),
            },
          ],
          [
            {
              text: this.text.t(LabelId.ParticipantsBtn, lang),
              callback_data: participantsBtn.getDtoString(),
            },
          ],
        ];

        if (isAdmin) {
          btns.push([
            {
              text: this.text.t(LabelId.ActivateBtn, lang),
              callback_data: activateBtn.getDtoString(),
            },
          ]);
        }

        return this.editMessage(
          model.chatId,
          msg.message_id,
          `${isOwned}${formEventDetails(lang, event)}`,
          prefix,
          btns
        );
      });
  }
}
