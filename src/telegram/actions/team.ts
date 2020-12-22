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
import { formUserDetails } from "../messages";

const logger = new Logger("telegram-bot");

export class TeamAction extends GenericAction {
  public runAction(
    msg: TgMessage,
    mdl: BotMessageModel,
    prefix: TelegramMessagePrefix
  ): Promise<void> {
    return Promise.resolve();
  }

  public runCallback(
    msg: TgMessage,
    button: TelegramButtonModel,
    analytics: AnalyticsData
  ): Promise<void> {
    const model = new BotMessageModel(msg, analytics);
    const prefix = new TelegramMessagePrefix(model.chatId, button.logPrefix);
    const eventId = button.value;

    return this.showParticipants(model, prefix, eventId);
  }

  public runCondition(msg: TgMessage, mdl: BotMessageModel): boolean {
    return false;
  }

  private getUsers(eventId: string) {
    return this.stat.relations
      .getParticipants(eventId)
      .then((relations) =>
        Promise.all(
          relations.map((relation) => this.stat.users.getUser(relation.user_id))
        )
      );
  }

  private showParticipants(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    eventId: string
  ) {
    return Promise.all([
      this.getUsers(eventId),
      this.getChatLanguage(model, prefix),
    ]).then(([users, lang]) => {
      const title = this.text.t(LabelId.ParticipantsText, lang);
      const lines = users.map((user) => formUserDetails(lang, user));
      return this.sendRawMessage(model.chatId, [title, ...lines].join("\n"));
    });
  }
}
