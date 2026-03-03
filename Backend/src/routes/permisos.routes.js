// ============================================================
//  CAPA: Routes
//  Archivo: permisos.routes.js
//
//  Responsabilidad:
//    • Define las rutas del módulo Permisos.
//    • Asocia cada ruta con su método HTTP, middleware(s) y controller.
//    • Muestra el ejemplo de uso de verificarPermiso() en rutas protegidas.
// ============================================================

const { Router } = require('express');
const PermisosController = require('../controllers/permisos.controller');
const { verificarPermiso } = require('../middlewares/permisos.middleware');

// Asumimos que ya existe un middleware de autenticación que
// inyecta req.usuario = { id, RolId, ... } antes de llegar aquí.
// Ejemplo: const autenticar = require('../middlewares/autenticar');

const router = Router();

// ──────────────────────────────────────────────
//  Rutas del módulo Permisos
// ──────────────────────────────────────────────

/**
 * POST /permisos
 * Crea o actualiza un permiso (upsert).
 * Sólo usuarios con permiso de CREAR sobre el módulo "Permisos" pueden hacerlo.
 *
 * Si quieres proteger esta ruta:
 *   router.post('/', autenticar, verificarPermiso('Permisos', 'Puede_Crear'), PermisosController.asignarPermiso);
 */
router.post(
  '/',
  verificarPermiso('Permisos', 'Puede_Crear'),
  PermisosController.asignarPermiso
);

/**
 * GET /permisos
 * Lista todos los permisos registrados.
 * Protegido con verificarPermiso → sólo roles con Puede_Leer en "Permisos".
 */
router.get(
  '/',
  verificarPermiso('Permisos', 'Puede_Leer'),
  PermisosController.obtenerTodos
);

/**
 * GET /permisos/rol/:rolId
 * Lista permisos de un rol específico.
 */
router.get(
  '/rol/:rolId',
  verificarPermiso('Permisos', 'Puede_Leer'),
  PermisosController.obtenerPorRol
);

/**
 * DELETE /permisos/rol/:rolId/modulo/:modulo
 * Elimina el permiso de un rol sobre un módulo.
 */
router.delete(
  '/rol/:rolId/modulo/:modulo',
  verificarPermiso('Permisos', 'Puede_Eliminar'),
  PermisosController.eliminarPermiso
);

// ──────────────────────────────────────────────
//  Ejemplo de uso en OTRO módulo (Usuarios)
// ──────────────────────────────────────────────
//
//  const usuariosRouter = Router();
//  const UsuariosController = require('../controllers/controller');
//
//  // Crear usuario  → necesita Puede_Crear en módulo "Usuarios"
//  usuariosRouter.post(
//    '/usuarios',
//    verificarPermiso('Usuarios', 'Puede_Crear'),
//    UsuariosController.crearUsuario
//  );
//
//  // Leer usuarios  → necesita Puede_Leer en módulo "Usuarios"
//  usuariosRouter.get(
//    '/usuarios',
//    verificarPermiso('Usuarios', 'Puede_Leer'),
//    UsuariosController.obtenerUsuarios
//  );
//
//  // Editar usuario → necesita Puede_Editar en módulo "Usuarios"
//  usuariosRouter.put(
//    '/usuarios/:id',
//    verificarPermiso('Usuarios', 'Puede_Editar'),
//    UsuariosController.editarUsuario
//  );
//
//  // Eliminar usuario → necesita Puede_Eliminar en módulo "Usuarios"
//  usuariosRouter.delete(
//    '/usuarios/:id',
//    verificarPermiso('Usuarios', 'Puede_Eliminar'),
//    UsuariosController.eliminarUsuario
//  );

module.exports = router;