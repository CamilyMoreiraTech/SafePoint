var express = require("express");
var router = express.Router();

var avaliacaoController = require("../controllers/avaliacaoController");

router.get("/usuaria/:idUsuaria", function (req, res) {
    avaliacaoController.listarPorUsuaria(req, res);
});

router.post("/avaliar", function (req, res) {
    avaliacaoController.avaliar(req, res);
});

router.put("/editar/:idAvaliacao", function (req, res) {
    avaliacaoController.editar(req, res);
});

router.delete("/excluir/:idAvaliacao", function (req, res) {
    avaliacaoController.excluir(req, res);
});

module.exports = router;
