const express = require('express');
const cors = require('cors');
const connection = require('./src/database/connection');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// SOLO PARA PRUEBAS — simula usuario autenticado
app.use((req, res, next) => {
  req.usuario = { id: 2, RolId: 1 }; // ← RolId: 1 para pruebas
  next();
});

// ── HU-01: Módulo Roles ───────────────────────────────────────
const rolesRoutes = require('./src/routes/roles.routes');
app.use('/api/roles', rolesRoutes);

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

// ── HU-03: Módulo Usuarios ────────────────────────────────────
const usuariosRoutes = require('./src/routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);
// ── HU-04: Módulo Auth ────────────────────────────────────────
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);