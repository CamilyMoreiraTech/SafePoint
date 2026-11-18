var database = require("../database/config");
var escapar = require("../database/escapar-texto");

function listar() {
    console.log("ACESSEI O SERVIDOR MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");

    // a view já traz só os aprovados, com os temas ("games,leitura") e as médias das avaliações
    // (ver vw_servidores_aprovados no script-tabelas.sql)
    // ordem: maior média de segurança primeiro; empate = quem tem mais avaliações fica na frente
    var instrucaoSql = `
        SELECT * FROM vw_servidores_aprovados
        ORDER BY media_seguranca DESC, total_avaliacoes DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// o status fica 'pendente' sozinho, pelo DEFAULT da tabela
function indicar(nome, link, descricao, idUsuaria) {
    var instrucaoSql = `
        INSERT INTO servidor (nome, link_convite, descricao, fk_usuaria) VALUES ('${escapar.escaparTexto(nome)}', '${escapar.escaparTexto(link)}', '${escapar.escaparTexto(descricao)}', ${idUsuaria});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarTema(idServidor, tema) {
    var instrucaoSql = `
        INSERT INTO tema_servidor (fk_servidor, fk_tema) SELECT ${idServidor}, id FROM tema WHERE nome = '${escapar.escaparTexto(tema)}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// aqui aparecem também os pendentes e recusados, porque é a própria usuária vendo as indicações dela
function listarIndicados(idUsuaria) {
    var instrucaoSql = `
        SELECT
            s.id,
            s.nome,
            s.status,
            DATE_FORMAT(s.dt_indicacao, '%d/%m/%Y') AS dt_indicacao,
            (SELECT GROUP_CONCAT(t.nome)
                FROM tema_servidor ts
                    INNER JOIN tema t
                        ON ts.fk_tema = t.id
                WHERE ts.fk_servidor = s.id) AS temas
        FROM servidor s
        WHERE s.fk_usuaria = ${idUsuaria}
        ORDER BY s.id DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// usado antes de listar ou moderar: só moderadoras podem
function verificarModeradora(idUsuaria) {
    var instrucaoSql = `
        SELECT tipo FROM usuaria WHERE id = ${idUsuaria};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// servidores que ainda esperam revisão, com o nome de quem indicou (os mais antigos primeiro)
function listarPendentes() {
    var instrucaoSql = `
        SELECT
            s.id,
            s.nome,
            s.link_convite,
            s.descricao,
            DATE_FORMAT(s.dt_indicacao, '%d/%m/%Y') AS dt_indicacao,
            u.nome AS nome_indicadora,
            (SELECT GROUP_CONCAT(t.nome)
                FROM tema_servidor ts
                    INNER JOIN tema t
                        ON ts.fk_tema = t.id
                WHERE ts.fk_servidor = s.id) AS temas
        FROM servidor s
            LEFT JOIN usuaria u
                ON s.fk_usuaria = u.id
        WHERE s.status = 'pendente'
        ORDER BY s.id;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// o AND status = 'pendente' impede moderar de novo um servidor que já foi revisado
function moderar(idServidor, status, idModeradora) {
    var instrucaoSql = `
        UPDATE servidor SET status = '${escapar.escaparTexto(status)}', fk_moderadora = ${idModeradora}
        WHERE id = ${idServidor} AND status = 'pendente';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listar,
    indicar,
    cadastrarTema,
    listarIndicados,
    verificarModeradora,
    listarPendentes,
    moderar
};
