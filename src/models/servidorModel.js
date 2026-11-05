var database = require("../database/config");

function listar() {
    console.log("ACESSEI O SERVIDOR MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");

    // só servidores aprovados, com os temas juntos em um texto ("games,leitura")
    // e as contas das avaliações; LEFT JOIN mantém os servidores que ainda não têm avaliação
    var instrucaoSql = `
        SELECT
            s.id,
            s.nome,
            s.descricao,
            s.link_convite,
            (SELECT GROUP_CONCAT(t.nome)
                FROM tema_servidor ts
                    INNER JOIN tema t
                        ON ts.fk_tema = t.id
                WHERE ts.fk_servidor = s.id) AS temas,
            COUNT(a.id) AS total_avaliacoes,
            AVG(a.nota_seguranca) AS media_seguranca,
            SUM(a.presenciou_toxicidade) AS total_toxicidade
        FROM servidor s
            LEFT JOIN avaliacao a
                ON a.fk_servidor = s.id
        WHERE s.status = 'aprovado'
        GROUP BY s.id, s.nome, s.descricao, s.link_convite
        ORDER BY media_seguranca DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listar
};
