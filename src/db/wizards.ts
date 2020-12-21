import { Pool } from "pg";
import { Logger } from "../logger";
import { WizardRowScheme, WizardsDb } from "./sql/wizards";

const logger = new Logger("postgres-wizards");

export enum WizardStep {
  None = "none",
  Name = "name",
  Url = "url",
}

export class WizardsClient {
  private readonly db: WizardsDb;

  constructor(pool: Pool) {
    this.db = new WizardsDb(pool);
  }

  public init(): Promise<void> {
    logger.info("Initializing the table");
    return this.db
      .init()
      .then(() =>
        logger.info(`Table ${Logger.y("wizards")} has been initialized`)
      )
      .catch((err) => {
        logger.error(`Unable to initialize ${Logger.y("wizards")} table`);
        throw err;
      });
  }

  private createRow(userId: string): Promise<WizardRowScheme> {
    logger.info("Creating a new row");
    return this.db
      .createRow(userId, WizardStep.Name)
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
}
