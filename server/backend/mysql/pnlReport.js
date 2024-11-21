export const monthly = `
    SELECT 
        'Profit' AS category,
        id,
        revenue AS amount,
        revenue_note AS note,
        added_by,
        entry_date,
        entry_time
    FROM 
        profits
    WHERE 
        MONTH(entry_date) = ? AND YEAR(entry_date) = ?

    UNION ALL

    SELECT 
        'Loss' AS category,
        id,
        expense AS amount,
        expense_note AS note,
        added_by,
        entry_date,
        entry_time
    FROM 
        losses
    WHERE 
        MONTH(entry_date) = ? AND YEAR(entry_date) = ?

    UNION ALL

    SELECT 
        'Cashflow' AS category,
        id,
        amount,
        note,
        added_by,
        entry_date,
        entry_time
    FROM 
        xcashflows
    WHERE 
        MONTH(entry_date) = ? AND YEAR(entry_date) = ?
    ORDER BY 
        entry_date, entry_time;
`;

export const weekly = `
    SELECT 
        'Profit' AS category,
        p.revenue AS amount,
        p.revenue_note AS note,
        e.username AS added_by,
        p.entry_date,
        p.entry_time
    FROM profits p
    INNER JOIN employees e ON p.added_by = e.id
    WHERE p.entry_date BETWEEN ? AND ?

    UNION ALL

    SELECT 
        'Loss' AS category,
        l.expense AS amount,
        l.expense_note AS note,
        e.username AS added_by,
        l.entry_date,
        l.entry_time
    FROM losses l
    INNER JOIN employees e ON l.added_by = e.id
    WHERE l.entry_date BETWEEN ? AND ?

    UNION ALL

    SELECT 
        'Cashflow' AS category,
        x.amount AS amount,
        x.note AS note,
        e.username AS added_by,
        x.entry_date,
        x.entry_time
    FROM xcashflows x
    INNER JOIN employees e ON x.added_by = e.id
    WHERE x.entry_date BETWEEN ? AND ?;
`;
