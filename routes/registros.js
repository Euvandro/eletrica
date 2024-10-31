const express = require('express');
const router = express.Router();
const db = require('../db').db;


router.get('/registros', (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1
    const limit = parseInt(req.query.limit) || 10; // Limite de registros por página, padrão é 10
    const offset = (page - 1) * limit; // Calcula o deslocamento para a consulta SQL

    db.execute('SELECT * FROM registros ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            res.status(500).send('Error fetching records');
            return;
        }
        
        db.execute('SELECT COUNT(*) AS total FROM registros', (err, countResult) => {
            if (err) {
                console.error('Error executing count query: ' + err.stack);
                res.status(500).send('Error fetching record count');
                return;
            }

            const totalRecords = countResult[0].total;
            const totalPages = Math.ceil(totalRecords / limit);

            res.json({
                data: results,
                page,
                totalPages,
                totalRecords,
                limit,
            });
        });
    });
});

router.post('/registros', (req, res) => {
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




module.exports = router;
