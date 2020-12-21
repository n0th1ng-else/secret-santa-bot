import { LanguageCode } from "./types";

export enum LabelId {
  NoContent,
  WelcomeMessage,
  EventMessage,
}

export const labels = {
  [LanguageCode.Ru]: {
    [LabelId.NoContent]: "no content",
    [LabelId.WelcomeMessage]: "welcome",
    [LabelId.EventMessage]: "event",
  },
  [LanguageCode.En]: {},
};
