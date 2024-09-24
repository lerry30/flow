import connectToDB from '../config/db.js';
import * as mysqlStatements from '../mysql/statements.js';
import { toNumber } from '../utils/number.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Add new player
   route    POST /api/players/add
   access   private
*/
const addNewPlayer = requestHandler(async (req, res) => {
    const addedBy = req.user.employee_id;
    const { firstname, lastname, amount } = req.body;

    if(!firstname || !lastname) {
        throw {status: 400, message: 'All fields are required.'};
    }

    const pool = await connectToDB();
    const database = await pool.getConnection();

    await database.beginTransaction();
    const [newInfoResult] = await database.execute(mysqlStatements.newInfo, [firstname, lastname]);
    const infoId = newInfoResult?.insertId;

    if(infoId) {
        const nAmount = toNumber(amount);
        const [newPlayerResult] = await database.execute(mysqlStatements.newPlayer, [infoId, nAmount, addedBy]);
        const playerId = newPlayerResult?.insertId;
       
        if(playerId > 0) {
            const inOut = nAmount < 0 ? 'IN' : 'OUT';
            const [newTransactionResult] = await database.execute(mysqlStatements.newTransaction, 
                [playerId, Math.abs(nAmount, 0), inOut, 0, addedBy]);
            if(newTransactionResult?.insertId > 0) {
                await database.commit();

                res.status(201).json({
                    id: playerId,
                    firstname: firstname,
                    lastname: lastname,
                    amount: nAmount
                });
                
                await database.release();
                return;
            }
        }
    }
    
    await database.rollback();
    await database.release();
    throw {status: 400, message: 'There\'s something wrong.'};
});

/*
   desc     Get all players
   route    POST /api/players/
   access   private
*/
const getPlayers = requestHandler(async (req, res) => {
    const database = await connectToDB();
    const [players] = await database.query(mysqlStatements.players);

    if(!players) {
        throw {status: 400, message: 'There\'s something wrong.'};
    }

    res.status(200).json({players});
});

/*
   desc     Get player
   route    POST /api/players/player
   access   private
*/
const getPlayer = requestHandler(async (req, res) => {
    const { playerId } = req.body;

    if(!playerId) {
        throw {status: 400, message: 'Unable to get player.'};
    }

    const database = await connectToDB();
    const [result] = await database.execute(mysqlStatements.player, [playerId]);

    if(!result || result.length === 0) {
        throw {status: 400, message: 'Player not found'};
    }

    const player = result[0];
    res.status(200).json({player});
});

/*
   desc     Search player
   route    POST /api/players/search
   access   private
*/
const search = requestHandler(async (req, res) => {
    const { search } = req.body;

    if(!search) {
        throw {status: 400, message: 'Unable to search for players.'};
    }

    const database = await connectToDB();
    const [players] = await database.execute(mysqlStatements.search, [`%${search}%`, `%${search}%`]);

    if(!players) {
        throw {status: 400, message: 'Player not found'};
    }

    res.status(200).json({players});
});

export { 
    addNewPlayer,
    getPlayers,
    getPlayer,
    search
};
