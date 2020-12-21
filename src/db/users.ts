import { Pool } from "pg";
import { Logger } from "../logger";
import { LanguageCode } from "../text/types";
import { UserRowScheme, UsersDb } from "./sql/users";
import { getLanguageByText } from "../telegram/helpers";

const logger = new Logger("postgres-users");

export class UsersClient {
  private readonly db: UsersDb;

  constructor(pool: Pool) {
    this.db = new UsersDb(pool);
  }

  public init(): Promise<void> {
    logger.info("Initializing the table");
    return this.db
      .init()
      .then(() =>
        logger.info(`Table ${Logger.y("users")} has been initialized`)
      )
      .catch((err) => {
        logger.error(`Unable to initialize ${Logger.y("users")} table`);
        throw err;
      });
  }

  public getLangId(
    chatId: number,
    userName: string,
    userLogin: string,
    langId: LanguageCode
  ): Promise<LanguageCode> {
    return this.getRows(chatId)
      .then((rows) => {
        const row = rows.shift();
        if (row) {
          return row;
        }

        return this.createRow(chatId, userName, userLogin, langId);
      })
      .then((row) => getLanguageByText(row.lang_id));
  }

  private createRow(
    chatId: number,
    userName = "",
    userLogin = "",
    langId: LanguageCode
  ): Promise<UserRowScheme> {
    logger.info("Creating a new row");
    return this.db
      .createRow(chatId, userName, userLogin, langId)
      .then((row) => {
        const usageId = this.db.getId(row);
        logger.info(`The row with id=${usageId} has been created`);
        return row;
      })
      .catch((err) => {
        logger.error("Unable to create a row");
        throw err;
      });
  }

  private getRows(chatId: number): Promise<UserRowScheme[]> {
    logger.info(`Looking for rows for chatId=${chatId}`);
    return this.db
      .getRows(chatId)
      .then((rows) => {
        logger.info(`Row search has been executed for chatId=${chatId}`);
        return rows;
      })
      .catch((err) => {
        logger.error(`Unable provide a search for chatId=${chatId}`);
        throw err;
      });
  }
}
