import { Pool } from "pg";
import { nanoid } from "nanoid";
import { UsersSql } from "./users.sql";

export interface UserRowScheme {
  user_id: string;
  user_name: string;
  user_login: string;
  chat_id: number;
  lang_id: string;
  created_at: Date;
  updated_at: Date;
}

export class UsersDb {
  private initialized = false;

  constructor(private readonly pool: Pool) {}

  public init(): Promise<void> {
    const query = UsersSql.createTable;
    const values = [];
    return this.pool.query(query, values).then(() => {
      this.initialized = true;
    });
  }

  public createRow(
    chatId: number,
    userName: string,
    userLogin: string,
    langId: string
  ): Promise<UserRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table users is not initialized yet")
      );
    }

    const query = UsersSql.insertRow;
    const userId = nanoid(15);
    const createdAt = new Date();
    const updatedAt = createdAt;
    const values = [
      userId,
      userName,
      userLogin,
      chatId,
      langId,
      createdAt,
      updatedAt,
    ];
    return this.pool.query<UserRowScheme>(query, values).then((queryData) => {
      const firstRow = queryData.rows.shift();
      if (!firstRow) {
        return Promise.reject(new Error("Unable to get created row info"));
      }
      return firstRow;
    });
  }

  public updateRow(
    userId: string,
    userName: string,
    userLogin: string,
    chatId: number,
    langId: string
  ): Promise<UserRowScheme> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table users is not initialized yet")
      );
    }
    const query = UsersSql.updateRow;
    const updatedAt = new Date();
    const values = [userName, userLogin, chatId, langId, updatedAt, userId];
    return this.pool.query<UserRowScheme>(query, values).then((queryData) => {
      const firstRow = queryData.rows.shift();
      if (!firstRow) {
        return Promise.reject(new Error("Unable to get updated row info"));
      }
      return firstRow;
    });
  }

  public getRows(chatId: number): Promise<UserRowScheme[]> {
    if (!this.initialized) {
      return Promise.reject(
        new Error("The table usages is not initialized yet")
      );
    }

    const query = UsersSql.getRows;
    const values = [chatId];
    return this.pool
      .query<UserRowScheme>(query, values)
      .then((queryData) => queryData.rows);
  }

  public getId(row: UserRowScheme): string {
    return row.user_id;
  }
}
