// servidores aprovados que vieram da API
let listaServidores = [];

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
                <div class="card-servidor-botoes">
                    <a id="link_servidor_${servidor.id}" class="botao-contorno">Entrar no Discord</a>
                    <a class="botao-destaque" onclick="avaliarServidor(${servidor.id})">Avaliar</a>
                </div>
            </div>
        </div>
    `;
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

// mini gráfico do card: uma barra para cada critério da avaliação
function montarGraficoCriterios(servidor) {
    // sem avaliações não tem média para desenhar (o aviso já aparece em montarNotas)
    if (Number(servidor.total_avaliacoes) == 0) {
        return "";
    }

    return `
        <div class="criterios">
            <div class="criterios-titulo">Notas por critério</div>
            ${montarBarra("Segurança", servidor.media_seguranca)}
            ${montarBarra("Moderação", servidor.media_moderacao)}
            ${montarBarra("Acolhimento", servidor.media_acolhimento)}
            ${montarBarra("Atividade", servidor.media_atividade)}
            ${montarBarra("Respeito", servidor.media_respeito)}
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
    window.location = "avaliar-servidor.html";
}
