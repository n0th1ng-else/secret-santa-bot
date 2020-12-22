const createTable = `
      CREATE TABLE IF NOT EXISTS users (
        user_id varchar(20) PRIMARY KEY,
        user_name text NOT NULL,
        user_login varchar(256),
        chat_id bigint UNIQUE NOT NULL,
        lang_id varchar(20) NOT NULL,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      );
    `;

const insertRow = `
      INSERT INTO users(user_id, user_name, user_login, chat_id, lang_id, created_at, updated_at) 
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, user_name, user_login, chat_id, lang_id, created_at, updated_at;
    `;

const updateRow = `
      UPDATE users SET
        user_name=$1,
        user_login=$2,
        lang_id=$3,
        updated_at=$4
      WHERE usage_id=$5
      RETURNING user_id, user_name, user_login, chat_id, lang_id, created_at, updated_at;
    `;

const getRows = `
      SELECT user_id, user_name, user_login, chat_id, lang_id, created_at, updated_at 
      FROM users 
      WHERE chat_id=$1 
      ORDER BY created_at;
    `;

const getUser = `
      SELECT user_id, user_name, user_login, chat_id, lang_id, created_at, updated_at 
      FROM users 
      WHERE user_id=$1 
      ORDER BY created_at;
    `;

export const UsersSql = {
  createTable,
  insertRow,
  updateRow,
  getRows,
  getUser,
};
