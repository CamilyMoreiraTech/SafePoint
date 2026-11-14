// a verificação de login fica no verificar-login.js
// servidores pendentes que vieram da API
let listaPendentes = [];

function iniciarModeracao() {
    // sem login o verificarLogin já mandou para o login.html
    if (sessionStorage.ID_USUARIO == undefined) {
        return;
    }

    // quem não é moderadora volta para a home (a API também confere)
    if (sessionStorage.TIPO_USUARIO != "moderadora") {
        window.location = "index.html";
        return;
    }

    listarPendentes();
}

function listarPendentes() {
    div_msg.innerHTML = "Carregando servidores...";

    fetch(`/servidores/pendentes/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = nenhum servidor esperando revisão
            listaPendentes = [];
            div_msg.innerHTML = "";
            mostrarPendentes();
        } else if (resposta.ok) {
            resposta.json().then(function (pendentes) {
                listaPendentes = pendentes;
                div_msg.innerHTML = "";
                mostrarPendentes();
            });
        } else if (resposta.status == 403) {
            div_msg.innerHTML = "Apenas moderadoras podem ver esta página.";
        } else {
            div_msg.innerHTML = "Não foi possível carregar os servidores pendentes.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar os servidores pendentes. Verifique se a API está iniciada.";
    });
}

function mostrarPendentes() {
    div_lista_pendentes.innerHTML = "";

    for (let i = 0; i < listaPendentes.length; i++) {
        div_lista_pendentes.innerHTML += montarCard(listaPendentes[i], i + 1);
    }

    // o que foi digitado pelas usuárias entra com textContent, depois que os cards existem
    for (let i = 0; i < listaPendentes.length; i++) {
        const servidor = listaPendentes[i];
        document.getElementById(`nome_pendente_${servidor.id}`).textContent = servidor.nome;
        document.getElementById(`link_pendente_${servidor.id}`).textContent = servidor.link_convite;
        document.getElementById(`indicadora_pendente_${servidor.id}`).textContent = servidor.nome_indicadora;

        if (servidor.descricao != null) {
            document.getElementById(`descricao_pendente_${servidor.id}`).textContent = servidor.descricao;
        }
    }

    if (listaPendentes.length == 0) {
        div_lista_pendentes.innerHTML = `<div class="sem-avaliacao">Nenhum servidor aguardando revisão. Tudo em dia ♥</div>`;
    }

    if (listaPendentes.length == 1) {
        div_total.innerHTML = "1 servidor aguardando revisão";
    } else {
        div_total.innerHTML = `${listaPendentes.length} servidores aguardando revisão`;
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
                <span>${numeroTexto} › pendente.exe</span>
                <div class="janela-botoes"><span>_</span><span>□</span><span>×</span></div>
            </div>
            <div class="card-servidor-corpo">
                <h2 id="nome_pendente_${servidor.id}"></h2>
                <div class="temas">${montarTemas(servidor.temas)}</div>
                <p id="descricao_pendente_${servidor.id}"></p>
                <div class="moderacao-info">
                    <div class="moderacao-linha">
                        <span class="moderacao-rotulo">Link</span>
                        <span id="link_pendente_${servidor.id}" class="moderacao-link"></span>
                    </div>
                    <div class="moderacao-linha">
                        <span class="moderacao-rotulo">Indicado por</span>
                        <span><span id="indicadora_pendente_${servidor.id}"></span> em ${servidor.dt_indicacao}</span>
                    </div>
                </div>
                <div class="card-servidor-botoes">
                    <a class="botao-contorno" onclick="moderar(${servidor.id}, 'recusado')">Recusar</a>
                    <a class="botao-destaque" onclick="moderar(${servidor.id}, 'aprovado')">Aprovar</a>
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

function moderar(idServidor, status) {
    fetch(`/servidores/moderar/${idServidor}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            statusServer: status,
            idModeradoraServer: sessionStorage.ID_USUARIO
        })
    }).then(function (resposta) {
        if (resposta.ok) {
            if (status == "aprovado") {
                div_msg.innerHTML = "Servidor aprovado! Ele já aparece na lista de servidores.";
            } else {
                div_msg.innerHTML = "Servidor recusado.";
            }
            tirarDaLista(idServidor);
        } else if (resposta.status == 400) {
            // outra moderadora já revisou esse servidor
            div_msg.innerHTML = "Esse servidor já foi revisado.";
            tirarDaLista(idServidor);
        } else if (resposta.status == 403) {
            div_msg.innerHTML = "Apenas moderadoras podem aprovar ou recusar servidores.";
        } else {
            div_msg.innerHTML = "Não foi possível salvar. Tente novamente.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível salvar. Verifique se a API está iniciada.";
    });
}

// tira o servidor revisado da tela, sem buscar tudo de novo na API
function tirarDaLista(idServidor) {
    const novaLista = [];

    for (let i = 0; i < listaPendentes.length; i++) {
        if (listaPendentes[i].id != idServidor) {
            novaLista.push(listaPendentes[i]);
        }
    }

    listaPendentes = novaLista;
    mostrarPendentes();
}
