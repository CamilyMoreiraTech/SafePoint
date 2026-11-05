// servidores aprovados que vieram da API (já ordenados pela média de segurança)
let listaServidores = [];

// cores do home.css (o Chart.js não lê as variáveis --cor-*)
const corLilas = "#c4a7ff";
const corRosa = "#ff6ad5";
const corBorda = "#5b3fa8";

let graficoToxicidade;
let graficoTemas;
let graficoFaixaEtaria;

function iniciarDashboard() {
    criarGraficos();
    listarServidores();
    listarFaixasEtarias();
}

function listarServidores() {
    fetch("/servidores/listar", {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = a API respondeu, mas não tem nenhum servidor aprovado
            listaServidores = [];
            atualizarDashboard();
            atualizarGraficoTemas();
        } else if (resposta.ok) {
            resposta.json().then(function (servidores) {
                listaServidores = servidores;
                atualizarDashboard();
                atualizarGraficoTemas();
            });
        } else {
            div_msg.innerHTML = "Não foi possível carregar os dados da dashboard.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar os dados da dashboard. Verifique se a API está iniciada.";
    });
}

function listarFaixasEtarias() {
    fetch("/usuarios/faixas-etarias", {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // nenhuma usuária cadastrada: o gráfico fica zerado
            atualizarGraficoFaixaEtaria([]);
        } else if (resposta.ok) {
            resposta.json().then(function (faixas) {
                atualizarGraficoFaixaEtaria(faixas);
            });
        } else {
            div_msg.innerHTML = "Não foi possível carregar as faixas etárias.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar os dados da dashboard. Verifique se a API está iniciada.";
    });
}

// devolve só os servidores do tema escolhido no select
function filtrarServidores() {
    const temaEscolhido = sel_tema.value;
    const filtrados = [];

    for (let i = 0; i < listaServidores.length; i++) {
        const servidor = listaServidores[i];

        // os temas chegam como texto, ex.: "games,leitura"
        if (temaEscolhido == "" || (servidor.temas != null && servidor.temas.includes(temaEscolhido))) {
            filtrados.push(servidor);
        }
    }

    return filtrados;
}

function atualizarDashboard() {
    const lista = filtrarServidores();

    let totalAvaliacoes = 0;
    let totalToxicidade = 0;
    // soma ponderada: um servidor com 10 avaliações pesa mais que um com 2
    let somaSeguranca = 0;

    for (let i = 0; i < lista.length; i++) {
        const servidor = lista[i];
        const qtdAvaliacoes = Number(servidor.total_avaliacoes);

        if (qtdAvaliacoes > 0) {
            totalAvaliacoes += qtdAvaliacoes;
            totalToxicidade += Number(servidor.total_toxicidade);
            somaSeguranca += Number(servidor.media_seguranca) * qtdAvaliacoes;
        }
    }

    div_qtd_servidores.innerHTML = lista.length;
    div_total_avaliacoes.innerHTML = totalAvaliacoes;

    // sem avaliações não dá para dividir: mostra "-" e zera o gráfico
    if (totalAvaliacoes == 0) {
        div_media_seguranca.innerHTML = "-";
        div_perc_toxicidade.innerHTML = "-";
        graficoToxicidade.data.datasets[0].data = [0, 0];
    } else {
        const mediaSeguranca = somaSeguranca / totalAvaliacoes;
        const percToxicidade = totalToxicidade / totalAvaliacoes * 100;

        div_media_seguranca.innerHTML = `${mediaSeguranca.toFixed(1).replace(".", ",")}<span>/5</span>`;
        div_perc_toxicidade.innerHTML = `${percToxicidade.toFixed(0)}<span>%</span>`;
        graficoToxicidade.data.datasets[0].data = [totalToxicidade, totalAvaliacoes - totalToxicidade];
    }

    graficoToxicidade.update();

    montarRanking(lista);
}

function montarRanking(lista) {
    // só entram no ranking servidores que já têm avaliação (a lista já vem ordenada pela API)
    const avaliados = [];
    for (let i = 0; i < lista.length; i++) {
        if (Number(lista[i].total_avaliacoes) > 0 && avaliados.length < 5) {
            avaliados.push(lista[i]);
        }
    }

    div_ranking.innerHTML = "";

    if (avaliados.length == 0) {
        div_ranking.innerHTML = `<tr><td colspan="5" class="ranking-vazio">Nenhum servidor avaliado ainda.</td></tr>`;
        return;
    }

    for (let i = 0; i < avaliados.length; i++) {
        const servidor = avaliados[i];
        const mediaSeguranca = Number(servidor.media_seguranca);

        div_ranking.innerHTML += `
            <tr>
                <td class="ranking-posicao">${i + 1}</td>
                <td id="nome_ranking_${i}"></td>
                <td>${montarTemas(servidor.temas)}</td>
                <td><span class="ranking-estrelas">${montarEstrelas(mediaSeguranca)}</span> ${mediaSeguranca.toFixed(1).replace(".", ",")}</td>
                <td>${servidor.total_avaliacoes}</td>
            </tr>`;
    }

    // o nome foi digitado por uma usuária, então entra com textContent depois que as linhas existem
    for (let i = 0; i < avaliados.length; i++) {
        document.getElementById(`nome_ranking_${i}`).textContent = avaliados[i].nome;
    }
}

// transforma "games,leitura" em "Games, Leitura"
function montarTemas(temas) {
    let texto = "";

    if (temas != null) {
        if (temas.includes("games")) {
            texto += "Games";
        }
        if (temas.includes("artesanato")) {
            if (texto != "") {
                texto += ", ";
            }
            texto += "Artesanato";
        }
        if (temas.includes("leitura")) {
            if (texto != "") {
                texto += ", ";
            }
            texto += "Leitura";
        }
    }

    return texto;
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

// conta quantos servidores (de todos os temas) têm cada tema; não muda com o filtro
function atualizarGraficoTemas() {
    let qtdGames = 0;
    let qtdArtesanato = 0;
    let qtdLeitura = 0;

    for (let i = 0; i < listaServidores.length; i++) {
        const temas = listaServidores[i].temas;

        if (temas != null) {
            if (temas.includes("games")) {
                qtdGames++;
            }
            if (temas.includes("artesanato")) {
                qtdArtesanato++;
            }
            if (temas.includes("leitura")) {
                qtdLeitura++;
            }
        }
    }

    graficoTemas.data.datasets[0].data = [qtdGames, qtdArtesanato, qtdLeitura];
    graficoTemas.update();
}

function atualizarGraficoFaixaEtaria(faixas) {
    let qtd18a24 = 0;
    let qtd25a34 = 0;
    let qtd35mais = 0;

    // a API só devolve as faixas que têm usuárias, por isso começa tudo em 0
    for (let i = 0; i < faixas.length; i++) {
        if (faixas[i].faixa_etaria == "18-24") {
            qtd18a24 = faixas[i].total_usuarias;
        } else if (faixas[i].faixa_etaria == "25-34") {
            qtd25a34 = faixas[i].total_usuarias;
        } else if (faixas[i].faixa_etaria == "35+") {
            qtd35mais = faixas[i].total_usuarias;
        }
    }

    graficoFaixaEtaria.data.datasets[0].data = [qtd18a24, qtd25a34, qtd35mais];
    graficoFaixaEtaria.update();
}

function criarGraficos() {
    graficoToxicidade = new Chart(document.getElementById("grafico_toxicidade"), {
        type: "doughnut",
        data: {
            labels: ["Sim", "Não"],
            datasets: [{
                data: [],
                backgroundColor: [corRosa, corBorda],
                borderColor: "#0f0a19"
            }]
        }
    });

    graficoTemas = new Chart(document.getElementById("grafico_temas"), {
        type: "bar",
        data: {
            labels: ["Games", "Artesanato", "Leitura"],
            datasets: [{
                label: "Servidores",
                data: [],
                backgroundColor: [corRosa, corLilas, corBorda]
            }]
        }
    });

    graficoFaixaEtaria = new Chart(document.getElementById("grafico_faixa_etaria"), {
        type: "bar",
        data: {
            labels: ["18 a 24", "25 a 34", "35 ou mais"],
            datasets: [{
                label: "Usuárias",
                data: [],
                backgroundColor: [corLilas, corRosa, corBorda]
            }]
        }
    });
}
