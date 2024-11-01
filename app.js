const express = require('express');
require('dotenv').config()
const db = require("./db").db;
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

//app.use(bodyParser.json());
app.use(express.json({ strict: true }))


const registrosRoutes = require('./routes/registros');
app.use('/', registrosRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});