const db = require('./db');
const express = require('express');
const cors = require('cors');
const appRoutes = require('./routes');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const port = process.env.port; 

db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
        console.error('Error executing query:', err);
        process.exit(1); 
    }
    console.log('The solution is:', results[0].solution);
});
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 

app.use(cors());
app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/scripts')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', appRoutes);
app.get('/', (req, res) => {
    res.redirect('/home');
});
app.use((req, res) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log(`Server running and listening on port ${port}`);
});
