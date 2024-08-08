const db = require("./db").db;

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/registros', (req, res) => {
    db.execute('SELECT * FROM registros', (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            res.status(500).send('Error fetching users');
            return;
        }
        res.json(results);
    });
});

app.post('/registros', (req, res) => {
    const { valor, tipo } = req.body;
    const date = new Date();
    const data = date.toISOString().split('T')[0]
    const hora = date.toLocaleTimeString();

    console.log(valor, tipo, data, hora)

    db.query("INSERT INTO `registros` (valor, tipo, data_registro, hora_registro) VALUES (?, ?, ?, ?)", [valor, tipo, data, hora], function(err, result){
        if(err) throw err;

        res.sendStatus(200);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});