// // ============================================================
// //  CAPA: Routes
// //  Archivo: auth.routes.js
// // ============================================================

// const { Router } = require('express');
// const authController = require('../controllers/auth.controller');

// const router = Router();

// router.post('/login',  authController.login);
// router.post('/logout', authController.logout);

// module.exports = router;

const express = require("express");
const router = express.Router();
const connection = require("../database/connection");

router.post("/login", (req, res) => {

    const { usuario, password } = req.body;

    const sql = "SELECT id, usuario, RolId FROM usuarios WHERE usuario=? AND password=?";

    connection.query(sql, [usuario, password], (err, result) => {

        if(err){
            return res.status(500).json({error:"Error del servidor"});
        }

        if(result.length === 0){
            return res.json({success:false});
        }

        const user = result[0];

        res.json({
            success:true,
            rol:user.RolId
        });

    });

});

module.exports = router;