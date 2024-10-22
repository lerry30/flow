import bcrypt from 'bcryptjs';
import connectToDB from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import * as mysqlStatements from '../mysql/statements.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Auth user/set token
   route    POST /api/users/auth
   access   public
*/
const authUser = requestHandler(async (req, res) => {
    const username = req.body?.username?.trim();
    const password = req.body?.password?.trim();

    if(!username || !password) {
        throw {status: 400, message: 'All fields are required.'};
    }

    const pool = await connectToDB();
    const database = await pool.getConnection();
    const [user] = await database.execute(mysqlStatements.employeeWithPassword, [username]);
    await database.release();

    if(user.length > 0) {
        const {employee_id, firstname, lastname, username, password: hashedPassword} = user[0];
        const value = `${employee_id}-${username}`;
        const token = generateToken(value);
        if(user && (await bcrypt.compare(password, hashedPassword))) {
            res.status(200).json({id: employee_id, token, firstname, lastname, username});
            return;
        }
    }

    throw {status: 401, message: 'Wrong username or password'};
});

/*
   desc     Register user/set token
   route    POST /api/users/
   access   public
*/
const registerUser = requestHandler(async (req, res) => {
    const { firstname, lastname, username, password } = req.body;
    
    if(!firstname || !lastname || !username || !password) {
        throw {status: 400, message: 'All fields are required.'};
    }

    const pool = await connectToDB(); 
    const database = await pool.getConnection();
    const [userExists] = await database.execute(mysqlStatements.username, [username]);

    if(userExists.length > 0) {
        throw {status: 400, message: 'Username unavailable. Please try a different one'};
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await database.beginTransaction();
    const [newInfoResult] = await database.execute(
        mysqlStatements.newInfo, 
        [firstname, lastname]
    );

    const infoId = newInfoResult?.insertId;

    if(infoId) {
        const [newEmployeeResult] = await database.execute(
            mysqlStatements.newEmployee, 
            [infoId, username, hashedPassword]
        );
        
        const employeeId = newEmployeeResult?.insertId;
        if(employeeId) {
            const id = employeeId;
            const value = `${employeeId}-${username}`;
            const token = generateToken(value);

            await database.commit();
            await database.release();
            res.status(201).json({
                id: employeeId,
                token: token,
                firstname: firstname,
                lastname: lastname,
                username: username,
            });

            return;
        }
    }

    await database.rollback();
    await database.release();
    throw {status: 400, message: 'Invalid user data'};
});

export { 
    authUser, 
    registerUser, 
};
