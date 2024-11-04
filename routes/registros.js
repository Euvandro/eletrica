const express = require('express');
const router = express.Router();
const db = require('../db').db;
const { fromZonedTime } = require('date-fns-tz');

router.get('/registros', (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1
    const limit = parseInt(req.query.limit) || 10; // Limite de registros por página, padrão é 10
    const offset = (page - 1) * limit; // Calcula o deslocamento para a consulta SQL

    // Parâmetros opcionais para intervalos de data e hora
    const dataInicio = req.query.data_inicio;
    const dataFim = req.query.data_fim;
    const horaInicio = req.query.hora_inicio;
    const horaFim = req.query.hora_fim;

    // Construindo a consulta SQL base e parâmetros
    let query = 'SELECT * FROM registros ORDER BY id DESC';
    let countQuery = 'SELECT COUNT(*) AS total FROM registros';
    const queryParams = [];
    const countParams = [];

    // Adicionando condições para intervalos de data e hora
    const conditions = [];
    
    if (dataInicio && dataFim) {
        conditions.push('data_registro BETWEEN ? AND ?');
        queryParams.push(dataInicio, dataFim);
        countParams.push(dataInicio, dataFim);
    } else if (dataInicio) {
        conditions.push('data_registro >= ?');
        queryParams.push(dataInicio);
        countParams.push(dataInicio);
    } else if (dataFim) {
        conditions.push('data_registro <= ?');
        queryParams.push(dataFim);
        countParams.push(dataFim);
    }

    if (horaInicio && horaFim) {
        conditions.push('hora_registro BETWEEN ? AND ?');
        queryParams.push(horaInicio, horaFim);
        countParams.push(horaInicio, horaFim);
    } else if (horaInicio) {
        conditions.push('hora_registro >= ?');
        queryParams.push(horaInicio);
        countParams.push(horaInicio);
    } else if (horaFim) {
        conditions.push('hora_registro <= ?');
        queryParams.push(horaFim);
        countParams.push(horaFim);
    }

    // Adiciona as condições WHERE na consulta se existirem filtros
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
        countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Adiciona limites e deslocamento para paginação
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    // Executa a consulta principal com os filtros e paginação
    db.execute(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            res.status(500).send('Error fetching records');
            return;
        }
        
        // Executa a consulta de contagem com os mesmos filtros, sem paginação
        db.execute(countQuery, countParams, (err, countResult) => {
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

router.get('/registros/estatisticas', (req, res) => {

    const data = req.query.data;

    if (!data) return res.status(500).send('Data não inserida na requisição');

    const query = `
    SELECT 
        MAX(tensao) AS maior_tensao,
        MIN(tensao) AS menor_tensao,
        MAX(corrente) AS maior_corrente,
        MIN(corrente) AS menor_corrente,
        MAX(potencia) AS maior_potencia,
        MIN(potencia) AS menor_potencia,
        
        (SELECT hora_registro 
         FROM registros 
         WHERE data_registro = ? AND tensao = (SELECT MAX(tensao) FROM registros WHERE data_registro = ?) LIMIT 1) AS horario_maior_tensao,
        
        (SELECT hora_registro 
         FROM registros 
         WHERE data_registro = ? AND tensao = (SELECT MIN(tensao) FROM registros WHERE data_registro = ?) LIMIT 1) AS horario_menor_tensao,
        
        (SELECT hora_registro 
         FROM registros 
         WHERE data_registro = ? AND corrente = (SELECT MAX(corrente) FROM registros WHERE data_registro = ?) LIMIT 1) AS horario_maior_corrente,
        
        (SELECT hora_registro 
         FROM registros 
         WHERE data_registro = ? AND corrente = (SELECT MIN(corrente) FROM registros WHERE data_registro = ?) LIMIT 1) AS horario_menor_corrente,
        
        (SELECT hora_registro 
         FROM registros 
         WHERE data_registro = ? AND potencia = (SELECT MAX(potencia) FROM registros WHERE data_registro = ?) LIMIT 1) AS horario_maior_potencia,
        
        (SELECT hora_registro 
         FROM registros 
         WHERE data_registro = ? AND potencia = (SELECT MIN(potencia) FROM registros WHERE data_registro = ?) LIMIT 1) AS horario_menor_potencia
    FROM registros
    WHERE data_registro = ?;
`;

    db.execute(query,[data, data, data, data, data, data, data, data, data, data, data, data, data] ,(err, results) => {
        if (err) {
            console.error('Erro ao executar a consulta: ' + err.stack);
            res.status(500).send('Erro ao buscar estatísticas');
            return;
        }

        res.json(results[0]); // Retorna o primeiro (e único) resultado da consulta
    });
});

router.post('/registros', (req, res) => {
    const { voltage, current, power, energy, frequency, pf,  } = req.body;
    const date = new Date();
    // const data = date.toLocaleDateString("pt-BR");

    const data = fromZonedTime(date, 'America/Sao_Paulo');
    const hora = date.toLocaleTimeString("pt-BR");


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
