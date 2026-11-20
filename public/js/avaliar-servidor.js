// a verificação de login fica no verificar-login.js
// o id do servidor foi guardado pelo botão "Avaliar" da tela de servidores
// quando existe ID_AVALIACAO_EDITAR (botão "Editar" da minha área), a tela edita em vez de criar

function iniciarAvaliacao() {
    if (sessionStorage.ID_USUARIO == undefined) {
        return;
    }

    if (sessionStorage.ID_SERVIDOR_AVALIAR == undefined) {
        mostrarMensagem("Escolha um servidor na lista de servidores para avaliar.");
        return;
    }

    buscarNomeServidor();

    if (sessionStorage.ID_AVALIACAO_EDITAR != undefined) {
        buscarAvaliacao();
    }
}

// reaproveita a rota da minha área e procura a avaliação escolhida para preencher o formulário
function buscarAvaliacao() {
    fetch(`/avaliacoes/usuaria/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.ok && resposta.status != 204) {
            resposta.json().then(function (avaliacoes) {
                let encontrou = false;

                for (let i = 0; i < avaliacoes.length; i++) {
                    if (avaliacoes[i].id == sessionStorage.ID_AVALIACAO_EDITAR) {
                        preencherFormulario(avaliacoes[i]);
                        encontrou = true;
                    }
                }

                if (!encontrou) {
                    sessionStorage.removeItem("ID_AVALIACAO_EDITAR");
                    mostrarMensagem("Não encontramos essa avaliação. Ela pode ter sido excluída.");
                }
            });
        } else {
            mostrarMensagem("Não foi possível carregar a sua avaliação.");
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        mostrarMensagem("Não foi possível carregar a sua avaliação. Verifique se a API está iniciada.");
    });
}

function preencherFormulario(avaliacao) {
    sel_seguranca.value = avaliacao.nota_seguranca;
    sel_moderacao.value = avaliacao.nota_moderacao;
    sel_acolhimento.value = avaliacao.nota_acolhimento;
    sel_atividade.value = avaliacao.nota_atividade;
    sel_respeito.value = avaliacao.nota_respeito;
    sel_toxicidade.value = avaliacao.presenciou_toxicidade;

    // value de textarea não interpreta HTML, então o comentário entra com segurança
    if (avaliacao.comentario != null) {
        ipt_comentario.value = avaliacao.comentario;
    }

    btn_avaliar.innerHTML = "[ Salvar alterações ] →";
}

// reaproveita a rota da lista de servidores e procura o servidor escolhido
function buscarNomeServidor() {
    fetch("/servidores/listar", {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = nenhum servidor aprovado, então o escolhido também não está na lista
            mostrarMensagem("Este servidor não está disponível para avaliação. Escolha um servidor na lista de servidores.");
        } else if (resposta.ok) {
            resposta.json().then(function (servidores) {
                let encontrou = false;

                for (let i = 0; i < servidores.length; i++) {
                    if (servidores[i].id == sessionStorage.ID_SERVIDOR_AVALIAR) {
                        // o nome foi digitado por uma usuária: entra com textContent
                        div_nome_servidor.textContent = servidores[i].nome;
                        encontrou = true;
                    }
                }

                // a lista só tem aprovados: se não achou, o servidor não pode ser avaliado
                if (!encontrou) {
                    mostrarMensagem("Este servidor não está disponível para avaliação. Escolha um servidor na lista de servidores.");
                }
            });
        } else {
            mostrarMensagem("Não foi possível carregar o servidor.");
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        mostrarMensagem("Não foi possível carregar o servidor. Verifique se a API está iniciada.");
    });
}

function validar(notas, toxicidade, comentario) {
    let valida = true;
    let mensagem = "";

    // "Escolha" tem value "", e Number("") vira 0, que fica fora do intervalo
    for (let i = 0; i < notas.length; i++) {
        if (notas[i] < 1 || notas[i] > 5) {
            valida = false;
            mensagem = "Dê uma nota de 1 a 5 em todos os critérios.";
        }
    }

    if (valida && toxicidade == "") {
        valida = false;
        mensagem = "Responda se você presenciou toxicidade no servidor.";
    } else if (valida && comentario.length > 500) {
        valida = false;
        mensagem = "O comentário pode ter até 500 caracteres.";
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

function avaliar() {
    const notaSeguranca = Number(sel_seguranca.value);
    const notaModeracao = Number(sel_moderacao.value);
    const notaAcolhimento = Number(sel_acolhimento.value);
    const notaAtividade = Number(sel_atividade.value);
    const notaRespeito = Number(sel_respeito.value);
    const toxicidade = sel_toxicidade.value;
    const comentario = ipt_comentario.value;

    const notas = [notaSeguranca, notaModeracao, notaAcolhimento, notaAtividade, notaRespeito];

    if (sessionStorage.ID_SERVIDOR_AVALIAR == undefined) {
        mostrarMensagem("Escolha um servidor na lista de servidores para avaliar.");
    } else if (validar(notas, toxicidade, comentario)) {
        const dadosAvaliacao = {
            notaSegurancaServer: notaSeguranca,
            notaModeracaoServer: notaModeracao,
            notaAcolhimentoServer: notaAcolhimento,
            notaAtividadeServer: notaAtividade,
            notaRespeitoServer: notaRespeito,
            toxicidadeServer: Number(toxicidade),
            comentarioServer: comentario,
            idUsuariaServer: sessionStorage.ID_USUARIO,
            idServidorServer: sessionStorage.ID_SERVIDOR_AVALIAR
        };

        if (sessionStorage.ID_AVALIACAO_EDITAR != undefined) {
            salvarEdicao(dadosAvaliacao);
        } else {
            enviarAvaliacao(dadosAvaliacao);
        }
    }
}

function enviarAvaliacao(dadosAvaliacao) {
    fetch("/avaliacoes/avaliar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosAvaliacao)
    }).then(function (resposta) {
        if (resposta.ok) {
            mostrarMensagem("Avaliação enviada!");
            limparFormulario();
        } else if (resposta.status == 403) {
            // 403 = a usuária já tinha avaliado este servidor
            mostrarMensagem("Você já avaliou este servidor.");
        } else {
            mostrarMensagem("Não foi possível enviar a avaliação. Tente novamente.");
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        mostrarMensagem("Não foi possível enviar a avaliação. Verifique se a API está iniciada.");
    });
}

// atualiza a avaliação que veio do botão "Editar" e volta para a minha área
function salvarEdicao(dadosAvaliacao) {
    fetch(`/avaliacoes/editar/${sessionStorage.ID_AVALIACAO_EDITAR}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosAvaliacao)
    }).then(function (resposta) {
        if (resposta.ok) {
            sessionStorage.removeItem("ID_AVALIACAO_EDITAR");
            mostrarMensagem("Avaliação atualizada! Voltando para a sua área...");

            setTimeout(function () {
                window.location = "minha-area.html";
            }, 2000);
        } else if (resposta.status == 404) {
            // 404 = a avaliação não existe mais ou não é desta usuária
            mostrarMensagem("Não encontramos essa avaliação. Ela pode ter sido excluída.");
        } else {
            mostrarMensagem("Não foi possível salvar as alterações. Tente novamente.");
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        mostrarMensagem("Não foi possível salvar as alterações. Verifique se a API está iniciada.");
    });
}

function limparFormulario() {
    sel_seguranca.value = "";
    sel_moderacao.value = "";
    sel_acolhimento.value = "";
    sel_atividade.value = "";
    sel_respeito.value = "";
    sel_toxicidade.value = "";
    ipt_comentario.value = "";
}
