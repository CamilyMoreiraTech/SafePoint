var database = require("../database/config");

// junta com a tabela servidor para mostrar o nome do servidor avaliado
function listarPorUsuaria(idUsuaria) {
    var instrucaoSql = `
        SELECT
            a.id,
            s.nome AS nome_servidor,
            a.nota_seguranca,
            a.comentario,
            DATE_FORMAT(a.dt_avaliacao, '%d/%m/%Y') AS dt_avaliacao
        FROM avaliacao a
            INNER JOIN servidor s
                ON a.fk_servidor = s.id
        WHERE a.fk_usuaria = ${idUsuaria}
        ORDER BY a.id DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listarPorUsuaria
};
