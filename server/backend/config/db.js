import mysql from 'mysql2/promise'; // Use the promise version of mysql2

// Store the connection pool in a variable to avoid creating multiple pools
let pool;

const logConnectionStatus = (status) => {
    if (status.success) {
        console.log(`MySQL Connected to host: ${status.host}, database: ${status.database}`);
    } else {
        console.error(`Database failed to connect: ${status.message}`);
    }
}

const connectToDB = async () => {
    try {
        // Check if the pool is already created to avoid creating multiple pools
        if (!pool) {
            pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,  // Adjust this according to your needs
                queueLimit: 0,
                timezone: 'Z',
                dateStrings: true,
            });

            logConnectionStatus({
                success: true,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME
            });
        }
        return pool; // Return the connection pool
    } catch (error) {
        // Log failure if an error occurs
        logConnectionStatus({
            success: false,
            message: error.message
        });
        process.exit(1); // Exit process if the connection fails
    }
};

export default connectToDB;

