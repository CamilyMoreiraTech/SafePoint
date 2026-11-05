var database = require("../database/config")

function autenticar(email, senha) {
    var instrucaoSql = `
        SELECT id, nome, email FROM usuaria WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, faixaEtaria, plataforma) {
    var instrucaoSql = `
        INSERT INTO usuaria (nome, email, senha, faixa_etaria, plataforma) VALUES ('${nome}', '${email}', '${senha}', '${faixaEtaria}', '${plataforma}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarInteresse(idUsuaria, interesse) {
    var instrucaoSql = `
        INSERT INTO interesse_usuaria (fk_usuaria, fk_tema) SELECT ${idUsuaria}, id FROM tema WHERE nome = '${interesse}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarFaixasEtarias() {
    var instrucaoSql = `
        SELECT faixa_etaria, COUNT(id) AS total_usuarias FROM usuaria GROUP BY faixa_etaria;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar,
    cadastrarInteresse,
    listarFaixasEtarias
};