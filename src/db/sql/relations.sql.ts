const createTable = `
    CREATE TABLE IF NOT EXISTS relations (
        relation_id varchar(20) PRIMARY KEY,
        event_id varchar(20) NOT NULL,
        user_id varchar(20) NOT NULL,
        agent_id varchar(20),
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
    );
`;

const insertRow = `
      INSERT INTO relations(relation_id, event_id, user_id, created_at, updated_at) 
      VALUES($1, $2, $3, $4, $5)
      RETURNING relation_id, event_id, user_id, agent_id, created_at, updated_at;
    `;

const updateRow = `
      UPDATE relations SET
                           agent_id=$1,
                           updated_at=$2
      WHERE relation_id=$3
      RETURNING relation_id, event_id, user_id, agent_id, created_at, updated_at;
    `;

const getEvents = `
      SELECT relation_id, event_id, user_id, agent_id, created_at, updated_at 
      FROM relations 
      WHERE user_id=$1 
      ORDER BY created_at;
`;

const getUsers = `
      SELECT relation_id, event_id, user_id, agent_id, created_at, updated_at 
      FROM relations 
      WHERE event_id=$1 
      ORDER BY created_at;
`;

const getAgent = `
      SELECT relation_id, event_id, user_id, agent_id, created_at, updated_at 
      FROM relations 
      WHERE user_id=$1 AND event_id=$2
      ORDER BY created_at;`;

export const RelationsSql = {
  createTable,
  insertRow,
  updateRow,
  getEvents,
  getUsers,
  getAgent,
};
