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

function avaliar(req, res) {
    var notaSeguranca = req.body.notaSegurancaServer;
    var notaModeracao = req.body.notaModeracaoServer;
    var notaAcolhimento = req.body.notaAcolhimentoServer;
    var notaAtividade = req.body.notaAtividadeServer;
    var notaRespeito = req.body.notaRespeitoServer;
    var toxicidade = req.body.toxicidadeServer;
    var comentario = req.body.comentarioServer;
    var idUsuaria = req.body.idUsuariaServer;
    var idServidor = req.body.idServidorServer;

    if (notaSeguranca == undefined || notaModeracao == undefined || notaAcolhimento == undefined || notaAtividade == undefined || notaRespeito == undefined) {
        res.status(400).send("Alguma nota está undefined!");
    } else if (toxicidade == undefined) {
        res.status(400).send("A resposta sobre toxicidade está undefined!");
    } else if (idUsuaria == undefined || idServidor == undefined) {
        res.status(400).send("A usuária ou o servidor está undefined!");
    } else {

        avaliacaoModel.avaliar(notaSeguranca, notaModeracao, notaAcolhimento, notaAtividade, notaRespeito, toxicidade, comentario, idUsuaria, idServidor)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    // a tabela não deixa a mesma usuária avaliar o mesmo servidor duas vezes (UNIQUE)
                    if (erro.code == "ER_DUP_ENTRY") {
                        res.status(403).send("Você já avaliou este servidor!");
                    } else {
                        console.log("\nHouve um erro ao salvar a avaliação! Erro: ", erro.sqlMessage);
                        res.status(500).json(erro.sqlMessage);
                    }
                }
            );
    }
}

module.exports = {
    listarPorUsuaria,
    avaliar
}
