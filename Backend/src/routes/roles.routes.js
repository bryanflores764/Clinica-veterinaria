const { Router } = require("express");
const rolesController = require("../controllers/roles.controller");
const { verifyAdmin } = require("../middlewares/roles.middleware");

const router = Router();

// GET    /api/roles          → listar todos los roles
// POST   /api/roles          → crear un nuevo rol
// PUT    /api/roles/:id      → editar un rol existente

router.get("/",    verifyAdmin, rolesController.getAllRoles);
router.post("/",   verifyAdmin, rolesController.createRole);
router.put("/:id", verifyAdmin, rolesController.updateRole);

module.exports = router;