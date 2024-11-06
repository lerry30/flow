import * as playerStmt from '../mysql/player.js';
import * as transactionStmt from '../mysql/transaction.js';
import * as transactionHistoryStmt from '../mysql/transactionHistory.js';
import { toNumber } from '../utils/number.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Add record borrow/payment
   route    PUT /api/records/record
   access   private
*/
const addRecord = requestHandler(async (req, res, database) => {
    const addedBy = req.user.employee_id;
    const playerId = req.body?.playerId;
    const action = req.body?.action;
    const amount = toNumber(req.body?.amount);
    const note = req.body?.note?.trim();

    if(!playerId || Object.keys(action).length === 0 || !amount) {
        throw {status: 400, message: 'There\’s something wrong. Unable to record the payment or load, possibly due to zero value. Please try again.'};
    }

    const [player] = await database.execute(playerStmt.player, [playerId]);
    if(!player || player.length === 0) {
        throw {status: 400, message: 'Player not found'};
    }

    const nAmount = toNumber(amount);
    const balance = toNumber(player[0].status);

    let newBalance = balance;
    let dbAction = '';
    
    if(action?.plus) { // borrow
        dbAction = 'OUT';
        newBalance = balance + nAmount;
    } else if(action?.minus) { //payment
        dbAction = 'IN';
        newBalance = balance - nAmount;
    }

    // status = balance in players table
    const [balanceUpdateResult] = await database.execute(playerStmt.updateBalance, [newBalance, playerId]);
    const [newTransactionResult] = await database.execute(transactionStmt.newTransaction, [playerId, nAmount, note, dbAction]);
    const transactionId = newTransactionResult.insertId;

    if(balanceUpdateResult.changedRows > 0 && transactionId > 0) {
        const [newTransactionHistoryResult] = await database.execute(transactionHistoryStmt.newTransactionHistory, 
            [transactionId, nAmount, dbAction, note, addedBy, 'ADDED']);
        
        if(newTransactionHistoryResult.insertId > 0) {
            res.status(200).json({message: 'Successfully input the data.'});
            return;
        }
    }

    throw {status: 401, message: 'There\'s something wrong.'};
});

export { 
    addRecord,
};
