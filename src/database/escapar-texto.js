// prepara um texto para entrar entre aspas simples no SQL
// ' vira '' (assim Girls' Lounge ou d'água não quebram o SQL)
// \ vira \\ (no MySQL a barra também "escapa" o caractere seguinte)
function escaparTexto(texto) {
    let resultado = "";
    texto = String(texto);

    for (let i = 0; i < texto.length; i++) {
        const caractere = texto[i];

        if (caractere == "'") {
            resultado += "''";
        } else if (caractere == "\\") {
            resultado += "\\\\";
        } else {
            resultado += caractere;
        }
    }

    return resultado;
}

module.exports = {
    escaparTexto
};
