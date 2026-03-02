const express = require('express');
const cors = require('cors');
const connection = require('./src/database/connection'); // RUTA CORREGIDA

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ mensaje: "API Veterinaria funcionando 🐾" });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});