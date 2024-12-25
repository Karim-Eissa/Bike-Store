const mysql = require('mysql2');
require('dotenv').config();
const user = process.env.user; 
const pass = process.env.pass; 
const host = process.env.host; 
const db = process.env.db; 

const connection = mysql.createConnection({
  host: host, 
  user: user,     
  password: pass,      
  database: db   
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');
});

module.exports = connection;
