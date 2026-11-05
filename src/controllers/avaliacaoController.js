var avaliacaoModel = require("../models/avaliacaoModel");

// avaliações que a usuária fez (para a minha área)
function listarPorUsuaria(req, res) {
    var idUsuaria = req.params.idUsuaria;

    avaliacaoModel.listarPorUsuaria(idUsuaria).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as avaliações: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    listarPorUsuaria
}
