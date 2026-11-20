// servidores aprovados que vieram da API
let listaServidores = [];
// avaliações da usuária logada, para saber quais servidores ela já avaliou
let listaAvaliacoes = [];

// busca primeiro as avaliações da usuária e só depois monta os cards,
// assim o card já nasce com "Avaliar" ou "Você já avaliou"
function iniciarServidores() {
    fetch(`/avaliacoes/usuaria/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.ok && resposta.status != 204) {
            resposta.json().then(function (avaliacoes) {
                listaAvaliacoes = avaliacoes;
                listarServidores();
            });
        } else {
            // 204 = ainda não avaliou nenhum; erro = os cards aparecem todos com "Avaliar"
            listarServidores();
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        listarServidores();
    });
}

function listarServidores() {
    fetch("/servidores/listar", {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = a API respondeu, mas não tem nenhum servidor aprovado
            listaServidores = [];
            mostrarServidores();
        } else if (resposta.ok) {
            resposta.json().then(function (servidores) {
                listaServidores = servidores;
                mostrarServidores();
            });
        } else {
            div_msg.innerHTML = "Não foi possível carregar os servidores.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar os servidores. Verifique se a API está iniciada.";
    });
}

function mostrarServidores() {
    const temaEscolhido = sel_tema.value;
    const servidoresMostrados = [];

    div_lista_servidores.innerHTML = "";

    for (let i = 0; i < listaServidores.length; i++) {
        const servidor = listaServidores[i];

        // os temas chegam como texto, ex.: "games,leitura"
        if (temaEscolhido == "" || (servidor.temas != null && servidor.temas.includes(temaEscolhido))) {
            servidoresMostrados.push(servidor);
            div_lista_servidores.innerHTML += montarCard(servidor, servidoresMostrados.length);
        }
    }

    // o que foi digitado pelas usuárias entra com textContent, depois que todos os cards existem
    for (let i = 0; i < servidoresMostrados.length; i++) {
        preencherTextos(servidoresMostrados[i]);
    }

    if (servidoresMostrados.length == 0) {
        div_msg.innerHTML = "Nenhum servidor aprovado encontrado.";
    } else {
        div_msg.innerHTML = "";
    }

    if (servidoresMostrados.length == 1) {
        div_total.innerHTML = "1 servidor encontrado";
    } else {
        div_total.innerHTML = `${servidoresMostrados.length} servidores encontrados`;
    }
}

function montarCard(servidor, numero) {
    const idAvaliacao = buscarIdAvaliacao(servidor.id);

    let numeroTexto = numero;
    if (numero < 10) {
        numeroTexto = `0${numero}`;
    }

    return `
        <div class="janela card-servidor">
            <div class="janela-barra">
                <span>${numeroTexto} › servidor.exe</span>
                <div class="janela-botoes"><span>_</span><span>□</span><span>×</span></div>
            </div>
            <div class="card-servidor-corpo">
                <h2 id="nome_servidor_${servidor.id}"></h2>
                <div class="temas">${montarTemas(servidor.temas)}</div>
                <p id="descricao_servidor_${servidor.id}"></p>
                ${montarNotas(servidor)}
                ${montarGraficoCriterios(servidor)}
                ${montarAvisoAvaliado(idAvaliacao)}
                <div class="card-servidor-botoes">
                    <a id="link_servidor_${servidor.id}" class="botao-contorno">Entrar no Discord</a>
                    ${montarBotaoAvaliar(servidor.id, idAvaliacao)}
                </div>
                <a class="card-servidor-comentarios" onclick="verComentarios(${servidor.id})">» Comentários das usuárias</a>
            </div>
        </div>
    `;
}

// devolve o id da avaliação que a usuária fez neste servidor (0 = ainda não avaliou)
function buscarIdAvaliacao(idServidor) {
    for (let i = 0; i < listaAvaliacoes.length; i++) {
        if (listaAvaliacoes[i].fk_servidor == idServidor) {
            return listaAvaliacoes[i].id;
        }
    }

    return 0;
}

function montarAvisoAvaliado(idAvaliacao) {
    if (idAvaliacao == 0) {
        return "";
    }

    return `<div class="card-servidor-avaliado">✓ Você já avaliou este servidor</div>`;
}

// quem já avaliou vê "Editar" no lugar de "Avaliar"
function montarBotaoAvaliar(idServidor, idAvaliacao) {
    if (idAvaliacao == 0) {
        return `<a class="botao-destaque" onclick="avaliarServidor(${idServidor})">Avaliar</a>`;
    }

    return `<a class="botao-destaque" onclick="editarAvaliacao(${idAvaliacao}, ${idServidor})">Editar avaliação</a>`;
}

function montarTemas(temas) {
    let temasHtml = "";

    if (temas != null) {
        if (temas.includes("games")) {
            temasHtml += `<span class="tema">Games</span>`;
        }
        if (temas.includes("artesanato")) {
            temasHtml += `<span class="tema">Artesanato</span>`;
        }
        if (temas.includes("leitura")) {
            temasHtml += `<span class="tema">Leitura</span>`;
        }
    }

    return temasHtml;
}

function montarNotas(servidor) {
    const totalAvaliacoes = Number(servidor.total_avaliacoes);

    // sem avaliações não dá para calcular média (evita NaN e divisão por zero)
    if (totalAvaliacoes == 0) {
        return `<div class="sem-avaliacao">Ainda sem avaliações. Seja a primeira a avaliar!</div>`;
    }

    const mediaSeguranca = Number(servidor.media_seguranca);
    const percToxicidade = Number(servidor.total_toxicidade) / totalAvaliacoes * 100;

    return `
        <div class="notas">
            <div class="nota">
                <div class="nota-valor">${mediaSeguranca.toFixed(1).replace(".", ",")}</div>
                <div class="estrelas">${montarEstrelas(mediaSeguranca)}</div>
                <div class="nota-legenda">Segurança</div>
            </div>
            <div class="nota">
                <div class="nota-valor">${totalAvaliacoes}</div>
                <div class="nota-legenda">Avaliações</div>
            </div>
            <div class="nota">
                <div class="nota-valor">${percToxicidade.toFixed(0)}%</div>
                <div class="nota-legenda">Relatos de toxicidade</div>
            </div>
        </div>
    `;
}

// monta 5 estrelas a partir da média (ex.: 4.2 vira ★★★★☆)
function montarEstrelas(media) {
    let estrelas = "";

    for (let i = 1; i <= 5; i++) {
        if (media >= i - 0.5) {
            estrelas += "★";
        } else {
            estrelas += "☆";
        }
    }

    return estrelas;
}

// mini gráfico do card: uma barra por critério (segurança fica de fora porque já aparece em destaque nas notas)
function montarGraficoCriterios(servidor) {
    // sem avaliações não tem média para desenhar (o aviso já aparece em montarNotas)
    if (Number(servidor.total_avaliacoes) == 0) {
        return "";
    }

    return `
        <div class="criterios">
            <div class="criterios-titulo">Notas de outros critério</div>
            ${montarBarra("Moderação", servidor.media_moderacao)}
            ${montarBarra("Acolhimento", servidor.media_acolhimento)}
            ${montarBarra("Atividade", servidor.media_atividade)}
        </div>
    `;
}

// a largura da barra é a média em porcentagem da nota máxima (5 = 100%)
function montarBarra(criterio, media) {
    const nota = Number(media);
    const percBarra = nota / 5 * 100;

    return `
        <div class="criterio">
            <span class="criterio-nome">${criterio}</span>
            <div class="criterio-trilha">
                <div class="criterio-barra" style="width: ${percBarra}%"></div>
            </div>
            <span class="criterio-valor">${nota.toFixed(1).replace(".", ",")}</span>
        </div>
    `;
}

function preencherTextos(servidor) {
    document.getElementById(`nome_servidor_${servidor.id}`).textContent = servidor.nome;

    if (servidor.descricao != null) {
        document.getElementById(`descricao_servidor_${servidor.id}`).textContent = servidor.descricao;
    }

    document.getElementById(`link_servidor_${servidor.id}`).href = servidor.link_convite;
}

function avaliarServidor(idServidor) {
    // guarda qual servidor foi escolhido para a página de avaliação saber
    sessionStorage.ID_SERVIDOR_AVALIAR = idServidor;
    // avaliação nova: apaga uma edição que tenha ficado pela metade
    sessionStorage.removeItem("ID_AVALIACAO_EDITAR");
    window.location = "avaliar-servidor.html";
}

// guarda qual servidor foi escolhido para a tela de comentários saber
function verComentarios(idServidor) {
    sessionStorage.ID_SERVIDOR_COMENTARIOS = idServidor;
    window.location = "comentarios.html";
}

// mesmo caminho do botão "Editar" da minha área: a tela de avaliar abre já preenchida
function editarAvaliacao(idAvaliacao, idServidor) {
    sessionStorage.ID_AVALIACAO_EDITAR = idAvaliacao;
    sessionStorage.ID_SERVIDOR_AVALIAR = idServidor;
    window.location = "avaliar-servidor.html";
}
