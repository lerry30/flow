export const getPNLHistory = `
    SELECT
        pnl_histories.amount,
        pnl_histories.note,
        pnl_histories.action,
        pnl_histories.category,
        employees.username AS modifiedBy,
        pnl_histories.timestamp
    FROM pnl_histories
    INNER JOIN employees ON pnl_histories.modified_by=employees.id
    WHERE pnl_histories.pnl_id=? AND pnl_histories.category=?
    ORDER BY pnl_histories.timestamp DESC, pnl_histories.id DESC;
`;

export const newPNLHistory = 'INSERT INTO pnl_histories (pnl_id, amount, note, modified_by, action, category) VALUES (?, ?, ?, ?, ?, ?);';
