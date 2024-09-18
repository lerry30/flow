export const employee = `
    SELECT
        employees.id AS employee_id,
        employees.username,
        info.firstname,
        info.lastname,
        info.created_at
    FROM employees
    INNER JOIN info ON employees.info_id=info.id
    WHERE employees.username=?;
`;

export const employeeWithPassword = `
    SELECT
        employees.id AS employee_id,
        employees.username,
        employees.password,
        info.firstname,
        info.lastname,
        info.created_at
    FROM employees
    INNER JOIN info ON employees.info_id=info.id
    WHERE employees.username=?;
`;

export const players = `
    SELECT
        players.id AS player_id,
        players.status,
        players.last_updated,
        employees.username AS added_by,
        info.firstname,
        info.lastname
    FROM players
    INNER JOIN info ON players.info_id=info.id
    INNER JOIN employees ON players.added_by=employees.id
    ORDER BY players.last_updated DESC;
`;

export const player = `
    SELECT
        players.id AS player_id,
        players.status,
        employees.username AS added_by,
        info.firstname,
        info.lastname,
        info.created_at
    FROM players
    INNER JOIN info ON players.info_id=info.id
    INNER JOIN employees ON players.added_by=employees.id
    WHERE players.id=?;
`;

export const playerTransactions = `
    SELECT
        transactions.id AS transaction_id,
        transactions.units,
        transactions.action,
        transactions.prev_status,
        transactions.timestamp AS transaction_date,
        employees.username AS added_by 
    FROM transactions
    INNER JOIN employees ON transactions.added_by=employees.id
    WHERE transactions.player_id=?;
`;

export const transactions = 'SELECT * FROM transactions ORDER BY transactions.id DESC;';
export const username = 'SELECT username FROM employees WHERE username=?;';

export const search = `
    SELECT
        players.id AS player_id,
        players.status,
        players.last_updated,
        employees.username AS added_by,
        info.firstname,
        info.lastname
    FROM players
    INNER JOIN info ON players.info_id = info.id
    INNER JOIN employees ON players.added_by = employees.id
    WHERE info.firstname LIKE ? OR info.lastname LIKE ?
    ORDER BY players.id DESC;
`;

export const newInfo = 'INSERT INTO info (firstname, lastname) VALUES (?, ?);';
export const newEmployee = 'INSERT INTO employees (info_id, username, password) VALUES (?, ?, ?);';
export const newPlayer = 'INSERT INTO players (info_id, status, added_by) VALUES (?, ?, ?);';
export const newTransaction = `INSERT INTO transactions (player_id, units, action, prev_status, added_by) VALUES (?, ?, ?, ?, ?);`;

export const updateBalance = `
    UPDATE players
    SET status=?
    WHERE id=?;
`;
