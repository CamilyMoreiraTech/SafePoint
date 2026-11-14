var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

router.get("/listar", function (req, res) {
    servidorController.listar(req, res);
});

router.post("/indicar", function (req, res) {
    servidorController.indicar(req, res);
});

router.get("/indicados/:idUsuaria", function (req, res) {
    servidorController.listarIndicados(req, res);
});

router.get("/pendentes/:idUsuaria", function (req, res) {
    servidorController.listarPendentes(req, res);
});

router.put("/moderar/:idServidor", function (req, res) {
    servidorController.moderar(req, res);
});

module.exports = router;
