const express = require('express');
const cors = require('cors');

const connection = require('./src/database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// SOLO PARA PRUEBAS — simula usuario autenticado
app.use((req, res, next) => {
  req.usuario = { id: 2, RolId: 1 }; // RolId: 1 para pruebas
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

// ── HU-05: Módulo Propietarios ────────────────────────────────
const propietariosRoutes = require('./src/routes/propietario.routes');
app.use('/api/propietarios', propietariosRoutes);

// ── HU-06: Módulo Especies ────────────────────────────────────
const especiesRoutes = require('./src/routes/especies.routes');
app.use('/api/especies', especiesRoutes);

// ── HU-07: Módulo Citas ───────────────────────────────────────
const citasRoutes = require('./src/routes/citas.routes');
app.use('/api/citas', citasRoutes);

// ── Módulo Razas ──────────────────────────────────────────────
const razasRoutes = require('./src/routes/razas.routes');
app.use('/api/razas', razasRoutes);

// ── Módulo Mascotas ───────────────────────────────────────────
const mascotasRoutes = require('./src/routes/mascota.routes');
app.use('/api/mascotas', mascotasRoutes);

// ── Módulo Tipo Consulta ──────────────────────────────────────
const tipoConsultaRoutes = require('./src/routes/tipoConsulta.routes');
app.use('/api/tipoconsulta', tipoConsultaRoutes);

// ── Módulo Estado Cita ────────────────────────────────────────
const estadocitaRoutes = require('./src/routes/estadocita.routes');
app.use('/api/estadocita', estadocitaRoutes);

// ── Módulo Ventas ─────────────────────────────────────────────
const ventasRoutes = require('./src/routes/ventas.routes');
app.use('/api/ventas', ventasRoutes);

// ── Módulo Productos ──────────────────────────────────────────
const productosRoutes = require('./src/routes/productos.routes');
app.use('/api/productos', productosRoutes);

// ── Módulo Categorías ─────────────────────────────────────────
const categoriasRoutes = require('./src/routes/categorias.routes');
app.use('/api/categorias', categoriasRoutes);

// ── Módulo Historial ──────────────────────────────────────────
const historialRoutes = require('./src/routes/historial.routes');
app.use('/api/historial', historialRoutes);

// ── Módulo Vacunas ────────────────────────────────────────────
const vacunasRoutes = require('./src/routes/vacunas.routes');
app.use('/api/vacunas', vacunasRoutes);

// ── Módulo Auditoría ──────────────────────────────────────────
const auditoriaRoutes = require('./src/routes/auditoria.routes');
app.use('/api/auditoria', auditoriaRoutes);

// ── Módulo Reportes ───────────────────────────────────────────
const reportesRoutes = require('./src/routes/reportes.routes');
app.use('/api/reportes', reportesRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    mensaje: 'API Veterinaria funcionando 🐾'
  });
});

// ── Servidor ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});