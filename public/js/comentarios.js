// o id do servidor foi guardado pelo botão "Comentários das usuárias" da tela de servidores

function iniciarComentarios() {
    if (sessionStorage.ID_USUARIO == undefined) {
        return;
    }

    if (sessionStorage.ID_SERVIDOR_COMENTARIOS == undefined) {
        div_msg.innerHTML = "Escolha um servidor na lista de servidores para ver os comentários.";
        return;
    }

    buscarServidor();
    listarComentarios();
}

// reaproveita a rota da lista de servidores e procura o servidor escolhido
function buscarServidor() {
    fetch("/servidores/listar", {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.ok && resposta.status != 204) {
            resposta.json().then(function (servidores) {
                for (let i = 0; i < servidores.length; i++) {
                    if (servidores[i].id == sessionStorage.ID_SERVIDOR_COMENTARIOS) {
                        mostrarServidor(servidores[i]);
                    }
                }
            });
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
    });
}

function mostrarServidor(servidor) {
    const totalAvaliacoes = Number(servidor.total_avaliacoes);

    // o nome foi digitado por uma usuária: entra com textContent
    div_nome_servidor.textContent = servidor.nome;

    // sem avaliações não dá para calcular média (evita NaN)
    if (totalAvaliacoes == 0) {
        div_resumo.innerHTML = "Ainda sem avaliações.";
    } else {
        const mediaSeguranca = Number(servidor.media_seguranca);
        div_resumo.innerHTML = `Segurança ${mediaSeguranca.toFixed(1).replace(".", ",")} ${montarEstrelas(mediaSeguranca)} · ${totalAvaliacoes} avaliações`;
    }
}

function listarComentarios() {
    fetch(`/avaliacoes/servidor/${sessionStorage.ID_SERVIDOR_COMENTARIOS}`, {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = a API respondeu, mas ninguém deixou comentário neste servidor
            div_msg.innerHTML = "Este servidor ainda não tem comentários.";
        } else if (resposta.ok) {
            resposta.json().then(function (comentarios) {
                mostrarComentarios(comentarios);
            });
        } else {
            div_msg.innerHTML = "Não foi possível carregar os comentários.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar os comentários. Verifique se a API está iniciada.";
    });
}

function mostrarComentarios(comentarios) {
    div_msg.innerHTML = "";
    div_lista_comentarios.innerHTML = "";

    for (let i = 0; i < comentarios.length; i++) {
        div_lista_comentarios.innerHTML += montarComentario(comentarios[i]);
    }

    // o texto do comentário foi digitado por uma usuária: entra com textContent
    for (let i = 0; i < comentarios.length; i++) {
        document.getElementById(`texto_comentario_${comentarios[i].id}`).textContent = comentarios[i].comentario;
    }
}

function montarComentario(comentario) {
    let etiquetaToxicidade = "";
    if (comentario.presenciou_toxicidade == 1) {
        etiquetaToxicidade = `<span class="comentario-toxicidade">Relatou toxicidade</span>`;
    }

    return `
        <div class="comentario">
            <div class="comentario-topo">
                <span class="comentario-estrelas">${montarEstrelas(Number(comentario.nota_seguranca))}</span>
                ${etiquetaToxicidade}
                <span class="comentario-data">${comentario.dt_avaliacao}</span>
            </div>
            <p id="texto_comentario_${comentario.id}" class="comentario-texto"></p>
        </div>
    `;
}

// monta 5 estrelas a partir da nota (ex.: 4.2 vira ★★★★☆)
function montarEstrelas(nota) {
    let estrelas = "";

    for (let i = 1; i <= 5; i++) {
        if (nota >= i - 0.5) {
            estrelas += "★";
        } else {
            estrelas += "☆";
        }
    }

    return estrelas;
}
