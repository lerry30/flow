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

export const newPlayer = 'INSERT INTO players (info_id, status, added_by) VALUES (?, ?, ?);';

export const updateBalance = `
    UPDATE players
    SET status=?
    WHERE id=?;
`;
