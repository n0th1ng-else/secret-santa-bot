import { Pool } from "pg";
import { nanoid } from "nanoid";
import { WizardsSql } from "./wizards.sql";

export interface WizardRowScheme {
  wizard_id: string;
  user_id: string;
  event_id: string;
  step: string;
  created_at: Date;
  updated_at: Date;
}

export class WizardsDb {
  private initialized = false;

  constructor(private readonly pool: Pool) {}

  public init(): Promise<void> {
    const query = WizardsSql.createTable;
    const values = [];
    return this.pool.query(query, values).then(() => {
      this.initialized = true;
    });
  }

  public createRow(userId: string, step: string): Promise<WizardRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table wizards is not initialized yet")
      );
    }
    const query = WizardsSql.insertRow;
    const wizardId = nanoid(15);
    const eventId = nanoid(15);
    const createdAt = new Date();
    const updatedAt = createdAt;
    const values = [wizardId, userId, eventId, step, createdAt, updatedAt];
    return this.pool.query<WizardRowScheme>(query, values).then((queryData) => {
      const firstRow = queryData.rows.shift();
      if (!firstRow) {
        return Promise.reject(new Error("Unable to get created row info"));
      }
      return firstRow;
    });
  }

  public updateEvent(wizardId: string): Promise<WizardRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table wizards is not initialized yet")
      );
    }
    const query = WizardsSql.updateEvent;
    const eventId = nanoid(15);
    const updatedAt = new Date();
    const values = [eventId, updatedAt, wizardId];
    return this.pool.query<WizardRowScheme>(query, values).then((queryData) => {
      const firstRow = queryData.rows.shift();
      if (!firstRow) {
        return Promise.reject(new Error("Unable to get updated row info"));
      }
      return firstRow;
    });
  }

  public updateStep(wizardId: string, step: string): Promise<WizardRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table wizards is not initialized yet")
      );
    }
    const query = WizardsSql.updateStep;
    const updatedAt = new Date();
    const values = [step, updatedAt, wizardId];
    return this.pool.query<WizardRowScheme>(query, values).then((queryData) => {
      const firstRow = queryData.rows.shift();
      if (!firstRow) {
        return Promise.reject(new Error("Unable to get updated row info"));
      }
      return firstRow;
    });
  }

  public getRows(userId: string): Promise<WizardRowScheme[]> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table wizards is not initialized yet")
      );
    }
    const query = WizardsSql.getRows;
    const values = [userId];
    return this.pool
      .query<WizardRowScheme>(query, values)
      .then((queryData) => queryData.rows);
  }

  public getId(row: WizardRowScheme): string {
    return row.wizard_id;
  }
}
