var usuarioModel = require("../models/usuarioModel");
var validacoes = require("./validacoes");

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
                    // só a quantidade: e-mail e dados da usuária não vão para o terminal
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);

                    if (resultadoAutenticar.length == 1) {
                        res.json({
                            id: resultadoAutenticar[0].id,
                            email: resultadoAutenticar[0].email,
                            nome: resultadoAutenticar[0].nome,
                            tipo: resultadoAutenticar[0].tipo
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
    } else if (nome == "" || email == "" || senha == "") {
        res.status(400).send("Preencha todos os campos!");
    } else if (!email.includes("@") || !email.includes(".")) {
        res.status(400).send("Digite um e-mail válido!");
    } else if (nome.length > 50 || email.length > 100) {
        // mesmos limites das colunas da tabela usuaria
        res.status(400).send("O nome pode ter até 50 caracteres e o e-mail até 100!");
    } else if (validacoes.verificarSenha(senha) != "") {
        res.status(400).send(validacoes.verificarSenha(senha));
    } else if (faixaEtaria != "18-24" && faixaEtaria != "25-34" && faixaEtaria != "35+") {
        // "menor" também cai aqui: o SafePoint é só para maiores de 18 anos
        res.status(400).send("Faixa etária inválida! O SafePoint é apenas para maiores de 18 anos.");
    } else if (plataforma != "pc" && plataforma != "console" && plataforma != "celular" && plataforma != "nao_jogo") {
        res.status(400).send("Plataforma inválida!");
    } else if (!validacoes.verificarTemas(interesses)) {
        res.status(400).send("Marque pelo menos um interesse válido!");
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
                    // o email é UNIQUE: o banco não deixa cadastrar o mesmo e-mail duas vezes
                    if (erro.code == "ER_DUP_ENTRY") {
                        res.status(403).send("Este e-mail já está cadastrado!");
                    } else {
                        console.log(
                            "\nHouve um erro ao realizar o cadastro! Erro: ",
                            erro.sqlMessage
                        );
                        res.status(500).json(erro.sqlMessage);
                    }
                }
            );
    }
}

// só quantidades por faixa (para a dashboard), sem nome nem e-mail das usuárias
function listarFaixasEtarias(req, res) {
    usuarioModel.listarFaixasEtarias().then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as faixas etárias: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

// dados do cadastro da própria usuária (só usado na minha área, que exige login)
function buscarPerfil(req, res) {
    var idUsuaria = req.params.idUsuaria;

    if (!validacoes.verificarId(idUsuaria)) {
        res.status(400).send("Id da usuária inválido!");
        return;
    }

    usuarioModel.buscarPerfil(Number(idUsuaria)).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar o perfil: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    autenticar,
    cadastrar,
    listarFaixasEtarias,
    buscarPerfil
}