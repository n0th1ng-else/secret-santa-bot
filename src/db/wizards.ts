import { Pool } from "pg";
import { Logger } from "../logger";
import { WizardRowScheme, WizardsDb } from "./sql/wizards";

const logger = new Logger("postgres-wizards");

export enum WizardStep {
  None = "none",
  Name = "name",
  Url = "url",
  Budget = "budget",
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

  public createRow(userId: string): Promise<WizardRowScheme> {
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

  public createRowIfNotExists(userId: string): Promise<WizardRowScheme> {
    return this.getRows(userId).then((rows) => {
      const row = rows.shift();
      if (rows.length) {
        throw new Error("smething went wrong");
      }

      if (row) {
        return this.updateEventId(row.wizard_id);
      }

      return this.createRow(userId);
    });
  }

  public getRows(userId: string): Promise<WizardRowScheme[]> {
    logger.info(`Looking for rows for userId=${userId}`);
    return this.db
      .getRows(userId)
      .then((rows) => {
        logger.info(`Row search has been executed for userId=${userId}`);
        return rows;
      })
      .catch((err) => {
        logger.error(`Unable provide a search for userId=${userId}`);
        throw err;
      });
  }

  public resetRowState(wizardId: string): Promise<WizardRowScheme> {
    return this.db.updateStep(wizardId, WizardStep.None);
  }

  public updateEventId(wizardId: string) {
    return this.db.updateEvent(wizardId);
  }
}
