const db = require("./db").db;

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

//app.use(bodyParser.json());
app.use(express.json({ strict: true }))


const registrosRoutes = require('./routes/registros');
app.use('/registros', registrosRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});