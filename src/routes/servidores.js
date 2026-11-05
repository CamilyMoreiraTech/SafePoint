var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

router.get("/listar", function (req, res) {
    servidorController.listar(req, res);
});

module.exports = router;
