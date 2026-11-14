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
                    // o link_convite é UNIQUE: o banco não deixa indicar o mesmo link duas vezes
                    if (erro.code == "ER_DUP_ENTRY") {
                        res.status(403).send("Esse servidor já foi indicado!");
                    } else {
                        console.log("\nHouve um erro ao indicar o servidor! Erro: ", erro.sqlMessage);
                        res.status(500).json(erro.sqlMessage);
                    }
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

// a API confere no banco se quem pediu é moderadora (esconder o botão no site não basta)
function listarPendentes(req, res) {
    var idUsuaria = req.params.idUsuaria;

    servidorModel.verificarModeradora(idUsuaria).then(function (resultadoTipo) {
        if (resultadoTipo.length == 0 || resultadoTipo[0].tipo != "moderadora") {
            res.status(403).send("Apenas moderadoras podem ver os servidores pendentes!");
        } else {
            servidorModel.listarPendentes().then(function (resultado) {
                if (resultado.length > 0) {
                    res.status(200).json(resultado);
                } else {
                    res.status(204).send("Nenhum resultado encontrado!")
                }
            }).catch(function (erro) {
                console.log(erro);
                console.log("Houve um erro ao buscar os servidores pendentes: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao verificar a moderadora: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function moderar(req, res) {
    var idServidor = req.params.idServidor;
    var status = req.body.statusServer;
    var idModeradora = req.body.idModeradoraServer;

    if (status != "aprovado" && status != "recusado") {
        res.status(400).send("O status precisa ser aprovado ou recusado!");
    } else if (idModeradora == undefined) {
        res.status(400).send("A moderadora está undefined!");
    } else {

        servidorModel.verificarModeradora(idModeradora).then(function (resultadoTipo) {
            if (resultadoTipo.length == 0 || resultadoTipo[0].tipo != "moderadora") {
                res.status(403).send("Apenas moderadoras podem aprovar ou recusar servidores!");
            } else {
                servidorModel.moderar(idServidor, status, idModeradora).then(function (resultado) {
                    // affectedRows = 0: o servidor não existe ou já tinha sido revisado
                    if (resultado.affectedRows == 0) {
                        res.status(400).send("Esse servidor não está mais pendente!");
                    } else {
                        res.json(resultado);
                    }
                }).catch(function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao moderar o servidor! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                });
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao verificar a moderadora: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    }
}

module.exports = {
    listar,
    indicar,
    listarIndicados,
    listarPendentes,
    moderar
}
