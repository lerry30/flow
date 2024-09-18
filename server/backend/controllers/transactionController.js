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

    const database = await connectToDB();
    const [transactions] = await database.execute(mysqlStatements.playerTransactions, [playerId]);

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
    const database = await connectToDB();
    const [transactions] = await database.query(mysqlStatements.transactions);

    if(transactions) {
        res.status(200).json({transactions});
    } else {
        throw {status: 400, message: 'No transaction history yet.'};
    }
});

export { 
    getPlayerTransactionHistory,
    getTransactionHistory,
};
