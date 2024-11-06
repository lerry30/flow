// used in middleware/authMiddleware
export const employee = `
    SELECT 
        employees.id AS employee_id,
        employees.username,
        info.firstname,
        info.lastname,
        info.created_at,
        privilege_users.level
    FROM employees
    INNER JOIN info ON employees.info_id = info.id
    LEFT JOIN privilege_users ON employees.id = privilege_users.employee_id
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


export const username = 'SELECT username FROM employees WHERE username=?;';

export const newEmployee = 'INSERT INTO employees (info_id, username, password) VALUES (?, ?, ?);';
