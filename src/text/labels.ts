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
  },
  [LanguageCode.En]: {},
};
