import * as playerStmt from '../mysql/player.js';
import * as infoStmt from '../mysql/info.js';
import * as transactionStmt from '../mysql/transaction.js';
import * as transactionHistoryStmt from '../mysql/transactionHistory.js';
import { toNumber } from '../utils/number.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Add new player
   route    POST /api/players/add
   access   private
*/
const addNewPlayer = requestHandler(async (req, res, database) => {
    const userLevel = req.user.level;
    const addedBy = req.user.employee_id;
    const firstname = String(req.body?.firstname).trim();
    const lastname = String(req.body?.lastname).trim();
    const maxLimit = toNumber(req.body?.maxLimit);
    const note = String(req.body?.note).trim();
    const amount = toNumber(req?.body?.amount);

    // require level 3 privilege
    if(userLevel !== 'III') throw {status: 401, message: 'Adding a new player requires user privilege level 3.'};

    // last name is not required for privacy reason
    if(!firstname) throw {status: 400, message: 'All fields are required.'};

    // to check if player is already existed
    const [playerResult] = await database.execute(infoStmt.info, [firstname, lastname]);
    if(playerResult?.length > 0) {
        throw {status: 400, message: 'Player already exists.'};
    }

    const [newInfoResult] = await database.execute(infoStmt.newInfo, [firstname, lastname]);
    const infoId = newInfoResult?.insertId;

    if(infoId > 0) {
        const nAmount = toNumber(amount);
        const [newPlayerResult] = await database.execute(playerStmt.newPlayer, [infoId, maxLimit, note, nAmount, addedBy]);
        const playerId = newPlayerResult?.insertId;
       
        if(playerId > 0) {
            const inOut = nAmount < 0 ? 'IN' : 'OUT';
            const [newTransactionResult] = await database.execute(transactionStmt.newTransaction, 
                [playerId, Math.abs(nAmount, 0), '', inOut]);
            const transactionId = newTransactionResult?.insertId;
            if(transactionId > 0) {
                const [newTransactionHistoryResult] = await database.execute(transactionHistoryStmt.newTransactionHistory, 
                    [transactionId, nAmount, inOut, '', addedBy, 'ADDED']);

                const transactionHistoryId = newTransactionHistoryResult?.insertId;

                if(transactionHistoryId > 0) {
                    res.status(201).json({
                        id: playerId,
                        firstname: firstname,
                        lastname: lastname,
                        amount: nAmount
                    });
                    
                    return;
                }
            }
        }
    }
    
    throw {status: 400, message: 'There\'s something wrong.'};
});

/*
   desc     Get all players
   route    POST /api/players/
   access   private
*/
const getPlayers = requestHandler(async (req, res, database) => {
    const [players] = await database.query(playerStmt.players);
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
const getPlayer = requestHandler(async (req, res, database) => {
    const { playerId } = req.body;

    if(!playerId) throw {status: 400, message: 'Unable to get player.'};

    const [result] = await database.execute(playerStmt.player, [playerId]);
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
const search = requestHandler(async (req, res, database) => {
    const search = req.body?.search?.trim();

    if(!search) throw {status: 400, message: 'Unable to search for players.'};

    const [players] = await database.execute(playerStmt.search, [`%${search}%`, `%${search}%`]);
    if(!players) {
        throw {status: 400, message: 'Player not found'};
    }

    res.status(200).json({players});
});

/*
   desc     Update Player
   route    PUT /api/players/put
   access   private
*/
const updatePlayer = requestHandler(async (req, res, database) => {
    const userLevel = req.user.level;
    const playerId = toNumber(req.body?.playerId);
    const firstname = String(req.body?.firstname).trim();
    const lastname = String(req.body?.lastname).trim();
    const maxLimit = toNumber(req.body?.maxLimit);
    const note = String(req.body?.note).trim();

    const [player] = await database.execute(playerStmt.player, [playerId]);

    if(player?.length > 0) {
        const selectedPlayer = player[0];
        if(selectedPlayer?.firstname !== firstname ||
            selectedPlayer?.lastname !== lastname ||
            selectedPlayer?.max_limit !== maxLimit) {
            
            // require level 3 privilege
            if(userLevel !== 'III') throw {status: 401, message: 'Modify access: Level 3 required.'};

            // check the current balance if it is lower than the new set max limited value for balance
            if((maxLimit*-1) > selectedPlayer?.status) 
                throw {status: 400, message: `The new limited balance exceeds the player's current balance(${selectedPlayer?.status}).`};
        }

        // last name is not required for privacy reason
        if(!firstname) throw {status: 400, message: 'All fields are required.'};

        const [updatingInfoResult] = await database.execute(infoStmt.updateInfo, [firstname, lastname, selectedPlayer?.info_id]);
        if(updatingInfoResult?.affectedRows > 0) {
            const [updatingPlayerResult] = await database.execute(playerStmt.updatePlayer, [maxLimit, note, playerId]); 
            if(updatingPlayerResult?.affectedRows > 0) {
                res.status(200).json({firstname, lastname, maxLimit, note});
                return;
            }
        }
    }
    
    throw {status: 400, message: 'There\'s something wrong.'};
});

export { 
    addNewPlayer,
    getPlayers,
    getPlayer,
    search,
    updatePlayer,
};
