import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

import connectToDB from '../config/db.js';
import * as mysqlStatements from '../mysql/statements.js';

const protect = asyncHandler(async (req, res, next) => {
    //const token = req.cookies.jwt;
    const token = req.body.token;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const [id, username] = decoded.value.split('-');
            const database = await connectToDB();
            const [rows] = await database.execute(mysqlStatements.employee, [username]);
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
