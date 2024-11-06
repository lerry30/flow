export const playerTransactions = `
    SELECT
        transactions.id AS transactionId,
        transactions.units,
        transactions.note,
        transactions.action,
        transactions.timestamp AS createdAt,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'historyId', transaction_histories.id,
                'modifiedByEmployee', JSON_OBJECT(
                    'employeeId', employees.id,
                    'username', employees.username
                ),
                'action', transaction_histories.action,
                'modifiedAt', transaction_histories.timestamp
            )
        ) AS history
    FROM transactions
    LEFT JOIN transaction_histories ON transaction_histories.transaction_id = transactions.id
    LEFT JOIN employees ON transaction_histories.modified_by = employees.id
    WHERE transactions.player_id = ?
    GROUP BY transactions.id;
`;

export const transactions = `
    SELECT
        transactions.id AS transactionId,
        transactions.units,
        transactions.note,
        transactions.action,
        transactions.timestamp AS createdAt,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'historyId', transaction_histories.id,
                'action', transaction_histories.action
            )
        ) AS history
    FROM transactions
    LEFT JOIN transaction_histories ON transaction_histories.transaction_id = transactions.id
    GROUP BY transactions.id
    ORDER BY transactions.id DESC;
`;

export const newTransaction = `INSERT INTO transactions (player_id, units, note, action) VALUES (?, ?, ?, ?);`;
