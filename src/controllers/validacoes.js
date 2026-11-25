// conferências usadas por mais de um controller
// a API não pode confiar no que vem do navegador: qualquer pessoa consegue chamar a rota direto

// id precisa ser um número inteiro maior que 0 (ex.: "0 OR 1=1" vira NaN e é recusado)
function verificarId(valor) {
    const numero = Number(valor);

    // numero % 1 == 0 quer dizer "não tem parte decimal"
    if (numero > 0 && numero % 1 == 0) {
        return true;
    }

    return false;
}

// nota precisa ser um número inteiro de 1 a 5
function verificarNota(valor) {
    const numero = Number(valor);

    if (numero >= 1 && numero <= 5 && numero % 1 == 0) {
        return true;
    }

    return false;
}

// lista de temas/interesses: pelo menos um, e só os três que existem na tabela tema
function verificarTemas(lista) {
    if (lista == undefined || lista.length == 0) {
        return false;
    }

    for (let i = 0; i < lista.length; i++) {
        if (lista[i] != "games" && lista[i] != "artesanato" && lista[i] != "leitura") {
            return false;
        }
    }

    return true;
}

// mesma regra do cadastro.js: devolve o que está faltando na senha ("" quando está tudo certo)
function verificarSenha(senha) {
    const maiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const minusculas = "abcdefghijklmnopqrstuvwxyz";
    const numeros = "0123456789";

    let temMaiuscula = false;
    let temMinuscula = false;
    let temNumero = false;
    let temEspecial = false;

    for (let i = 0; i < senha.length; i++) {
        const caractere = senha[i];

        if (maiusculas.includes(caractere)) {
            temMaiuscula = true;
        } else if (minusculas.includes(caractere)) {
            temMinuscula = true;
        } else if (numeros.includes(caractere)) {
            temNumero = true;
        } else {
            temEspecial = true;
        }
    }

    if (senha.length < 6) {
        return "A senha precisa ter pelo menos 6 caracteres!";
    } else if (senha.length > 64) {
        return "A senha pode ter até 64 caracteres!";
    } else if (!temMaiuscula) {
        return "A senha precisa ter pelo menos uma letra maiúscula!";
    } else if (!temMinuscula) {
        return "A senha precisa ter pelo menos uma letra minúscula!";
    } else if (!temNumero) {
        return "A senha precisa ter pelo menos um número!";
    } else if (!temEspecial) {
        return "A senha precisa ter pelo menos um caractere especial!";
    }

    return "";
}

module.exports = {
    verificarId,
    verificarNota,
    verificarTemas,
    verificarSenha
};
