var express = require("express");
var router = express.Router();

var avaliacaoController = require("../controllers/avaliacaoController");

router.get("/usuaria/:idUsuaria", function (req, res) {
    avaliacaoController.listarPorUsuaria(req, res);
});

module.exports = router;
