// funções de login usadas pelas páginas do SafePoint
// o login guarda o ID_USUARIO no sessionStorage: se ele existir, a usuária está logada

// usado pelas telas que só quem está logada pode ver
function verificarLogin(paginaAtual) {
    if (sessionStorage.ID_USUARIO == undefined) {
        // avisa o login para voltar para a página atual depois de entrar
        sessionStorage.PAGINA_APOS_LOGIN = paginaAtual;
        window.location = "login.html";
    }
}

// troca os botões do menu (e os da home) quando a usuária está logada
function atualizarMenu() {
    if (sessionStorage.ID_USUARIO == undefined) {
        return;
    }

    div_menu_botoes.innerHTML = `
        <a href="minha-area.html" class="botao-destaque">[ Minha área ]</a>
        <a class="botao-contorno botao-sair" onclick="sair()">[ Sair ]</a>
    `;

    // esses dois blocos só existem na home
    if (document.getElementById("div_inicio_botoes") != null) {
        div_inicio_botoes.innerHTML = `
            <a href="indicar-servidor.html" class="botao-destaque">[ Indicar um servidor ] →</a>
            <a href="servidores.html" class="botao-contorno">[ Ver servidores ]</a>
        `;
    }

    if (document.getElementById("div_chamada") != null) {
        div_chamada.innerHTML = `
            <h2 class="titulo-secao">
                <span class="estrela-titulo">✦</span>
                Conhece um lugar seguro?
                <span class="estrela-titulo">✦</span>
            </h2>
            <a href="indicar-servidor.html" class="botao-destaque">[ Indicar um servidor ] →</a>
        `;
    }
}

function sair() {
    sessionStorage.clear();
    window.location = "index.html";
}
