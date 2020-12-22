import { Pool } from "pg";
import { Logger } from "../logger";
import { RelationRowScheme, RelationsDb } from "./sql/relations";

const logger = new Logger("postgres-relations");

export class RelationsClient {
  private readonly db: RelationsDb;

  constructor(pool: Pool) {
    this.db = new RelationsDb(pool);
  }

  public init(): Promise<void> {
    logger.info("Initializing the table");
    return this.db
      .init()
      .then(() =>
        logger.info(`Table ${Logger.y("relations")} has been initialized`)
      )
      .catch((err) => {
        logger.error(`Unable to initialize ${Logger.y("relations")} table`);
        throw err;
      });
  }

  public createRow(
    eventId: string,
    userId: string
  ): Promise<RelationRowScheme> {
    return this.getRelation(eventId, userId).then((row) => {
      if (row) {
        return row;
      }

      return this.db.createRow(eventId, userId);
    });
  }

  public getRelation(
    eventId: string,
    userId: string
  ): Promise<RelationRowScheme | undefined> {
    return this.db.getRow(eventId, userId);
  }

  public getEvents(userId: string) {
    return this.db.getEvents(userId);
  }
}
