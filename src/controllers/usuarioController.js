var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`); // transforma JSON em String

                    if (resultadoAutenticar.length == 1) {
                        console.log(resultadoAutenticar);

                        res.json({
                            id: resultadoAutenticar[0].id,
                            email: resultadoAutenticar[0].email,
                            nome: resultadoAutenticar[0].nome
                        });
                    } else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var faixaEtaria = req.body.faixaEtariaServer;
    var plataforma = req.body.plataformaServer;
    var interesses = req.body.interessesServer;

    // Faça as validações dos valores
    if (nome == undefined || email == undefined || senha == undefined) {
        res.status(400).send("Nome, e-mail ou senha estão undefined!");
    } else if (faixaEtaria == undefined || plataforma == undefined) {
        res.status(400).send("Faixa etária ou plataforma estão undefined!");
    } else if (interesses == undefined || interesses.length == 0) {
        res.status(400).send("Marque pelo menos um interesse!");
    } else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        usuarioModel.cadastrar(nome, email, senha, faixaEtaria, plataforma)
            .then(
                function (resultado) {
                    // insertId é o id da usuária que acabou de ser criada - para gravar o interesse escolhido da usuaria
                    var idUsuaria = resultado.insertId;

                    for (var i = 0; i < interesses.length; i++) {
                        usuarioModel.cadastrarInteresse(idUsuaria, interesses[i])
                        .catch(function (erro) {
                                console.log(erro);
                        });
                }
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

module.exports = {
    autenticar,
    cadastrar
}