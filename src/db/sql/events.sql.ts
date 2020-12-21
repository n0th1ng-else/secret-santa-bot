const createTable = `
    CREATE TABLE IF NOT EXISTS events (
        event_id varchar(20) PRIMARY KEY,
        user_id varchar(20) NOT NULL,
        url varchar(100) UNIQUE NOT NULL,
        state varchar(20) NOT NULL,
        name text,
        budget varchar(100),
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
    );
`;

const insertRow = `
      INSERT INTO events(event_id, user_id, url, state, name, budget, created_at, updated_at) 
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING event_id, user_id, url, state, name, budget, created_at, updated_at;
    `;

const updateRow = `
      UPDATE events SET
        url=$1,
        state=$2,
        name=$3,
        budget=$4
      WHERE node_id=$4
      RETURNING event_id, user_id, url, state, name, budget, created_at, updated_at;
    `;

const getRows = `
      SELECT event_id, user_id, url, state, name, budget, created_at, updated_at 
      FROM events 
      WHERE url=$1 
      ORDER BY created_at;
    `;

export const EventsSql = {
  createTable,
  insertRow,
  updateRow,
  getRows,
};
