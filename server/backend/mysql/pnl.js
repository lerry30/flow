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
            xcashflows.id,
            xcashflows.amount,
            xcashflows.note,
            xcashflows.entry_date AS date,
            xcashflows.entry_time AS time,
            employees.username,
            'xcashflow' AS type
        FROM xcashflows
        INNER JOIN employees ON employees.id = xcashflows.added_by
        WHERE xcashflows.entry_date = ?
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
        xcashflows.id,
        xcashflows.amount,
        xcashflows.note,
        xcashflows.entry_date as date
    FROM xcashflows WHERE id=?`;

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
    FROM xcashflows
);`;

export const lastNet = `
    WITH latest_dates AS (
        SELECT entry_date FROM profits
        UNION
        SELECT entry_date FROM losses
        UNION
        SELECT entry_date FROM xcashflows
    )
    , latest_shared_date AS (
        SELECT MAX(entry_date) as max_date 
        FROM latest_dates
    )
    (
        SELECT
            revenue AS amount,
            'profit' AS type,
            entry_date
        FROM profits
        WHERE entry_date = (SELECT max_date FROM latest_shared_date)
    )
    UNION ALL
    (
        SELECT
            expense AS amount,
            'loss' AS type,
            entry_date
        FROM losses
        WHERE entry_date = (SELECT max_date FROM latest_shared_date)
    )
    UNION ALL
    (
        SELECT
            amount,
            'xcashflow' AS type,
            entry_date
        FROM xcashflows
        WHERE entry_date = (SELECT max_date FROM latest_shared_date)
    );
`;

export const newRevenue = `INSERT INTO profits (revenue, revenue_note, entry_date, entry_time, added_by) VALUES (?, ?, ?, ?, ?)`;
export const newExpense = `INSERT INTO losses (expense, expense_note, entry_date, entry_time, added_by) VALUES (?, ?, ?, ?, ?)`;
export const newXCashFlow = `INSERT INTO xcashflows (amount, note, entry_date, entry_time, added_by) VALUES (?, ?, ?, ?, ?)`;

export const updateRevenue = 'UPDATE profits SET revenue=?, revenue_note=?, added_by=?, entry_time=? WHERE id=?;';
export const updateExpense = 'UPDATE losses SET expense=?, expense_note=?, added_by=?, entry_time=? WHERE id=?;';
export const updateXCashFlow = 'UPDATE xcashflows SET amount=?, note=?, added_by=?, entry_time=? WHERE id=?;';

export const deleteRevenue = 'DELETE FROM profits WHERE id=?;';
export const deleteExpense = 'DELETE FROM losses WHERE id=?;';
export const deleteXCashFlow = 'DELETE FROM xcashflows WHERE id=?;';

