import connectToDB from '../config/db.js';
import * as pnlHistoryStmt from '../mysql/pnlHistory.js';
import { toNumber } from '../utils/number.js';

export const insertPnLHistory = async (pnlId, amount, note, modifiedBy, action, category) => {
    try {
        pnlId = toNumber(pnlId);
        amount = toNumber(amount);
        note = !note ? '' : note?.trim();
        modifiedBy = toNumber(modifiedBy);
        action = action?.trim()?.toUpperCase();
        category = category?.trim()?.toLowerCase();

        const validActions = ['ADDED', 'UPDATED', 'DELETED']
        const validCategories = ['xcashflow', 'revenue', 'expense'];

        if(!validActions.includes(action)) throw new Error('Undefined pnl action');
        if(!validCategories.includes(category)) throw new Error('Undefined pnl category');
        if(!pnlId || !modifiedBy) throw new Error('Invalid paramerters for p&l history');

        const pool = await connectToDB();
        const database = await pool.getConnection();

        const [result] = await database.execute(pnlHistoryStmt.newPNLHistory, [pnlId, amount, note, modifiedBy, action, category]);
        await database.release();

        return result?.insertId > 0;
    } catch(error) {
        console.log(error, '. Insert new pnl history error.');
        return false;
    }
}
