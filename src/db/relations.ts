import { Pool } from "pg";
import { Logger } from "../logger";
import { RelationsDb } from "./sql/relations";

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
}