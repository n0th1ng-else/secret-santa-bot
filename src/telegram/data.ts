import { BotCommand, BotCommandOption } from "./types";
import { LabelId } from "../text/labels";

export const botCommands: BotCommandOption[] = [
  new BotCommandOption(BotCommand.Event, LabelId.EventCommandDescription),
  new BotCommandOption(BotCommand.List, LabelId.ListCommandDescription),
  new BotCommandOption(BotCommand.Start, LabelId.StartCommandDescription),
];
