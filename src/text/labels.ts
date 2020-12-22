import { LanguageCode } from "./types";

export enum LabelId {
  NoContent,
  WelcomeMessage,
  EventMessage,
  NoEventsMessage,
  EventListMessage,
  RelationNotFound,
  MyBuddyBtn,
  EventLinkBtn,
  ActivateBtn,
  ShareTitleText,
  ShareNameText,
  ShareBudgetText,
  ShareLinkText,
  JoinedEventText,
  EmptyAgentText,
  AgentTitleText,
}

export const labels = {
  [LanguageCode.Ru]: {
    [LabelId.NoContent]: "no content",
    [LabelId.WelcomeMessage]: "welcome",
    [LabelId.EventMessage]: "event",
    [LabelId.NoEventsMessage]: "У вас нет событий",
    [LabelId.EventListMessage]: "Список последних событий",
    [LabelId.RelationNotFound]: "Событие не найдено",
    [LabelId.MyBuddyBtn]: "Кому я дарю подарок",
    [LabelId.EventLinkBtn]: "Поделиться ссылкой",
    [LabelId.ActivateBtn]: "Разыграть тайного санту!",
    [LabelId.ShareTitleText]: "Участвуй в розыгрыше тайного санты!",
    [LabelId.ShareNameText]: "Розыгрыш:",
    [LabelId.ShareBudgetText]: "Бюджет:",
    [LabelId.ShareLinkText]: "Присоединяйся!",
    [LabelId.JoinedEventText]: "Вы участвуете!",
    [LabelId.EmptyAgentText]: "Тайный санта не активирован!",
    [LabelId.AgentTitleText]: "Ваша цель:",
  },
  [LanguageCode.En]: {},
};
