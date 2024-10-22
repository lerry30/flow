import connectToDB from '../config/db.js';
import * as mysqlStatements from '../mysql/statements.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Get player transaction history
   route    POST /api/transactions/player
   access   private
*/
const getPlayerTransactionHistory = requestHandler(async (req, res) => {
    const { playerId } = req.body;

    if(!playerId) {
        throw {status: 400, message: 'Player not found.'};
    }

    const pool = await connectToDB();
    const database = await pool.getConnection();
    const [transactions] = await database.execute(mysqlStatements.playerTransactions, [playerId]);
    await database.release();

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
const getTransactionHistory = requestHandler(async (req, res) => {
    const pool = await connectToDB();
    const database = await pool.getConnection();
    const [transactions] = await database.query(mysqlStatements.transactions);
    await database.release();

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
const deleteTransactionHistory = requestHandler(async (req, res) => {
    const deleteTransactionId = req.body?.deleteTransactionId;
    const playerId = req.body?.playerId;

    const pool = await connectToDB();
    const database = await pool.getConnection();
    await database.beginTransaction();
    const [transactions] = await database.execute(mysqlStatements.playerTransactions, [playerId]);

    if(!transactions || transactions.length === 0) {
        await database.release();
        await database.rollback();
        throw {status: 400, message: 'Player not found'};
    }

    let newBalance = 0;
    for(const transac of transactions) {
        const {transaction_id, units, action, deleted} = transac; 
        if(transaction_id !== deleteTransactionId && deleted === 0) {
            if(action === 'IN') {
                newBalance -= units;
            } else if(action === 'OUT') {
                newBalance += units;
            }
        }
    }

    const [deleteStatus] = await database.execute(mysqlStatements.updateTransactionState, [1, deleteTransactionId]);
    const [balanceUpdateResult] = await database.execute(mysqlStatements.updateBalance, [newBalance, playerId]);

    if(deleteStatus?.changedRows > 0 && balanceUpdateResult?.changedRows > 0) {
        await database.commit();
        await database.release();
        res.status(200).json({message: 'Deleted successfully.'});
    } else {
        await database.rollback();
        await database.release();
        throw {status: 400, message: 'No transaction history yet.'};
    }
});
export { 
    getPlayerTransactionHistory,
    getTransactionHistory,
    deleteTransactionHistory,
};
