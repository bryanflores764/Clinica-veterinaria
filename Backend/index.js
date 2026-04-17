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
// ── HU-03: Módulo Usuarios ────────────────────────────────────
const usuariosRoutes = require('./src/routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);
// ── HU-04: Módulo Auth ────────────────────────────────────────
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

// ── HU-05: Módulo Propietarios ───────────────────────────────
const propietariosRoutes = require('./src/routes/propietario.routes');
app.use('/api/propietarios', propietariosRoutes);
// ── HU-06: Módulo Mascotas────
const especiesRoutes = require('./src/routes/especies.routes');
app.use('/api/especies', especiesRoutes);

// ── HU-07: Módulo Citas ───────────────────────────────────────
const citasRoutes = require('./src/routes/citas.routes');
app.use('/api/citas', citasRoutes);

const razasRoutes = require('./src/routes/razas.routes');
app.use('/api/razas', razasRoutes);

const mascotasRoutes = require('./src/routes/mascota.routes');
app.use('/api/mascotas', mascotasRoutes);

const TipoConsultaRoutes = require('./src/routes/tipoConsulta.routes');

app.use('/api/tipoconsulta', TipoConsultaRoutes);


const estadocitaRoutes = require('./src/routes/estadocita.routes');

app.use('/api/estadocita', estadocitaRoutes);


// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ mensaje: "API Veterinaria funcionando 🐾" });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

