import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './config/db.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import userRoutes from './routes/userRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import profitNLossRoutes from './routes/profitNLossRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { getDir } from './utils/fileDir.js';

dotenv.config();
// database
// if it cannot connect to database, it would run process.exit(1), which terminate the program
connectToDB();

const app = express();
const port = process.env.PORT || 3000;
// Limit repeated requests to public APIs
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

// Use Helmet for security
app.use(helmet());
//app.use(limiter);
// in order to use req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/users', userRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/pnl', profitNLossRoutes);

// fall back when route is not found
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
