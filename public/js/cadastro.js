function validar(nome, email, senha, confirmacaoSenha, plataforma, interesses) {
    let valida = true;
    let mensagem = "";

    if (nome == "" || email == "" || senha == "" || confirmacaoSenha == "" || plataforma == "") {
        valida = false;
        mensagem = "Preencha todos os campos.";
    } else if (interesses.length == 0) {
        valida = false;
        mensagem = "Marque pelo menos um interesse.";
    } else if (!email.includes("@") || !email.includes(".")) {
        valida = false;
        mensagem = "Digite um e-mail válido.";
    } else if (senha.length < 6) {
        valida = false;
        mensagem = "A senha precisa ter pelo menos 6 caracteres.";
    } else if (senha != confirmacaoSenha) {
        valida = false;
        mensagem = "As senhas não são iguais.";
    }

    div_msg.textContent = mensagem;
    return valida;
}

function cadastrar() {
    const nome = ipt_nome.value;
    const email = ipt_email.value;
    const senha = ipt_senha.value;
    const confirmacaoSenha = ipt_confirmacao_senha.value;
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

    if (validar(nome, email, senha, confirmacaoSenha, plataforma, interesses)) {
        div_msg.textContent = `Tudo certo, ${nome}!`;
    }
}
