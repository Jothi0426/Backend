//SQL code 

// const sql = require('mssql');

// const config = {
//   user: 'sa',
//   password: 'jothi@12',
//   server: 'SPCHNGL113',
//   database: 'Mobileapp',
//   port: 1433,  // Default SQL Server port
//   options: {
//     encrypt: false,
//     enableArithAbort: true,
//     trustServerCertificate: true,
//   },
// };

// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then((pool) => {
//     console.log('✅ Connected to SQL Server');
//     return pool;
//   })
//   .catch((err) => console.error('❌ Database Connection Failed!', err));

// module.exports = { sql, poolPromise };


require('dotenv').config(); // Load env variables
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,

    ssl: {
    rejectUnauthorized: false // Required by Render's PostgreSQL
  }
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ Database connection error:", err));

module.exports = pool;



