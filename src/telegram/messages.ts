import { LanguageCode } from "../text/types";
import { UserRowScheme } from "../db/sql/users";
import { EventRowScheme } from "../db/sql/events";
import { TextModel } from "../text";
import { LabelId } from "../text/labels";

const text = new TextModel();

export const formEventDetails = (
  lang: LanguageCode,
  event: EventRowScheme,
  withUrl = false
): string => {
  const name = text.t(LabelId.ShareNameText, lang);
  const budget = text.t(LabelId.ShareBudgetText, lang);
  const link = text.t(LabelId.ShareLinkText, lang);

  const url = `t.me/SantaAnonBot?start=${event.url}`;

  const header = `<code>${name}</code> <b>${event.name}</b>`;
  const money = `<code>${budget}</code> <b>${event.budget}</b>`;
  const footer = `<code>${link}</code> ${url}`;

  const messages = [header];
  if (event.budget) {
    messages.push(money);
  }

  if (withUrl) {
    messages.push(footer);
  }

  return messages.join("\n");
};

export const formUserDetails = (
  lang: LanguageCode,
  user: UserRowScheme
): string => {
  const name = `<b><i>${user.user_name}</i></b>`;
  return user.user_login ? `${name} (@${user.user_login})` : name;
};
