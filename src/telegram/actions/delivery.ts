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
import { EventState } from "../../db/events";
import { formUserDetails } from "../messages";

const logger = new Logger("telegram-bot");

export class DeliveryAction extends GenericAction {
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

    return this.getDeliveryName(model, prefix, eventId);
  }

  public runCondition(msg: TgMessage, mdl: BotMessageModel): boolean {
    return false;
  }

  private getDeliveryName(
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

        const agentId = relation.agent_id;
        const isActivated = event.state === EventState.Locked;

        if (!agentId || !isActivated) {
          return this.sendMessage(
            model.id,
            model.chatId,
            [LabelId.EmptyAgentText],
            { lang },
            prefix
          );
        }

        return this.sendAgentInfo(model, prefix, agentId, lang);
      });
  }

  private sendAgentInfo(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    agentId: string,
    lang: LanguageCode
  ) {
    return this.stat.users.getUser(agentId).then((agent) => {
      const title = this.text.t(LabelId.ShareTitleText, lang);
      const messages = [title, formUserDetails(lang, agent)];

      return this.sendRawMessage(model.chatId, messages.join("\n"));
    });
  }
}
