const express = require('express');
const cors = require('cors');
const connection = require('./src/database/connection'); // RUTA CORREGIDA

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// SOLO PARA PRUEBAS — simula usuario autenticado con RolId=1
app.use((req, res, next) => {
  req.usuario = { id: 2, RolId: 2 };
  next();
});
// ── HU-02: Módulo Permisos ────────────────────────────────────
const permisosRoutes = require('./src/routes/permisos.routes');
app.use('/api/permisos', permisosRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ mensaje: "API Veterinaria funcionando 🐾" });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

