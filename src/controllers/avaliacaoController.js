var avaliacaoModel = require("../models/avaliacaoModel");
var validacoes = require("./validacoes");

// avaliações que a usuária fez (para a minha área)
function listarPorUsuaria(req, res) {
    var idUsuaria = req.params.idUsuaria;

    if (!validacoes.verificarId(idUsuaria)) {
        res.status(400).send("Id da usuária inválido!");
        return;
    }

    avaliacaoModel.listarPorUsuaria(Number(idUsuaria)).then(function (resultado) {
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

    // o comentário é opcional
    if (comentario == undefined) {
        comentario = "";
    }

    if (!validacoes.verificarNota(notaSeguranca) || !validacoes.verificarNota(notaModeracao) || !validacoes.verificarNota(notaAcolhimento) || !validacoes.verificarNota(notaAtividade) || !validacoes.verificarNota(notaRespeito)) {
        res.status(400).send("Todas as notas precisam ser de 1 a 5!");
    } else if (String(toxicidade) != "0" && String(toxicidade) != "1") {
        // comparado como texto porque "" == 0 seria verdadeiro
        res.status(400).send("A resposta sobre toxicidade precisa ser 0 ou 1!");
    } else if (comentario.length > 500) {
        res.status(400).send("O comentário pode ter até 500 caracteres!");
    } else if (!validacoes.verificarId(idUsuaria) || !validacoes.verificarId(idServidor)) {
        res.status(400).send("Usuária ou servidor inválido!");
    } else {

        // a partir daqui os números já foram conferidos: vão para o SQL como Number
        avaliacaoModel.avaliar(Number(notaSeguranca), Number(notaModeracao), Number(notaAcolhimento), Number(notaAtividade), Number(notaRespeito), Number(toxicidade), comentario, Number(idUsuaria), Number(idServidor))
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
