export const players = `
    SELECT
        players.id AS player_id,
        players.max_limit AS max_limit,
        players.note,
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
        players.max_limit AS max_limit,
        players.note,
        players.status,
        employees.username AS added_by,
        info.id AS info_id,
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
        players.max_limit AS max_limit,
        players.note,
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

export const newPlayer = 'INSERT INTO players (info_id, max_limit, note, status, added_by) VALUES (?, ?, ?, ?, ?);';

export const updateBalance = 'UPDATE players SET status=? WHERE id=?;';

export const updatePlayer = 'UPDATE players SET max_limit=?, note=? WHERE id=?;';
