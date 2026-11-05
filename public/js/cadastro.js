// confere cada caractere da senha e devolve o que está faltando ("" quando está tudo certo)
function verificarSenha(senha) {
    const maiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const minusculas = "abcdefghijklmnopqrstuvwxyz";
    const numeros = "0123456789";

    let temMaiuscula = false;
    let temMinuscula = false;
    let temNumero = false;
    let temEspecial = false;

    for (let i = 0; i < senha.length; i++) {
        const caractere = senha[i];

        if (maiusculas.includes(caractere)) {
            temMaiuscula = true;
        } else if (minusculas.includes(caractere)) {
            temMinuscula = true;
        } else if (numeros.includes(caractere)) {
            temNumero = true;
        } else {
            // tudo que não é letra sem acento nem número conta como especial
            temEspecial = true;
        }
    }

    if (senha.length < 6) {
        return "A senha precisa ter pelo menos 6 caracteres.";
    } else if (!temMaiuscula) {
        return "A senha precisa ter pelo menos uma letra maiúscula.";
    } else if (!temMinuscula) {
        return "A senha precisa ter pelo menos uma letra minúscula.";
    } else if (!temNumero) {
        return "A senha precisa ter pelo menos um número.";
    } else if (!temEspecial) {
        return "A senha precisa ter pelo menos um caractere especial (ex.: @, #, !).";
    }

    return "";
}

function validar(nome, email, senha, confirmacaoSenha, faixaEtaria, plataforma, interesses) {
    let valida = true;
    let mensagem = "";
    const erroSenha = verificarSenha(senha);

    if (nome == "" || email == "" || senha == "" || confirmacaoSenha == "" || faixaEtaria == "" || plataforma == "") {
        valida = false;
        mensagem = "Preencha todos os campos.";
    } else if (faixaEtaria == "menor") {
        valida = false;
        mensagem = "O SafePoint é apenas para maiores de 18 anos.";
    } else if (interesses.length == 0) {
        valida = false;
        mensagem = "Marque pelo menos um interesse.";
    } else if (!email.includes("@") || !email.includes(".")) {
        valida = false;
        mensagem = "Digite um e-mail válido.";
    } else if (erroSenha != "") {
        valida = false;
        mensagem = erroSenha;
    } else if (senha != confirmacaoSenha) {
        valida = false;
        mensagem = "As senhas não são iguais.";
    }

    if (valida) {
        cardErro.style.display = "none";
    } else {
        mostrarMensagem(mensagem);
    }

    return valida;
}

function mostrarMensagem(mensagem) {
    cardErro.style.display = "block";
    mensagem_erro.innerHTML = mensagem;
}

function cadastrar() {
    const nome = ipt_nome.value;
    const email = ipt_email.value;
    const senha = ipt_senha.value;
    const confirmacaoSenha = ipt_confirmacao_senha.value;
    const faixaEtaria = sel_faixa_etaria.value;
    const plataforma = sel_plataforma.value;
    const interesses = [];

    if (ipt_games.checked) {
        interesses.push("games");
    }
    if (ipt_artesanato.checked) {
        interesses.push("artesanato");
    }
    if (ipt_leitura.checked) {
        interesses.push("leitura");
    }

    if (validar(nome, email, senha, confirmacaoSenha, faixaEtaria, plataforma, interesses)) {
        fetch("/usuarios/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nomeServer: nome,
                emailServer: email,
                senhaServer: senha,
                faixaEtariaServer: faixaEtaria,
                plataformaServer: plataforma,
                interessesServer: interesses
            })
        }).then(function (resposta) {
            if (resposta.ok) {
                mostrarMensagem("Cadastro realizado com sucesso! Redirecionando para tela de Login...");

                setTimeout(function () {
                    window.location = "login.html";
                }, 2000);
            } else {
                throw "Houve um erro ao tentar realizar o cadastro!";
            }
        }).catch(function (resposta) {
            console.log(`#ERRO: ${resposta}`);
            finalizarAguardar();
        });
    }
}
