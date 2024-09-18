import connectToDB from '../config/db.js';
import * as mysqlStatements from '../mysql/statements.js';
import { toNumber } from '../utils/number.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Add record borrow/payment
   route    PUT /api/records/record
   access   private
*/
const addRecord = requestHandler(async (req, res) => {
    const addedBy = req.user.employee_id;
    const { playerId, action, amount } = req.body;

    if(!playerId || Object.keys(action).length === 0 || !amount) {
        throw {status: 400, message: 'There\’s something wrong. Unable to record the payment or load, possibly due to zero value. Please try again.'};
    }

    const pool = await connectToDB();
    const database = await pool.getConnection();
    const [player] = await database.execute(mysqlStatements.player, [playerId]);

    if(!player || player.length === 0) {
        throw {status: 400, message: 'Player not found'};
    }

    const nAmount = toNumber(amount);
    const balance = toNumber(player[0].status);

    let newBalance = balance;
    let dbAction = '';
    
    await database.beginTransaction();
    if(action?.plus) { // borrow
        dbAction = 'OUT';
        newBalance = balance + nAmount;
    } else if(action?.minus) { //payment
        dbAction = 'IN';
        newBalance = balance - nAmount;
    }

    const [balanceUpdateResult] = await database.execute(mysqlStatements.updateBalance, [newBalance, playerId]);
    const [newTransactionResult] = await database.execute(mysqlStatements.newTransaction, [playerId, nAmount, dbAction, balance, addedBy]);
    if(balanceUpdateResult.changedRows === 0 || newTransactionResult.insertId === 0) {
        await database.rollback();
        await database.release();

        throw {status: 401, message: 'There\'s something wrong.'};
    }

    await database.commit();
    await database.release();

    res.status(200).json({message: 'Successfully input the data.'});
});

export { 
    addRecord,
};
