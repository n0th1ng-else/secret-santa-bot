import { Pool } from "pg";
import { nanoid } from "nanoid";
import { EventsSql } from "./events.sql";

export interface EventRowScheme {
  event_id: string;
  user_id: string;
  url: string;
  state: string;
  name: string;
  budget: string;
  created_at: Date;
  updated_at: Date;
}

export class EventsDb {
  private initialized = false;

  constructor(private readonly pool: Pool) {}

  public init(): Promise<void> {
    const query = EventsSql.createTable;
    const values = [];
    return this.pool.query(query, values).then(() => {
      this.initialized = true;
    });
  }

  public createRow(
    eventId: string,
    userId: string,
    name: string,
    state: string
  ): Promise<EventRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table events is not initialized yet")
      );
    }

    const url = nanoid(15);
    const query = EventsSql.insertRow;
    const budget = "";
    const createdAt = new Date();
    const updatedAt = createdAt;

    const values = [
      eventId,
      userId,
      url,
      state,
      name,
      budget,
      createdAt,
      updatedAt,
    ];
    return this.pool.query<EventRowScheme>(query, values).then((queryData) => {
      const firstRow = queryData.rows.shift();
      if (!firstRow) {
        return Promise.reject(new Error("Unable to get created row info"));
      }
      return firstRow;
    });
  }

  public updateRow(
    eventId: string,
    url: string,
    name: string,
    state: string,
    budget: number
  ): Promise<EventRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table events is not initialized yet")
      );
    }
    const query = EventsSql.updateRow;
    const updatedAt = new Date();
    const values = [url, state, name, budget, updatedAt, eventId];
    return this.pool.query<EventRowScheme>(query, values).then((queryData) => {
      const firstRow = queryData.rows.shift();
      if (!firstRow) {
        return Promise.reject(new Error("Unable to get updated row info"));
      }
      return firstRow;
    });
  }

  public getRows(url: string): Promise<EventRowScheme[]> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table events is not initialized yet")
      );
    }
    const query = EventsSql.getRows;
    const values = [url];
    return this.pool
      .query<EventRowScheme>(query, values)
      .then((queryData) => queryData.rows);
  }

  public getRow(eventId: string): Promise<EventRowScheme | undefined> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table events is not initialized yet")
      );
    }

    const query = EventsSql.getRow;
    const values = [eventId];
    return this.pool
      .query<EventRowScheme>(query, values)
      .then((queryData) => queryData.rows.shift());
  }

  public setEventState(eventId: string, state: string) {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table events is not initialized yet")
      );
    }

    const query = EventsSql.setRowState;
    const updatedAt = new Date();
    const values = [state, updatedAt, eventId];

    return this.pool
      .query<EventRowScheme>(query, values)
      .then((queryData) => queryData.rows.shift());
  }

  public getId(row: EventRowScheme): string {
    return row.event_id;
  }
}
