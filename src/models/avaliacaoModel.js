var database = require("../database/config");
var escapar = require("../database/escapar-texto");

// junta com a tabela servidor para mostrar o nome do servidor avaliado
// traz todas as notas porque a tela de avaliar usa esta lista para preencher a edição
function listarPorUsuaria(idUsuaria) {
    var instrucaoSql = `
        SELECT
            a.id,
            a.fk_servidor,
            s.nome AS nome_servidor,
            a.nota_seguranca,
            a.nota_moderacao,
            a.nota_acolhimento,
            a.nota_atividade,
            a.presenciou_toxicidade,
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

// comentários de um servidor aprovado, para a tela de comentários
// não traz nome nem e-mail: a tela é pública e os comentários aparecem anônimos
function listarPorServidor(idServidor) {
    var instrucaoSql = `
        SELECT
            a.id,
            a.nota_seguranca,
            a.presenciou_toxicidade,
            a.comentario,
            DATE_FORMAT(a.dt_avaliacao, '%d/%m/%Y') AS dt_avaliacao
        FROM avaliacao a
            INNER JOIN servidor s
                ON a.fk_servidor = s.id
        WHERE a.fk_servidor = ${idServidor}
            AND s.status = 'aprovado'
            AND a.comentario IS NOT NULL
            AND a.comentario <> ''
        ORDER BY a.dt_avaliacao DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function avaliar(notaSeguranca, notaModeracao, notaAcolhimento, notaAtividade, toxicidade, comentario, idUsuaria, idServidor) {
    var instrucaoSql = `
        INSERT INTO avaliacao (nota_seguranca, nota_moderacao, nota_acolhimento, nota_atividade, presenciou_toxicidade, comentario, fk_usuaria, fk_servidor)
        VALUES (${notaSeguranca}, ${notaModeracao}, ${notaAcolhimento}, ${notaAtividade}, ${toxicidade}, '${escapar.escaparTexto(comentario)}', ${idUsuaria}, ${idServidor});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// o AND fk_usuaria impede que uma usuária altere a avaliação de outra
function editar(idAvaliacao, notaSeguranca, notaModeracao, notaAcolhimento, notaAtividade, toxicidade, comentario, idUsuaria) {
    var instrucaoSql = `
        UPDATE avaliacao SET
            nota_seguranca = ${notaSeguranca},
            nota_moderacao = ${notaModeracao},
            nota_acolhimento = ${notaAcolhimento},
            nota_atividade = ${notaAtividade},
            presenciou_toxicidade = ${toxicidade},
            comentario = '${escapar.escaparTexto(comentario)}'
        WHERE id = ${idAvaliacao} AND fk_usuaria = ${idUsuaria};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// apaga a avaliação inteira (notas e comentário); o AND fk_usuaria impede apagar a de outra usuária
function excluir(idAvaliacao, idUsuaria) {
    var instrucaoSql = `
        DELETE FROM avaliacao WHERE id = ${idAvaliacao} AND fk_usuaria = ${idUsuaria};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listarPorUsuaria,
    listarPorServidor,
    avaliar,
    editar,
    excluir
};
