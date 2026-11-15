// números da home: usa as mesmas rotas da dashboard, sem rota nova
function carregarNumeros() {
    contarServidores();
    contarUsuarias();
}

// servidores e avaliações vêm de /servidores/listar (só servidores aprovados)
function contarServidores() {
    fetch("/servidores/listar", {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // 204 = a API respondeu, mas não tem nenhum servidor aprovado
            mostrarTotaisServidores([]);
        } else if (resposta.ok) {
            resposta.json().then(function (servidores) {
                mostrarTotaisServidores(servidores);
            });
        } else {
            div_msg.innerHTML = "Não foi possível carregar os números da comunidade.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar os números da comunidade. Verifique se a API está iniciada.";
    });
}

function mostrarTotaisServidores(servidores) {
    let totalAvaliacoes = 0;

    for (let i = 0; i < servidores.length; i++) {
        const qtdAvaliacoes = Number(servidores[i].total_avaliacoes);

        if (qtdAvaliacoes > 0) {
            totalAvaliacoes += qtdAvaliacoes;
        }
    }

    div_total_servidores.innerHTML = servidores.length;
    div_total_avaliacoes.innerHTML = totalAvaliacoes;
}

// usuárias vêm da soma de /usuarios/faixas-etarias (só quantidades, sem dados pessoais)
function contarUsuarias() {
    fetch("/usuarios/faixas-etarias", {
        method: "GET"
    }).then(function (resposta) {
        if (resposta.status == 204) {
            // nenhuma usuária cadastrada
            mostrarTotalUsuarias([]);
        } else if (resposta.ok) {
            resposta.json().then(function (faixas) {
                mostrarTotalUsuarias(faixas);
            });
        } else {
            div_msg.innerHTML = "Não foi possível carregar os números da comunidade.";
        }
    }).catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        div_msg.innerHTML = "Não foi possível carregar os números da comunidade. Verifique se a API está iniciada.";
    });
}

function mostrarTotalUsuarias(faixas) {
    let totalUsuarias = 0;

    for (let i = 0; i < faixas.length; i++) {
        totalUsuarias += Number(faixas[i].total_usuarias);
    }

    div_total_usuarias.innerHTML = totalUsuarias;
}
