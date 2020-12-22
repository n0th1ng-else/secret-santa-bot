import { TelegramApi } from "../api";
import { StartAction } from "./start";
import { DbClient } from "../../db";
import { TgCallbackQuery } from "../api/types";
import { AnalyticsData } from "../../analytics/api/types";
import { TelegramButtonModel, TelegramButtonType } from "../types";
import { Logger } from "../../logger";
import { collectAnalytics } from "../../analytics";
import { CoreAction } from "./common";
import { EventAction } from "./event";
import { ListAction } from "./list";

const logger = new Logger("telegram-bot");

export class BotActions {
  public readonly start: StartAction;
  public readonly core: CoreAction;
  public readonly event: EventAction;
  public readonly list: ListAction;

  constructor(stat: DbClient, bot: TelegramApi) {
    this.core = new CoreAction(stat, bot);
    this.start = new StartAction(stat, bot);
    this.event = new EventAction(stat, bot);
    this.list = new ListAction(stat, bot);
  }

  public handleCallback(
    msg: TgCallbackQuery,
    analytics: AnalyticsData
  ): Promise<void> {
    const message = msg.message;
    const data = msg.data;

    if (!message) {
      const errorMessage = "No message passed in callback query";
      const msgError = new Error(errorMessage);
      logger.error(msgError.message, msgError);
      analytics.setError(errorMessage);
      return collectAnalytics(analytics.setCommand("Callback query"));
    }

    if (!data) {
      const errorMessage = "No data passed in callback query";
      const msgError = new Error(errorMessage);
      logger.error(msgError.message, msgError);
      analytics.setError(errorMessage);
      return collectAnalytics(analytics.setCommand("Callback query"));
    }

    return Promise.resolve()
      .then(() => {
        const button = TelegramButtonModel.fromDto(data);

        switch (button.id) {
          case TelegramButtonType.Event:
            return this.list.runCallback(message, button, analytics);
          default:
            throw new Error("Unknown type passed in callback query");
        }
      })
      .catch((err) => {
        const errorMessage = "Failed to execute callback query";
        logger.error(errorMessage, err);
        analytics.setError(errorMessage);
        return collectAnalytics(analytics.setCommand("Callback query"));
      });
  }
}
