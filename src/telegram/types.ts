import {
  getButtonTypeByText,
  getChatId,
  getFullUserName,
  getGroupName,
  getRawUserLanguage,
  getUserLanguage,
  getUserLogin,
  getUserName,
  isChatGroup,
} from "./helpers";
import { LanguageCode } from "../text/types";
import { nanoid } from "nanoid";
import { Logger } from "../logger";
import { LabelId } from "../text/labels";
import { TextModel } from "../text";
import { TgInlineKeyboardButton, TgMessage } from "./api/types";
import { AnalyticsData } from "../analytics/api/types";

export enum BotCommand {
  Start = "/start",
  Event = "/event",
  List = "/list",
}

export class BotMessageModel {
  public readonly id: number;
  public readonly text: string;
  public readonly chatId: number;
  public readonly isGroup: boolean;
  public readonly userName: string;
  public readonly userLogin: string;
  public readonly fullUserName: string;
  public readonly groupName: string;
  public readonly userLanguage: LanguageCode;
  public readonly analytics: AnalyticsData;

  constructor(msg: TgMessage, analytics: AnalyticsData) {
    this.id = msg.message_id;
    this.text = msg.text || "";
    this.chatId = getChatId(msg);
    this.isGroup = isChatGroup(msg);
    this.userName = getUserName(msg);
    this.userLogin = getUserLogin(msg);
    this.fullUserName = getFullUserName(msg);
    this.groupName = getGroupName(msg);
    this.userLanguage = getUserLanguage(msg);
    this.analytics = analytics
      .setId(this.chatId)
      .setLang(getRawUserLanguage(msg));
  }

  public get name(): string {
    return this.isGroup ? this.groupName : this.userName;
  }
}

export interface MessageOptions {
  lang: LanguageCode;
  options?: TgInlineKeyboardButton[][];
}

export class TelegramMessagePrefix {
  constructor(
    public readonly chatId: number,
    public readonly id = nanoid(10)
  ) {}

  public getPrefix(): string {
    return `[Id=${Logger.y(this.id)}] [ChatId=${Logger.y(this.chatId)}]`;
  }
}

export class BotLangData {
  constructor(
    public readonly langId: LanguageCode,
    public readonly prefix: TelegramMessagePrefix
  ) {}
}

export class BotCommandOption {
  public readonly description: string;

  constructor(public readonly command: BotCommand, textId: LabelId) {
    const textLib = new TextModel();
    this.description = textLib.t(textId, LanguageCode.En);
  }
}

export enum TelegramButtonType {
  Unknown = "u",
  Event = "e",
  Delivery = "d",
  EventLink = "el",
  Activate = "a",
  Participants = "p",
}

export class TelegramButtonModel {
  public static fromDto(dtoString: string): TelegramButtonModel {
    const dto: BotButtonDto = JSON.parse(dtoString);
    const type = getButtonTypeByText(dto.i);
    return new TelegramButtonModel(type, dto.v, dto.l);
  }

  constructor(
    public readonly id: TelegramButtonType,
    public readonly value: string,
    public readonly logPrefix: string
  ) {}

  public getDtoString(): string {
    const dto: BotButtonDto = {
      i: this.id,
      l: this.logPrefix,
      v: this.value,
    };

    return JSON.stringify(dto);
  }
}

interface BotButtonDto {
  i: string; // type Identifier
  l: string; // log prefix
  v: string; // value
}
