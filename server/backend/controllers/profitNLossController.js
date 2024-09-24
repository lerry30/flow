import connectToDB from '../config/db.js';
import * as mysqlStatements from '../mysql/statements.js';
import { toNumber } from '../utils/number.js';
import { requestHandler } from '../utils/requestHandler.js';
import { currentTime, isValidDate, formattedDate } from '../utils/datetime.js';

/*
   desc     Get Profits and losses
   route    POST /api/pnl/get
   access   private
*/
const getProfitNLoss = requestHandler(async (req, res) => {
    const { date } = req.body;

    const pool = await connectToDB();
    let database = await pool.getConnection();

    const [revenues] = await database.execute(mysqlStatements.revenues, [date]);

    await database.release();
    database = await pool.getConnection();

    const [expenses] = await database.execute(mysqlStatements.expenses, [date]);

    console.log('test');
    res.status(200).json({revenues, expenses});
});

/*
   desc     Get selected pnl for update
   route    POST /api/pnl/selected
   access   private
*/
const selectedProfitNLoss = requestHandler(async (req, res) => { 
    const { category, id } = req.body;

    if(!category || !id) {
        throw {status: 400, message: 'There\'s something wrong.'}
    }

    const pool = await connectToDB();
    const database = await pool.getConnection();

    let data = null;
    if(category === 'revenue') {
        const [revenue] = await database.execute(mysqlStatements.revenue, [id]);
        data = revenue?.length > 0 ? revenue[0] : {};
    } else if(category === 'expense') {
        const [expense] = await database.execute(mysqlStatements.expense, [id]);
        data = expense?.length > 0 ? expense[0] : {};
    }

    res.status(200).json({[category]: data});
});

/*
   desc     Add Profit and Loss
   route    POST /api/pnl/add
   access   private
*/
const newProfitNLoss = requestHandler(async (req, res) => {
    const addedBy = req.user.employee_id;
    const { date, revenue, revNote, expense, expNote } = req.body;

    if(!date || !isValidDate(date)) throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
    if(!revenue && !expense) throw {status: 400, message: 'Either the revenue or expense amount must have a value.'};
    if(toNumber(revenue) <= 0 && toNumber(expense) <= 0)
        throw {status: 400, message: 'Either the revenue or expense amount must have a value greater than zero.'};
    if(revenue && !revNote) throw {status: 400, message: 'Revenue note is empty.'};
    if(expense && !expNote) throw {status: 400, message: 'Expense note is empty.'}

    const time = currentTime();

    const pool = await connectToDB();
    const database = await pool.getConnection();

    const data = {revenue: {}, expense: {}};
    if(revenue) {
        const [newRevenue] = await database.execute(mysqlStatements.newRevenue,
            [revenue, revNote, date, time, addedBy]);

        if(newRevenue?.insertId) {
            data.revenue = {revenue, revNote, date, time, addedBy};
        }
    }

    if(expense) {
        const [newExpense] = await database.execute(mysqlStatements.newExpense,
            [expense, expNote, date, time, addedBy]);

        if(newExpense?.insertId) {
            data.expense = {expense, expNote, date, time, addedBy};
        }
    }

    res.status(200).json(data);
});

/*
   desc     Update Profit and Loss
   route    PUT /api/pnl/update
   access   private
*/
const updateProfitNLoss = requestHandler(async (req, res) => {
    const updatedBy = req.user.employee_id;
    const id = req.body?.id; 
    const amount = toNumber(req.body?.amount); 
    const note = req.body?.note?.trim();
    const category = req.body?.category?.trim();

    if(!id || !category) throw {status: 400, message: 'There\'s something wrong. Please try again later.'}
    const fCategory = category[0].toUpperCase()+category.substring(1);
    if(!amount) throw {status: 400, message: `${fCategory} amount must have a value.`};
    if(amount <= 0) throw {status: 400, message: `${fCategory} amount must have a value greater than zero.`};
    if(!note) throw {status: 400, message: `${fCategory} note is empty.`};

    const time = currentTime();

    const pool = await connectToDB();
    const database = await pool.getConnection();

    if(category === 'revenue') {
        const [updatedRevenue] = await database.execute(mysqlStatements.updateRevenue,
            [amount, note, updatedBy, time, id]);

        if(updatedRevenue?.changedRows > 0) {
            res.status(200).json({
                revenue: amount,
                revNote: note,
                time,
                updatedBy
            });

            return;
        }
    } else if(category === 'expense') {
        const [updatedExpense] = await database.execute(mysqlStatements.updateExpense,
            [amount, note, updatedBy, time, id]);

        if(updatedExpense?.changedRows > 0) {
            res.status(200).json({
                expense: amount,
                expNote: note,
                time,
                updatedBy
            });

            return;
        }
    }

    throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
});

/*
   desc     Delete Profit and Loss
   route    DELETE /api/pnl/delete
   access   private
*/
const deleteProfitNLoss = requestHandler(async (req, res) => {
    const id = req.body?.id; 
    const category = req.body?.category?.trim();

    if(!id || !category) throw {status: 400, message: 'There\'s something wrong. Please try again later.'}

    const pool = await connectToDB();
    const database = await pool.getConnection();

    if(category === 'revenue') {
        const [deletedRevenue] = await database.execute(mysqlStatements.deleteRevenue, [id]);

        if(deletedRevenue?.affectedRows > 0) {
            res.status(200).json({message: 'Revenue successfully deleted.'});
            return;
        }
    } else if(category === 'expense') {
        const [deletedExpense] = await database.execute(mysqlStatements.deleteExpense, [id]);

        if(deletedExpense?.affectedRows > 0) {
            res.status(200).json({message: 'Expense successfully deleted.'});
            return;
        }
    }

    throw {status: 400, message: 'There\'s something wrong. Please try again later.'};
});

/*
   desc     Get month operations
   route    POST /api/pnl/monthoperations
   access   private
*/
const getMonthOperations = requestHandler(async (req, res) => {
    const { currentMonth } = req.body;
    if(!currentMonth) throw {status: 400, message: 'There\'s something wrong.'}

    const pool = await connectToDB();
    const database = await pool.getConnection();

    const [results] = await database.execute(mysqlStatements.monthOperations, [currentMonth, currentMonth]);
    
    res.status(200).json({operations: results});
});

/*
   desc     Get overall
   route    POST /api/pnl/overall
   access   private
*/
const getOverall = requestHandler(async (req, res) => {
    const pool = await connectToDB();
    const database = await pool.getConnection();

    const [results] = await database.query(mysqlStatements.overall, []);
    
    let net = 0;
    for(const data of results) {
        if(data?.type==='profit') {
            net += data?.amount;
        } else if(data?.type==='loss') {
            net -= data?.amount;
        }
    }
    
    res.status(200).json({overallNet: net});
});

/*
   desc     Get net today
   route    POST /api/pnl/nettoday
   access   private
*/
const getNetToday = requestHandler(async (req, res) => {
    const pool = await connectToDB();
    const database = await pool.getConnection();

    const today = formattedDate(new Date());
    const [results] = await database.query(mysqlStatements.netToday, [today, today]);
    let net = 0;
    for(const data of results) {
        if(data?.type==='profit') {
            net += data?.amount;
        } else if(data?.type==='loss') {
            net -= data?.amount;
        }
    }
    
    res.status(200).json({today: net});
});

export {
    getProfitNLoss,
    newProfitNLoss,
    selectedProfitNLoss,
    updateProfitNLoss,
    deleteProfitNLoss,
    getMonthOperations,
    getOverall,
    getNetToday,
};
