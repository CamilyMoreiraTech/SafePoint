// a verificação de login fica no verificar-login.js

function validar(nome, link, descricao, temas) {
    let valida = true;
    let mensagem = "";

    if (nome == "" || link == "" || descricao == "") {
        valida = false;
        mensagem = "Preencha todos os campos.";
    } else if (!link.startsWith("https://discord.gg/") && !link.startsWith("https://discord.com/invite/")) {
        // o link vira o botão "Entrar no Discord" da lista, então só aceita convite do Discord
        valida = false;
        mensagem = "O link precisa começar com https://discord.gg/ ou https://discord.com/invite/";
    } else if (temas.length == 0) {
        valida = false;
        mensagem = "Marque pelo menos um tema.";
    } else if (descricao.length > 300) {
        valida = false;
        mensagem = "A descrição pode ter até 300 caracteres.";
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

function indicar() {
    const nome = ipt_nome_servidor.value;
    const link = ipt_link_convite.value;
    const descricao = ipt_descricao.value;
    const temas = [];

    if (ipt_games.checked) {
        temas.push("games");
    }
    if (ipt_artesanato.checked) {
        temas.push("artesanato");
    }
    if (ipt_leitura.checked) {
        temas.push("leitura");
    }

    if (validar(nome, link, descricao, temas)) {
        fetch("/servidores/indicar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nomeServer: nome,
                linkConviteServer: link,
                descricaoServer: descricao,
                temasServer: temas,
                idUsuariaServer: sessionStorage.ID_USUARIO
            })
        }).then(function (resposta) {
            if (resposta.ok) {
                mostrarMensagem("Indicação enviada! O servidor vai aparecer na lista depois de aprovado.");
                limparFormulario();
            } else if (resposta.status == 403) {
                // 403 = esse link de convite já foi indicado antes
                mostrarMensagem("Esse servidor já foi indicado. Obrigada por ajudar!");
            } else {
                mostrarMensagem("Não foi possível enviar a indicação. Tente novamente.");
            }
        }).catch(function (resposta) {
            console.log(`#ERRO: ${resposta}`);
            mostrarMensagem("Não foi possível enviar a indicação. Verifique se a API está iniciada.");
        });
    }
}

function limparFormulario() {
    ipt_nome_servidor.value = "";
    ipt_link_convite.value = "";
    ipt_descricao.value = "";
    ipt_games.checked = false;
    ipt_artesanato.checked = false;
    ipt_leitura.checked = false;
}
