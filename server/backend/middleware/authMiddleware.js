import jwt from 'jsonwebtoken';

import connectToDB from '../config/db.js';
import * as mysqlStatements from '../mysql/statements.js';
import { requestHandler } from '../utils/requestHandler.js';

const protect = requestHandler(async (req, res, next) => {
    //const token = req.cookies.jwt;
    const token = req.body.token;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const [id, username] = decoded.value.split('-');
            const pool = await connectToDB();
            const database = await pool.getConnection();
            const [rows] = await database.execute(mysqlStatements.employee, [username]);
            await database.release();
            if(rows.length > 0) {
                req.user = rows[0];
                next();
            } else {
                res.status(401);
                throw new Error('User not found');
            }
        } catch(error) {
            res.status(401);
            throw new Error('Not authorized, invalid token');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect };
