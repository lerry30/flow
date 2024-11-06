import * as pnlStmt from '../mysql/pnl.js';
import * as pnlHistoryStmt from '../mysql/pnlHistory.js';
import { toNumber } from '../utils/number.js';
import { requestHandler } from '../utils/requestHandler.js';
import { currentTime, isValidDate } from '../utils/datetime.js';
import { insertPnLHistory } from '../helpers/pnlHistory.js';

/*
   desc     Get Profits and losses
   route    POST /api/pnl/get
   access   private
*/
const getProfitNLoss = requestHandler(async (req, res, database) => {
    const { date } = req.body;

    const [result] = await database.execute(pnlStmt.getPnL, [date, date, date]);

    const revenues = [];
    const expenses = [];
    const xcashflow = [];
    for(const data of result) {
        if(data?.type==='profit') {
            revenues.push(data);
        } else if(data?.type==='loss') {
            expenses.push(data);
        } else if(data?.type==='xcashflow') {
            xcashflow.push(data);
        }
    }

    res.status(200).json({revenues, expenses, xcashflow});
});

/*
   desc     Get selected pnl for update
   route    POST /api/pnl/selected
   access   private
*/
const selectedProfitNLoss = requestHandler(async (req, res, database) => { 
    const { category, id } = req.body;

    if(!category || !id) throw {status: 400, message: 'There\'s something wrong.'}

    let data = null;
    if(category === 'revenue') {
        const [revenue] = await database.execute(pnlStmt.revenue, [id]);
        data = revenue?.length > 0 ? revenue[0] : {};
    } else if(category === 'expense') {
        const [expense] = await database.execute(pnlStmt.expense, [id]);
        data = expense?.length > 0 ? expense[0] : {};
    } else if(category === 'xcashflow') {
        const [xcashflow] = await database.execute(pnlStmt.xcashflow, [id]);
        data = xcashflow?.length > 0 ? xcashflow[0] : {};
    }

    res.status(200).json({[category]: data});
});

/*
   desc     Add Profit
   route    POST /api/pnl/add/revenue
   access   private
*/
const newRevenue = requestHandler(async (req, res, database) => {
    const addedBy = req.user.employee_id;
    const date = req.body?.date?.trim();
    const tables = req.body?.tables;

    if(!date || !isValidDate(date)) throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
    if(tables.length === 0) throw {status: 400, message: 'There\'s something wrong. Revenue is empty.'};

    const nTables = [];
    for(let i = 0; i < tables.length; i++) {
        const table = tables[i];
        if(toNumber(table?.amount) > 0) {
            nTables[nTables.length] = table;
            if(!table?.note) {
                nTables[nTables.length] = {...table, note: `Table ${i}`};
            }
        }
    }

    const time = currentTime();

    const data = [];
    for(const table of nTables) {
        const amount = table?.amount;
        const note = table?.note;
        const [newRevenue] = await database.execute(pnlStmt.newRevenue,
            [amount, note, date, time, addedBy]);
        const revenueId = newRevenue?.insertId;

        if(revenueId > 0) {
            const isHistoryInserted = await insertPnLHistory(revenueId, amount, note, addedBy, 'added', 'revenue');
            if(isHistoryInserted) {
                data.push({amount, note, date, time, addedBy});
            } else {
                throw new Error('Unable to add new revenue');
            }
        }
    }

    res.status(200).json(data);
});

/*
   desc     Add Loss
   route    POST /api/pnl/add/expense
   access   private
*/
const newExpense = requestHandler(async (req, res, database) => {
    const addedBy = req.user.employee_id;
    const date = req.body?.date?.trim();
    const expenses = req.body?.expenses;

    if(!date || !isValidDate(date)) throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
    if(expenses.length === 0) throw {status: 400, message: 'There\'s something wrong. Expense is empty.'};

    const nExpenses = [];
    for(let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        if(toNumber(expense?.amount)) {
            nExpenses[nExpenses.length] = expense;
            if(!expense?.note) throw new Error('There\'s something wrong. An expense note is required.');
        }
    }

    const time = currentTime();
    const data = [];
    for(const expense of nExpenses) {
        const amount = expense?.amount;
        const note = expense?.note;
        const [newExpense] = await database.execute(pnlStmt.newExpense,
            [amount, note, date, time, addedBy]);
        const expenseId = newExpense?.insertId;

        if(expenseId > 0) {
            const isHistoryInserted = await insertPnLHistory(expenseId, amount, note, addedBy, 'added', 'expense');
            if(isHistoryInserted) {
                data.push({amount, note, date, time, addedBy});
            } else {
                throw new Error('Unable to add new expense.');
            }
        }
    }

    res.status(200).json(data);
});

/*
   desc     Add X
   route    POST /api/pnl/add/x
   access   private
*/
const newX = requestHandler(async (req, res, database) => {
    const addedBy = req.user.employee_id;
    const date = req.body?.date?.trim();
    const amount = toNumber(req.body?.amount);
    const note = req.body?.note?.trim();

    if(!date || !isValidDate(date)) throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
    if(amount === 0) throw {status: 400, message: 'There\'s something wrong. X cash flow is empty.'};
    if(!note) throw {status: 400, message: 'There\'s something wrong. The note for X cash flow must not be empty.'};

    const time = currentTime();
    const [newXCashFlow] = await database.execute(pnlStmt.newXCashFlow,
        [amount, note, date, time, addedBy]);
    const xCashFlowId = newXCashFlow?.insertId;

    if(xCashFlowId > 0) {
        const isHistoryInserted = await insertPnLHistory(xCashFlowId, amount, note, addedBy, 'added', 'xcashflow');
        if(isHistoryInserted) {
            res.status(200).json({amount, date, time, addedBy});
            return;
        }
    }
    
    throw {status: 400, message: 'An error occurred while inserting the new X cash flow.'}
});

/*
   desc     Update Profit, Loss and X Cash Flow
   route    PUT /api/pnl/update
   access   private
*/
const updateProfitNLoss = requestHandler(async (req, res, database) => {
    const userLevel = req.user?.level;
    const updatedBy = req.user.employee_id;
    const id = req.body?.id; 
    const amount = toNumber(req.body?.amount);
    const note = req.body?.note?.trim();
    const category = req.body?.category?.trim();

    const isXCashFlow = category === 'xcashflow';

    if(userLevel !== 'III') throw {status: 401, message: 'Updating P&L requires a user privilege level of 3.'};

    if(!id || !category) throw {status: 400, message: 'There\'s something wrong. Please try again later.'}
    const fCategory = isXCashFlow ? 'X cash flow' : category[0].toUpperCase()+category.substring(1);
    if(!amount) throw {status: 400, message: `${fCategory} amount must have a value.`};
    if(amount <= 0 && !isXCashFlow) throw {status: 400, message: `${fCategory} amount must have a value greater than zero.`};
    if(!note) throw {status: 400, message: `${fCategory} note is empty.`};

    const isHistoryInserted = await insertPnLHistory(id, amount, note, updatedBy, 'updated', category);
    if(!isHistoryInserted) throw new Error('An error occurs while saving state of p&l details before the update');

    const time = currentTime();
    let success = false;
    if(category === 'revenue') {
        const [updatedRevenue] = await database.execute(pnlStmt.updateRevenue,
            [amount, note, updatedBy, time, id]);

        success = updatedRevenue?.changedRows > 0;
    } else if(category === 'expense') {
        const [updatedExpense] = await database.execute(pnlStmt.updateExpense,
            [amount, note, updatedBy, time, id]);

        success = updatedExpense?.changedRows > 0;
    } else if(category === 'xcashflow') {
        const [updatedXCashFlow] = await database.execute(pnlStmt.updateXCashFlow,
            [amount, note, updatedBy, time, id]);

        success = updatedXCashFlow?.changedRows > 0;
    }

    if(success) {
        res.status(200).json({
            expense: amount,
            expNote: note,
            time,
            updatedBy
        });
        return;
    }

    throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
});

/*
   desc     Delete Profit and Loss
   route    DELETE /api/pnl/delete
   access   private
*/
const deleteProfitNLoss = requestHandler(async (req, res, database) => {
    const userLevel = req.user?.level;
    const deletedBy = req.user.employee_id;
    const id = req.body?.id; 
    const category = req.body?.category?.trim();

    if(userLevel !== 'III') throw {status: 401, message: 'Deleting P&L requires a user privilege level of 3.'};
    if(!id || !category) throw {status: 400, message: 'There\'s something wrong. Please try again later.'}

    const isHistoryInserted = await insertPnLHistory(id, 0, '', deletedBy, 'deleted', category);
    if(!isHistoryInserted) throw new Error('An error occurs while saving state of p&l details before the delete.');

    let isDeleted = false;
    if(category === 'revenue') {
        const [deletedRevenue] = await database.execute(pnlStmt.deleteRevenue, [id]);
        isDeleted = deletedRevenue?.affectedRows > 0;
    } else if(category === 'expense') {
        const [deletedExpense] = await database.execute(pnlStmt.deleteExpense, [id]);
        isDeleted = deletedExpense?.affectedRows > 0;
    } else if(category === 'xcashflow') {
        const [deletedX] = await database.execute(pnlStmt.deleteXCashFlow, [id]);
        isDeleted = deletedX?.affectedRows > 0;
    }

    if(isDeleted) {
        res.status(200).json({message: `${category[0]?.toUpperCase()+category.substring(1)} successfully deleted.`});
        return;
    }

    throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
});

/*
   desc     Get month operations
   route    POST /api/pnl/monthoperations
   access   private
*/
const getMonthOperations = requestHandler(async (req, res, database) => {
    const { currentMonth } = req.body;
    if(!currentMonth) throw {status: 400, message: 'There\'s something wrong.'}

    const [results] = await database.execute(pnlStmt.monthOperations, [currentMonth, currentMonth]);
    res.status(200).json({operations: results});
});

/*
   desc     Get overall
   route    POST /api/pnl/overall
   access   private
*/
const getOverall = requestHandler(async (req, res, database) => {
    const [results] = await database.query(pnlStmt.overall, []);
    let net = 0;
    for(const data of results) {
        if(data?.type==='profit') {
            net += toNumber(data?.amount);
        } else if(data?.type==='loss') {
            net -= toNumber(data?.amount);
        } else if(data?.type==='xcashflow') {
            net += toNumber(data?.amount);
        }
    }
    
    res.status(200).json({overallNet: net});
});

/*
   desc     Get net today
   route    POST /api/pnl/nettoday
   access   private
*/
const getLastNet = requestHandler(async (req, res, database) => {
    const [results] = await database.query(pnlStmt.lastNet, []);

    let net = 0;
    let date = '';
    for(const data of results) {
        date = data?.entry_date;
        if(data?.type==='profit') {
            net += toNumber(data?.amount);
        } else if(data?.type==='loss') {
            net -= toNumber(data?.amount);
        } else if(data?.type==='xcashflow') {
            net += toNumber(data?.amount);
        }
    }

    res.status(200).json({last: net, date});
});

const getHistory = requestHandler(async (req, res, database) => {
    const id = toNumber(req.body?.id);
    const category = req.body?.category?.trim();
    
    const validCategories = ['xcashflow', 'revenue', 'expense'];

    if(!id || !category) throw new Error('Either id or category is undefined');
    if(!validCategories.includes(category)) throw new Error('Category is undefined');

    const [result] = await database.execute(pnlHistoryStmt.getPNLHistory, [id, category]);
    res.status(200).json({history: result});

    //throw new Error('Sudden error occurs probably executing sql statement');
});

export {
    getProfitNLoss,
    newRevenue,
    newExpense,
    newX,
    selectedProfitNLoss,
    updateProfitNLoss,
    deleteProfitNLoss,
    getMonthOperations,
    getOverall,
    getLastNet,
    getHistory,
};
