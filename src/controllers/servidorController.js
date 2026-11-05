var servidorModel = require("../models/servidorModel");

function listar(req, res) {
    servidorModel.listar().then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os servidores: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function indicar(req, res) {
    var nome = req.body.nomeServer;
    var link = req.body.linkConviteServer;
    var descricao = req.body.descricaoServer;
    var temas = req.body.temasServer;
    var idUsuaria = req.body.idUsuariaServer;

    if (nome == undefined || link == undefined || descricao == undefined) {
        res.status(400).send("Nome, link ou descrição estão undefined!");
    } else if (idUsuaria == undefined) {
        res.status(400).send("A usuária que indicou está undefined!");
    } else if (temas == undefined || temas.length == 0) {
        res.status(400).send("Marque pelo menos um tema!");
    } else {

        servidorModel.indicar(nome, link, descricao, idUsuaria)
            .then(
                function (resultado) {
                    // insertId é o id do servidor que acabou de ser criado - para gravar os temas dele
                    var idServidor = resultado.insertId;

                    for (var i = 0; i < temas.length; i++) {
                        servidorModel.cadastrarTema(idServidor, temas[i])
                            .catch(function (erro) {
                                console.log(erro);
                            });
                    }
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao indicar o servidor! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

// servidores que a usuária indicou, com qualquer status (para a minha área)
function listarIndicados(req, res) {
    var idUsuaria = req.params.idUsuaria;

    servidorModel.listarIndicados(idUsuaria).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as indicações: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    listar,
    indicar,
    listarIndicados
}
