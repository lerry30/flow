export const info = `
    SELECT
        id,
        firstname,
        lastname,
        created_at
    FROM info
    WHERE firstname=? AND lastname=?;
`;

export const newInfo = 'INSERT INTO info (firstname, lastname) VALUES (?, ?);';
