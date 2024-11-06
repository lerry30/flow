export const newTransactionHistory = `
    INSERT INTO transaction_histories 
        (transaction_id, unit, unit_action, note, modified_by, action) 
    VALUES (?, ?, ?, ?, ?, ?);
`;
