function iniciarMinhaArea() {
    // sem login o verificarLogin já mandou para o login.html: não busca nada
    if (sessionStorage.ID_USUARIO == undefined) {
        return;
    }

    div_nome_usuaria.textContent = sessionStorage.NOME_USUARIO;

    buscarPerfil();
    listarIndicacoes();
    listarAvaliacoes();
}

function buscarPerfil() {
    fetch(`/usuarios/perfil/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.ok && resposta.status != 204) {
            resposta.json().then(function (resultado) {
                mostrarPerfil(resultado[0]);
            });
        } else {
            div_msg.innerHTML = "Não foi possível carregar o seu perfil.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar a sua área. Verifique se a API está iniciada.";
    });
}

function mostrarPerfil(perfil) {
    div_email.textContent = perfil.email;
    div_dt_cadastro.innerHTML = perfil.dt_cadastro;

    // os valores salvos no banco viram textos mais bonitos
    if (perfil.faixa_etaria == "18-24") {
        div_faixa_etaria.innerHTML = "18 a 24 anos";
    } else if (perfil.faixa_etaria == "25-34") {
        div_faixa_etaria.innerHTML = "25 a 34 anos";
    } else {
        div_faixa_etaria.innerHTML = "35 anos ou mais";
    }

    if (perfil.plataforma == "pc") {
        div_plataforma.innerHTML = "PC";
    } else if (perfil.plataforma == "console") {
        div_plataforma.innerHTML = "Console";
    } else if (perfil.plataforma == "celular") {
        div_plataforma.innerHTML = "Celular";
    } else {
        div_plataforma.innerHTML = "Não joga";
    }

    div_interesses.innerHTML = montarEtiquetas(perfil.interesses);
}

function listarIndicacoes() {
    fetch(`/servidores/indicados/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = a usuária ainda não indicou nenhum servidor
            mostrarIndicacoes([]);
        } else if (resposta.ok) {
            resposta.json().then(function (indicacoes) {
                mostrarIndicacoes(indicacoes);
            });
        } else {
            div_indicacoes.innerHTML = `<div class="area-vazio">Não foi possível carregar as suas indicações.</div>`;
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_indicacoes.innerHTML = `<div class="area-vazio">Não foi possível carregar as suas indicações.</div>`;
    });
}

function mostrarIndicacoes(indicacoes) {
    let qtdAprovados = 0;

    div_indicacoes.innerHTML = "";

    for (let i = 0; i < indicacoes.length; i++) {
        const servidor = indicacoes[i];

        if (servidor.status == "aprovado") {
            qtdAprovados++;
        }

        div_indicacoes.innerHTML += `
            <div class="item">
                <div class="item-topo">
                    <span id="nome_indicacao_${i}" class="item-nome"></span>
                    ${montarStatus(servidor.status)}
                </div>
                <div class="item-detalhe">${montarTemas(servidor.temas)} · indicado em ${servidor.dt_indicacao}</div>
            </div>`;
    }

    // o nome foi digitado pela usuária, então entra com textContent depois que os itens existem
    for (let i = 0; i < indicacoes.length; i++) {
        document.getElementById(`nome_indicacao_${i}`).textContent = indicacoes[i].nome;
    }

    if (indicacoes.length == 0) {
        div_indicacoes.innerHTML = `<div class="area-vazio">Você ainda não indicou nenhum servidor.</div>`;
    }

    div_qtd_indicados.innerHTML = indicacoes.length;
    div_qtd_aprovados.innerHTML = qtdAprovados;
}

function listarAvaliacoes() {
    fetch(`/avaliacoes/usuaria/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = a usuária ainda não avaliou nenhum servidor
            mostrarAvaliacoes([]);
        } else if (resposta.ok) {
            resposta.json().then(function (avaliacoes) {
                mostrarAvaliacoes(avaliacoes);
            });
        } else {
            div_avaliacoes.innerHTML = `<div class="area-vazio">Não foi possível carregar as suas avaliações.</div>`;
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_avaliacoes.innerHTML = `<div class="area-vazio">Não foi possível carregar as suas avaliações.</div>`;
    });
}

function mostrarAvaliacoes(avaliacoes) {
    div_avaliacoes.innerHTML = "";

    for (let i = 0; i < avaliacoes.length; i++) {
        const avaliacao = avaliacoes[i];
        const notaSeguranca = Number(avaliacao.nota_seguranca);

        div_avaliacoes.innerHTML += `
            <div class="item">
                <div class="item-topo">
                    <span id="nome_avaliacao_${i}" class="item-nome"></span>
                    <span><span class="estrelas">${montarEstrelas(notaSeguranca)}</span> ${notaSeguranca.toFixed(1).replace(".", ",")}</span>
                </div>
                <div class="item-detalhe">Segurança · avaliado em ${avaliacao.dt_avaliacao}</div>
                <p id="comentario_avaliacao_${i}" class="item-comentario"></p>
            </div>`;
    }

    // nome do servidor e comentário foram digitados por usuárias: entram com textContent
    for (let i = 0; i < avaliacoes.length; i++) {
        document.getElementById(`nome_avaliacao_${i}`).textContent = avaliacoes[i].nome_servidor;

        if (avaliacoes[i].comentario != null) {
            document.getElementById(`comentario_avaliacao_${i}`).textContent = avaliacoes[i].comentario;
        }
    }

    if (avaliacoes.length == 0) {
        div_avaliacoes.innerHTML = `<div class="area-vazio">Você ainda não avaliou nenhum servidor.</div>`;
    }

    div_qtd_avaliacoes.innerHTML = avaliacoes.length;
}

function montarStatus(status) {
    if (status == "aprovado") {
        return `<span class="status status-aprovado">Aprovado</span>`;
    } else if (status == "recusado") {
        return `<span class="status status-recusado">Recusado</span>`;
    } else {
        return `<span class="status status-pendente">Pendente</span>`;
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

// transforma "games,leitura" em etiquetas rosas
function montarEtiquetas(interesses) {
    let etiquetas = "";

    if (interesses != null) {
        if (interesses.includes("games")) {
            etiquetas += `<span class="etiqueta">Games</span>`;
        }
        if (interesses.includes("artesanato")) {
            etiquetas += `<span class="etiqueta">Artesanato</span>`;
        }
        if (interesses.includes("leitura")) {
            etiquetas += `<span class="etiqueta">Leitura</span>`;
        }
    }

    return etiquetas;
}

// monta 5 estrelas a partir da nota (ex.: 4 vira ★★★★☆)
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
