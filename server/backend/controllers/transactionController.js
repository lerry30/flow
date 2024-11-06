import * as playerStmt from '../mysql/player.js';
import * as transactionStmt from '../mysql/transaction.js';
import * as transactionHistoryStmt from '../mysql/transactionHistory.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Get player transaction history
   route    POST /api/transactions/player
   access   private
*/
const getPlayerTransactionHistory = requestHandler(async (req, res, database) => {
    const { playerId } = req.body;

    if(!playerId) throw {status: 400, message: 'Player not found.'};

    const [transactions] = await database.execute(transactionStmt.playerTransactions, [playerId]);
    if(transactions) {
        res.status(200).json({transactions});
    } else {
        throw {status: 400, message: 'No transaction history yet.'};
    }
});

/*
   desc     Get transaction history
   route    POST /api/transactions/
   access   private
*/
const getTransactionHistory = requestHandler(async (req, res, database) => {
    const [transactions] = await database.query(transactionStmt.transactions);
    if(transactions) {
        res.status(200).json({transactions});
    } else {
        throw {status: 400, message: 'No transaction history yet.'};
    }
});

/*
   desc     Delete transaction history
   route    DELETE /api/transactions/
   access   private
*/
const deleteTransactionHistory = requestHandler(async (req, res, database) => {
    const userLevel = req.user?.level;
    const deletedBy = req.user?.employee_id;
    const deleteTransactionId = req.body?.deleteTransactionId;
    const playerId = req.body?.playerId;

    if(userLevel !== 'II' && userLevel !== 'III') throw {status: 401, message: 'Deleting a transaction requires a user privilege level of 2 or 3.'};

    // query transactions to total balance
    const [transactions] = await database.execute(transactionStmt.playerTransactions, [playerId]);
    if(!transactions || transactions.length === 0) {
        throw {status: 400, message: 'Player not found'};
    }

    // will total the new balance
    let newBalance = 0;
    for(const transac of transactions) {
        const {transactionId, units, action, history} = transac;
        let isDeleted = false;
        //const {historyId, modifiedByEmployee, action, modifiedAt} = history[0];
        const historyInObject = JSON.parse(history || '[]'); // history was in string
        for(const state of historyInObject) {
            if(state?.action === 'DELETED') isDeleted = true;
        }

        if(transactionId !== deleteTransactionId && !isDeleted) {
            if(action === 'IN') {
                newBalance -= units;
            } else if(action === 'OUT') {
                newBalance += units;
            }
        }
    }

    const [newTransactionHistoryResult] = await database.execute(transactionHistoryStmt.newTransactionHistory, 
        [deleteTransactionId, 0, 'IN', '', deletedBy, 'DELETED']);
    const [balanceUpdateResult] = await database.execute(playerStmt.updateBalance, [newBalance, playerId]); // update player balance

    // console.log(deleteStatus?.changedRows, balanceUpdateResult?.changedRows); // if the amount of units in transaction is zero the deletion of it will not update the user's balance so the output of balanceUpdateResult?.changedRows will be zero or not update happened
    if(newTransactionHistoryResult?.insertId > 0 && balanceUpdateResult?.changedRows > 0) {
        res.status(200).json({message: 'Deleted successfully.'});
    } else {
        throw {status: 400, message: 'No transaction history yet.'};
    }
});

export { 
    getPlayerTransactionHistory,
    getTransactionHistory,
    deleteTransactionHistory,
};
