import { Pool } from "pg";
import { Logger } from "../logger";
import { EventRowScheme, EventsDb } from "./sql/events";

const logger = new Logger("postgres-events");

export enum EventState {
  Draft = "draft",
  Active = "active",
  Locked = "locked",
  Closed = "closed",
}

export class EventsClient {
  private readonly db: EventsDb;

  constructor(pool: Pool) {
    this.db = new EventsDb(pool);
  }

  public init(): Promise<void> {
    logger.info("Initializing the table");
    return this.db
      .init()
      .then(() =>
        logger.info(`Table ${Logger.y("events")} has been initialized`)
      )
      .catch((err) => {
        logger.error(`Unable to initialize ${Logger.y("events")} table`);
        throw err;
      });
  }

  private createRow(eventId: string): Promise<EventRowScheme> {
    logger.info("Creating a new row");
    return this.db
      .createRow(eventId, EventState.Draft)
      .then((row) => {
        const nodeId = this.db.getId(row);
        logger.info(`The row with id=${nodeId} has been created`);
        return row;
      })
      .catch((err) => {
        logger.error("Unable to create a row");
        throw err;
      });
  }

  private getRows(url: string): Promise<EventRowScheme[]> {
    logger.info(`Looking for rows for url=${url}`);
    return this.db
      .getRows(url)
      .then((rows) => {
        logger.info(`Row search has been executed for url=${url}`);
        return rows;
      })
      .catch((err) => {
        logger.error(`Unable provide a search for url=${url}`);
        throw err;
      });
  }
}
