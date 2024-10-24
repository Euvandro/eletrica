const db = require("./db").db;

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

//app.use(bodyParser.json());
app.use(express.json({ strict: true }))


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
    const { voltage, current, power, energy, frequency, pf,  } = req.body;
    const date = new Date();
    const data = date.toISOString().split('T')[0]
    const hora = date.toLocaleTimeString();

    console.log(req.body);

    console.log(voltage, current, power, energy, frequency, pf, data, hora);

    try {
        db.query("INSERT INTO `registros` (tensao, corrente, potencia, energia, frequencia, pf, data_registro, hora_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [voltage, current, power, energy, frequency, pf, data, hora], function(err, result){
            if(err) console.log(err)
    
            res.sendStatus(200);
        });
    } catch (error) {
        console.log("Erro: ", error)
    }
    
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});