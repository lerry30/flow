import * as reportStmt from '../mysql/pnlReport.js';
import { toNumber } from '../utils/number.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     get monthly report
   route    POST /api/reports/monthly
   access   private
*/
const monthlyReport = requestHandler(async (req, res, database) => {
    const month = toNumber(req.body?.month);
    const year = toNumber(req.body?.year);

    if(month <= 0 || year <= 0) throw new Error('An error occurs due to invalid date'); 

    const [results] = await database.execute(reportStmt.monthly, [month, year, month, year, month, year]);

    res.status(200).json({data: results});
});

/*
   desc     get weekly report
   route    POST /api/reports/weekly
   access   private
*/
const weeklyReport = requestHandler(async (req, res, database) => {
    const weeks = String(req.body?.week)?.trim()?.split('-');

    if(!weeks || weeks?.length === 0) throw new Error('An error occurs due to invalid date'); 

    const startDate = new Date(toNumber(weeks[0]));
    const endDate = new Date(toNumber(weeks[1]));

    if(isNaN(startDate) || isNaN(endDate)) throw new Error('Week days are invalid dates');

    const [results] = await database.execute(reportStmt.weekly, [startDate, endDate, startDate, endDate, startDate, endDate]);

    res.status(200).json({data: results});
});

export {
    monthlyReport,
    weeklyReport
};


