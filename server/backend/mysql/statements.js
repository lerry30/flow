export const info = `
    SELECT
        id,
        firstname,
        lastname,
        created_at
    FROM info
    WHERE firstname=? AND lastname=?;
`;

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
        transactions.note,
        transactions.action,
        transactions.timestamp AS transaction_date,
        transactions.deleted,
        employees.username AS added_by 
    FROM transactions
    INNER JOIN employees ON transactions.added_by=employees.id
    WHERE transactions.player_id=?;
`;

export const transactions = 'SELECT * FROM transactions ORDER BY transactions.id DESC;';
export const username = 'SELECT username FROM employees WHERE username=?;';

export const getPnL = `
    (
        SELECT 
            profits.id,
            profits.revenue AS amount,
            profits.revenue_note AS note,
            profits.entry_date AS date,
            profits.entry_time AS time,
            employees.username,
            'profit' AS type
        FROM profits
        INNER JOIN employees ON employees.id = profits.added_by
        WHERE profits.entry_date = ?
    )
    UNION ALL
    (
        SELECT 
            losses.id,
            losses.expense AS amount,
            losses.expense_note AS note,
            losses.entry_date AS date,
            losses.entry_time AS time,
            employees.username,
            'loss' AS type
        FROM losses
        INNER JOIN employees ON employees.id = losses.added_by
        WHERE losses.entry_date = ?
    )
    UNION ALL
    (
        SELECT 
            xcashflow.id,
            xcashflow.amount,
            xcashflow.note,
            xcashflow.entry_date AS date,
            xcashflow.entry_time AS time,
            employees.username,
            'x' AS type
        FROM xcashflow
        INNER JOIN employees ON employees.id = xcashflow.added_by
        WHERE xcashflow.entry_date = ?
    )
    ORDER BY date DESC, id DESC;
`;

// single row
export const revenue = `
    SELECT 
        profits.id,
        profits.revenue as amount,
        profits.revenue_note as note,
        profits.entry_date as date
    FROM profits WHERE id=?`;
// single row
export const expense = `
    SELECT
        losses.id,
        losses.expense as amount,
        losses.expense_note as note,
        losses.entry_date as date
    FROM losses WHERE id=?`;
// single row
export const xcashflow = `
    SELECT
        xcashflow.id,
        xcashflow.amount,
        xcashflow.note,
        xcashflow.entry_date as date
    FROM xcashflow WHERE id=?`;

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

export const monthOperations = `
    SELECT 
        entry_date 
    FROM profits 
    WHERE DATE_FORMAT(entry_date, '%Y-%m') = ?

    UNION

    SELECT 
        entry_date 
    FROM losses 
    WHERE DATE_FORMAT(entry_date, '%Y-%m') = ?

    ORDER BY entry_date;
`;

export const overall = `(
    SELECT
        revenue AS amount,
        'profit' AS type
    FROM profits
)
UNION ALL
(
    SELECT
        expense AS amount,
        'loss' AS type
    FROM losses
)
UNION ALL
(
    SELECT
        amount,
        'xcashflow' AS type
    FROM xcashflow
);`;

export const lastNet = `(
    SELECT
        revenue AS amount,
        'profit' AS type,
        entry_date
    FROM profits
    WHERE entry_date = (SELECT MAX(entry_date) FROM profits)
)
UNION ALL
(
    SELECT
        expense AS amount,
        'loss' AS type,
        entry_date
    FROM losses
    WHERE entry_date = (SELECT MAX(entry_date) FROM losses)
)
UNION ALL
(
    SELECT
        amount,
        'xcashflow' AS type,
        entry_date
    FROM xcashflow
    WHERE entry_date = (SELECT MAX(entry_date) FROM xcashflow)
);`;

export const newInfo = 'INSERT INTO info (firstname, lastname) VALUES (?, ?);';
export const newEmployee = 'INSERT INTO employees (info_id, username, password) VALUES (?, ?, ?);';
export const newPlayer = 'INSERT INTO players (info_id, status, added_by) VALUES (?, ?, ?);';
export const newTransaction = `INSERT INTO transactions (player_id, units, note, action, added_by) VALUES (?, ?, ?, ?, ?);`;
export const newRevenue = `INSERT INTO profits (revenue, revenue_note, entry_date, entry_time, added_by) VALUES (?, ?, ?, ?, ?)`;
export const newExpense = `INSERT INTO losses (expense, expense_note, entry_date, entry_time, added_by) VALUES (?, ?, ?, ?, ?)`;
export const newXCashFlow = `INSERT INTO xcashflow (amount, note, entry_date, entry_time, added_by) VALUES (?, ?, ?, ?, ?)`;

export const updateBalance = `
    UPDATE players
    SET status=?
    WHERE id=?;
`;

export const updateRevenue = 'UPDATE profits SET revenue=?, revenue_note=?, added_by=?, entry_time=? WHERE id=?;';
export const updateExpense = 'UPDATE losses SET expense=?, expense_note=?, added_by=?, entry_time=? WHERE id=?;';
export const updateXCashFlow = 'UPDATE xcashflow SET amount=?, note=?, added_by=?, entry_time=? WHERE id=?;';
export const updateTransactionState = 'UPDATE transactions SET deleted=? WHERE id=?;';

export const deleteRevenue = 'DELETE FROM profits WHERE id=?;';
export const deleteExpense = 'DELETE FROM losses WHERE id=?;';
export const deleteXCashFlow = 'DELETE FROM xcashflow WHERE id=?;';
