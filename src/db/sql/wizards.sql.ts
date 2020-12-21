const createTable = `
    CREATE TABLE IF NOT EXISTS wizards (
        wizard_id varchar(20) PRIMARY KEY,
        user_id varchar(20) NOT NULL,
        event_id varchar(20) NOT NULL,
        step varchar(20) NOT NULL,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
    );
`;

const insertRow = `
      INSERT INTO wizards(wizard_id, user_id, event_id, step, created_at, updated_at) 
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING wizard_id, user_id, event_id, step, created_at, updated_at;
    `;

const updateRow = `
      UPDATE wizards SET
        event_id=$1,
        step=$2,
        updated_at=$3
      WHERE user_id=$4
      RETURNING wizard_id, user_id, event_id, step, created_at, updated_at;
    `;

const getRows = `
      SELECT wizard_id, user_id, event_id, step, created_at, updated_at 
      FROM wizards 
      WHERE user_id=$1 
      ORDER BY created_at;
    `;

export const WizardsSql = {
  createTable,
  insertRow,
  updateRow,
  getRows,
};
