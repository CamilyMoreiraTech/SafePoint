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

// comentários de um servidor (para a tela de comentários)
function listarPorServidor(req, res) {
    var idServidor = req.params.idServidor;

    if (!validacoes.verificarId(idServidor)) {
        res.status(400).send("Id do servidor inválido!");
        return;
    }

    avaliacaoModel.listarPorServidor(Number(idServidor)).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum comentário encontrado!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os comentários: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

// regras usadas ao avaliar e ao editar: devolve o que está errado ("" quando está tudo certo)
function verificarAvaliacao(notaSeguranca, notaModeracao, notaAcolhimento, notaAtividade, toxicidade, comentario) {
    if (!validacoes.verificarNota(notaSeguranca) || !validacoes.verificarNota(notaModeracao) || !validacoes.verificarNota(notaAcolhimento) || !validacoes.verificarNota(notaAtividade)) {
        return "Todas as notas precisam ser de 1 a 5!";
    } else if (String(toxicidade) != "0" && String(toxicidade) != "1") {
        // comparado como texto porque "" == 0 seria verdadeiro
        return "A resposta sobre toxicidade precisa ser 0 ou 1!";
    } else if (comentario.length > 500) {
        return "O comentário pode ter até 500 caracteres!";
    }

    return "";
}

function avaliar(req, res) {
    var notaSeguranca = req.body.notaSegurancaServer;
    var notaModeracao = req.body.notaModeracaoServer;
    var notaAcolhimento = req.body.notaAcolhimentoServer;
    var notaAtividade = req.body.notaAtividadeServer;
    var toxicidade = req.body.toxicidadeServer;
    var comentario = req.body.comentarioServer;
    var idUsuaria = req.body.idUsuariaServer;
    var idServidor = req.body.idServidorServer;

    // o comentário é opcional
    if (comentario == undefined) {
        comentario = "";
    }

    var erroAvaliacao = verificarAvaliacao(notaSeguranca, notaModeracao, notaAcolhimento, notaAtividade, toxicidade, comentario);

    if (erroAvaliacao != "") {
        res.status(400).send(erroAvaliacao);
    } else if (!validacoes.verificarId(idUsuaria) || !validacoes.verificarId(idServidor)) {
        res.status(400).send("Usuária ou servidor inválido!");
    } else {

        // a partir daqui os números já foram conferidos: vão para o SQL como Number
        avaliacaoModel.avaliar(Number(notaSeguranca), Number(notaModeracao), Number(notaAcolhimento), Number(notaAtividade), Number(toxicidade), comentario, Number(idUsuaria), Number(idServidor))
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

function editar(req, res) {
    var idAvaliacao = req.params.idAvaliacao;
    var notaSeguranca = req.body.notaSegurancaServer;
    var notaModeracao = req.body.notaModeracaoServer;
    var notaAcolhimento = req.body.notaAcolhimentoServer;
    var notaAtividade = req.body.notaAtividadeServer;
    var toxicidade = req.body.toxicidadeServer;
    var comentario = req.body.comentarioServer;
    var idUsuaria = req.body.idUsuariaServer;

    // o comentário é opcional
    if (comentario == undefined) {
        comentario = "";
    }

    var erroAvaliacao = verificarAvaliacao(notaSeguranca, notaModeracao, notaAcolhimento, notaAtividade, toxicidade, comentario);

    if (erroAvaliacao != "") {
        res.status(400).send(erroAvaliacao);
    } else if (!validacoes.verificarId(idAvaliacao) || !validacoes.verificarId(idUsuaria)) {
        res.status(400).send("Avaliação ou usuária inválida!");
    } else {
        avaliacaoModel.editar(Number(idAvaliacao), Number(notaSeguranca), Number(notaModeracao), Number(notaAcolhimento), Number(notaAtividade), Number(toxicidade), comentario, Number(idUsuaria))
            .then(function (resultado) {
                // affectedRows 0 = a avaliação não existe ou é de outra usuária
                if (resultado.affectedRows == 0) {
                    res.status(404).send("Avaliação não encontrada!");
                } else {
                    res.json(resultado);
                }
            }).catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao editar a avaliação! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function excluir(req, res) {
    var idAvaliacao = req.params.idAvaliacao;
    var idUsuaria = req.body.idUsuariaServer;

    if (!validacoes.verificarId(idAvaliacao) || !validacoes.verificarId(idUsuaria)) {
        res.status(400).send("Avaliação ou usuária inválida!");
        return;
    }

    avaliacaoModel.excluir(Number(idAvaliacao), Number(idUsuaria)).then(function (resultado) {
        // affectedRows 0 = a avaliação não existe ou é de outra usuária
        if (resultado.affectedRows == 0) {
            res.status(404).send("Avaliação não encontrada!");
        } else {
            res.json(resultado);
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao excluir a avaliação! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    listarPorUsuaria,
    listarPorServidor,
    avaliar,
    editar,
    excluir
}
