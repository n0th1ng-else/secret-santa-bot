import { Pool } from "pg";
import { nanoid } from "nanoid";
import { RelationsSql } from "./relations.sql";

export interface RelationRowScheme {
  relation_id: string;
  event_id: string;
  user_id: string;
  agent_id?: string;
  created_at: Date;
  updated_at: Date;
}

export class RelationsDb {
  private initialized = false;

  constructor(private readonly pool: Pool) {}

  public init(): Promise<void> {
    const query = RelationsSql.createTable;
    const values = [];
    return this.pool.query(query, values).then(() => {
      this.initialized = true;
    });
  }

  public createRow(
    userId: string,
    eventId: string
  ): Promise<RelationRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table relations is not initialized yet")
      );
    }
    const query = RelationsSql.insertRow;
    const relationId = nanoid(15);
    const createdAt = new Date();
    const updatedAt = createdAt;
    const values = [relationId, eventId, userId, createdAt, updatedAt];
    return this.pool
      .query<RelationRowScheme>(query, values)
      .then((queryData) => {
        const firstRow = queryData.rows.shift();
        if (!firstRow) {
          return Promise.reject(new Error("Unable to get created row info"));
        }
        return firstRow;
      });
  }

  public updateRow(
    relationId: string,
    agentId: string
  ): Promise<RelationRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table relations is not initialized yet")
      );
    }
    const query = RelationsSql.updateRow;
    const updatedAt = new Date();
    const values = [agentId, updatedAt, relationId];
    return this.pool
      .query<RelationRowScheme>(query, values)
      .then((queryData) => {
        const firstRow = queryData.rows.shift();
        if (!firstRow) {
          return Promise.reject(new Error("Unable to get updated row info"));
        }
        return firstRow;
      });
  }

  public getUsers(eventId: string): Promise<RelationRowScheme[]> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table relations is not initialized yet")
      );
    }
    const query = RelationsSql.getUsers;
    const values = [eventId];
    return this.pool
      .query<RelationRowScheme>(query, values)
      .then((queryData) => queryData.rows);
  }

  public getEvents(userId: string): Promise<RelationRowScheme[]> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table relations is not initialized yet")
      );
    }
    const query = RelationsSql.getEvents;
    const values = [userId];
    return this.pool
      .query<RelationRowScheme>(query, values)
      .then((queryData) => queryData.rows);
  }

  public getAgent(
    userId: string,
    eventId: string
  ): Promise<RelationRowScheme[]> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table relations is not initialized yet")
      );
    }
    const query = RelationsSql.getAgent;
    const values = [userId, eventId];
    return this.pool
      .query<RelationRowScheme>(query, values)
      .then((queryData) => queryData.rows);
  }

  public getId(row: RelationRowScheme): string {
    return row.relation_id;
  }
}