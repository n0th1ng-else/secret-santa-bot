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
import { shuffleList } from "../../common/shuffle";
import { EventState } from "../../db/events";
import { RelationRowScheme } from "../../db/sql/relations";
import { flattenPromise } from "../../common/helpers";
import { EventRowScheme } from "../../db/sql/events";
import { formEventDetails, formUserDetails } from "../messages";

const logger = new Logger("telegram-bot");

export class ActivateAction extends GenericAction {
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

    return this.activateEvent(model, prefix, eventId);
  }

  public runCondition(msg: TgMessage, mdl: BotMessageModel): boolean {
    return false;
  }

  private activateEvent(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    eventId: string
  ) {
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
        const isAdmin = event && event.user_id === userId;

        if (!relation || !event || !isAdmin) {
          return this.sendMessage(
            model.id,
            model.chatId,
            [LabelId.RelationNotFound],
            { lang },
            prefix
          );
        }

        const isActivated = event.state === EventState.Locked;

        if (isActivated) {
          return this.sendMessage(
            model.id,
            model.chatId,
            [LabelId.AlreadyActive],
            { lang },
            prefix
          );
        }

        return this.activateEventLayout(model, prefix, eventId, lang, event);
      });
  }

  private activateEventLayout(
    model: BotMessageModel,
    prefix: TelegramMessagePrefix,
    eventId: string,
    lang: LanguageCode,
    event: EventRowScheme
  ) {
    return this.stat.relations
      .getParticipants(eventId)
      .then((relations) => {
        const list = shuffleList(relations.map((relation) => relation.user_id));
        return this.stat.relations.assignAgents(eventId, list);
      })
      .then(() =>
        this.sendMessage(
          model.id,
          model.chatId,
          [LabelId.ActivatedText],
          { lang },
          prefix
        )
      )
      .then(() => this.stat.events.lockEvent(eventId))
      .then(() => this.stat.relations.getParticipants(eventId))
      .then((relations) =>
        this.notifyParticipants(prefix, lang, relations, event)
      );
  }

  private notifyParticipants(
    prefix: TelegramMessagePrefix,
    lang: LanguageCode,
    relations: RelationRowScheme[],
    event: EventRowScheme
  ) {
    return Promise.all(
      relations.map((relation) =>
        this.sendAgentInfo(
          prefix,
          lang,
          relation.user_id,
          event,
          relation.agent_id
        )
      )
    ).then(flattenPromise);
  }

  private sendAgentInfo(
    prefix: TelegramMessagePrefix,
    lang: LanguageCode,
    userId: string,
    event: EventRowScheme,
    agentId?: string
  ) {
    if (!agentId) {
      // TODO
      return Promise.resolve();
    }

    const eventDetails = formEventDetails(lang, event);

    return Promise.all([
      this.stat.users.getUser(userId),
      this.stat.users.getUser(agentId),
    ])
      .then(([user, agent]) => {
        const title = this.text.t(LabelId.ShareTitleText, lang);
        const messages = [eventDetails, title, formUserDetails(lang, agent)];

        return this.sendRawMessage(user.chat_id, messages.join("\n"));
      })
      .then(flattenPromise);
  }
}
