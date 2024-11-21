import connectToDB from '../config/db.js';

export const requestHandler = (controller) => {
    return async (req, res, next) => {
        let database = null;
        try {
            const pool = await connectToDB();
            database = await pool.getConnection();
            await database.beginTransaction();
            
            await controller(req, res, database, next);
            await database.commit();
        } catch(error) {
            let message = error?.message;
            let status = error?.status || 500;
            console.log('Error: ', message);
            if(error instanceof Error) message = 'There\'s something wrong.';

            if(database) {
                await database.rollback();
            }

            res.status(status).json({message});
        } finally {
            if(database) {
                await database.release();
            }
        }
    }
}
