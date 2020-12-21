import { BotCommand, BotMessageModel, TelegramButtonType } from "./types";
import { telegramBotName } from "../env";
import { TgCallbackQuery, TgChatType, TgMessage } from "./api/types";
import { LanguageCode } from "../text/types";

export function isHelloMessage(
  model: BotMessageModel,
  msg: TgMessage
): boolean {
  return isCommandMessage(model, msg, BotCommand.Start);
}

function isCommandMessage(
  model: BotMessageModel,
  msg: TgMessage,
  command: BotCommand
): boolean {
  if (!msg || !msg.text) {
    return false;
  }

  if (msg.text === command) {
    return true;
  }

  if (!telegramBotName) {
    return false;
  }

  return (
    model.isGroup &&
    msg.text.toLowerCase() === `${command}@${telegramBotName.toLowerCase()}`
  );
}

export function isMessageSupported(msg: TgMessage): boolean {
  const isBot = !!(msg.from && msg.from.is_bot);
  return !isBot;
}

export function getChatId(msg: TgMessage): number {
  return msg.chat.id;
}

export function isChatGroup(msg: TgMessage): boolean {
  return msg.chat.type !== TgChatType.Private;
}

export function getUserName(msg: TgMessage): string {
  const fromUserName = msg.from && msg.from.username;
  return fromUserName || getFullUserName(msg) || getGroupName(msg) || "";
}

export function getFullUserName(msg: TgMessage): string {
  const fromUserFullName =
    msg.from &&
    [msg.from.first_name, msg.from.last_name].filter((k) => k).join(" ");

  return fromUserFullName || "";
}

export function getGroupName(msg: TgMessage): string {
  const chatName = msg.chat.title;
  const chatFullName = [msg.chat.first_name, msg.chat.last_name]
    .filter((k) => k)
    .join(" ");
  return chatName || chatFullName || "";
}

export function getUserLanguage(msg: TgMessage): LanguageCode {
  const msgLang = getRawUserLanguage(msg);
  const globalPart = msgLang.slice(0, 2).toLowerCase();

  if (globalPart === "ru") {
    return LanguageCode.Ru;
  }

  return LanguageCode.En;
}

export function getRawUserLanguage(msg: TgMessage | TgCallbackQuery): string {
  return (msg.from && msg.from.language_code) || "";
}

export function getLanguageByText(
  lang: string,
  throwOnError = false
): LanguageCode {
  switch (lang) {
    case LanguageCode.Ru:
      return LanguageCode.Ru;
    case LanguageCode.En:
      return LanguageCode.En;
    default: {
      if (!throwOnError) {
        return LanguageCode.En;
      }

      throw new Error("Language code is not recognized");
    }
  }
}

export function getButtonTypeByText(type: string): TelegramButtonType {
  switch (type) {
    default:
      return TelegramButtonType.Unknown;
  }
}