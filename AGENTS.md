# AGENTS.md

## Visão geral

 Safe Point é uma aplicação web criada para ajudar mulheres gamers e apreciadoras de artesanato a encontrar comunidades online seguras e acolhedoras, principalmente servidores de Discord. Muitos servidores de jogos acabam se tornando ambientes tóxicos para mulheres, o que dificulta encontrar pessoas para jogar, conversar e compartilhar interesses com segurança, e hoje não existe um lugar centralizado onde elas possam consultar a experiência de outras usuárias antes de entrar em um servidor. Para resolver esse problema, a plataforma permite que as usuárias se cadastrem, indiquem servidores e os avaliem com notas e comentários em critérios como segurança, moderação, acolhimento e respeito. Esses dados alimentam uma dashboard com rankings, gráficos e indicadores, mostrando quais servidores são os mais seguros e como está o cenário geral desses espaços. O público-alvo são mulheres gamers e/ou que gostam de artesanato, como crochê, bordado, pintura e miniaturas, que buscam comunidades seguras para fazer amizades, jogar e compartilhar seus interesses. Assim, o objetivo do projeto é promover um ambiente online mais seguro e inclusivo, usando a avaliação coletiva da comunidade para orientar quem está em busca de um novo lugar para chamar de seu.

## Tecnologias

- VS Code como editor, com a extensão Live Server para abrir o site quando necessário
- MySQL para criar e consultar as tabelas
- Git e GitHub para versionamento
- npm para instalar as dependências
- opencode como agente de IA de apoio ao desenvolvimento

## Comandos

O front-end não precisa de build. A API precisa estar rodando para o site funcionar.

- Instalar as dependências da API (uma vez): `npm i`
- Iniciar a API: `npm start]`
- Rodar o site: abrir o `index.html`, com a API já iniciada
- Testar: abrir a página no navegador.
- Versionar:
  - `git status` para ver o que mudou
  - `git add .` para preparar as alterações
  - `git commit -m "mensagem"` para salvar
  - `git push` para enviar ao repositório

## Arquitetura

O projeto tem duas partes: o site (front-end) e a API em Node.js. O site mostra as telas e envia/recebe dados da API.

Fluxo de uma funcionalidade:
1. A usuária preenche os inputs da página (ex.: nota, comentário).
2. Ao clicar no botão, o `onclick` chama uma função do JS (ex.: `cadastrar()`, `avaliar()`).
3. A função lê os valores dos inputs e chama `validar()`.
4. Se estiver tudo certo, o JS envia os dados para a API com `fetch`.
5. A API responde com sucesso ou erro, e a tela é atualizada na `div_msg`.
6. A dashboard busca os dados na API e calcula médias, percentuais e totais para exibir.

Rotas da API:
- `/public /src/routes/ /src/controllers /src/models /src/database/config.js`

Onde criar novos arquivos:
- Nova página: HTML em `web/`, com um JS de mesmo nome em `web/js/` (ex.: `perfil.html` e `perfil.js`).
- Novo estilo: em `css/`.

Como as partes se relacionam:
Cada HTML importa o CSS geral e o seu próprio JS. O JS do site é o único que conversa com a API.


## Padrões de desenvolvimento

(Mantém tudo o que já foi escrito e acrescenta:)

- Centralizar o endereço base da API em uma única variável, sem repetir o endereço em cada arquivo.
- Usar o mesmo estilo de `fetch`.
- Toda chamada à API deve tratar o erro (API fora do ar, resposta com falha) e avisar a usuária na `div_msg`.
- Nomes de rotas e campos enviados à API devem seguir exatamente o que a API espera.

- Usar `const` por padrão e `let` apenas quando houver necessidade de reatribuição
- Nomes de funções em camelCase, em português, começando com verbo (ex.: `verificar`, `validar`, `cadastrarUsuaria`, `calcularMedia`)
- Nomes de variáveis em camelCase, em português, com prefixos que indicam o conteúdo (ex.: `qtdServidores`, `notaSeguranca`, `totalAvaliacoes`, `percToxicidade`)
- IDs de elementos HTML com prefixo pelo tipo:
  - `ipt_` para inputs (ex.: `ipt_email`)
  - `div_` para divs (ex.: `div_msg`)
  - `btn_` para botões (ex.: `btn_enviar`)
  - `sel_` para selects (ex.: `sel_tema`)
- Arquivos e pastas em minúsculas, sem acentos nem espaços, separados por hífen (ex.: `indicar-servidor.html`)
- Converter valores de inputs com `Number()` quando forem numéricos
- Montar mensagens e textos com template strings (crases)
- Formatar números com `toFixed()`, trocando o ponto por vírgula na exibição (ex.: `toFixed(1).replace(".", ",")`)
- Validar os dados em uma função separada chamada `validar()`, usando uma variável de controle (ex.: `valida`), e exibir os erros na `div_msg`
- Evitar repetir código: se a mesma lógica aparece em mais de um lugar, transformar em função
- Comentários curtos em português, apenas onde a lógica não for óbvia
- Commits em português, curtos e no imperativo, com prefixo (ex.: `feat: adiciona formulário de cadastro`, `fix: corrige média das notas`, `style: ajusta cores da dashboard`)

## Cuidados e restrições

- Não adicionar frameworks, bibliotecas ou ferramentas novas sem pedir confirmação. Se for realmente necessário, explicar o motivo.
- Não reescrever nem apagar arquivos inteiros. Alterar apenas o que foi pedido.
- Não guardar nem exibir senhas em texto puro. Se o projeto ainda não tiver um método seguro, avisar antes de implementar.
- Nunca exibir e-mail ou dados pessoais das usuárias em páginas públicas, como a lista de servidores e a dashboard.
- Ao mostrar textos digitados por usuárias (comentários, nomes de servidores), usar `textContent` em vez de `innerHTML`, para evitar código malicioso. `innerHTML` só deve ser usado com conteúdo montado pelo próprio código.
- Servidores indicados devem começar com status "pendente" e só aparecer nas listas e na dashboard depois de "aprovados".
- Sempre validar os inputs antes de salvar ou calcular (campos vazios, notas fora do intervalo de 1 a 5, valores negativos).
- Tratar divisões e médias quando não houver dados, para evitar `NaN` e divisão por zero (ex.: servidor sem avaliações).
- Não usar imagens de links externos que possam sair do ar. Preferir arquivos dentro de `img/`.
- Manter o código simples e legível, no nível de quem está aprendendo. Preferir `if`, `while` e `for` a soluções muito avançadas ou "mágicas".
- Ao criar ou alterar algo, explicar de forma breve o que foi feito e por quê.
- Não alterar o código da API web-data-viz sem confirmar antes
- Não inventar rotas ou campos da API.
- Nunca colocar senhas, chaves ou dados de acesso do banco direto no código do front-end
- Se a API não estiver respondendo, avisar que ela precisa estar iniciada, em vez de simular dados falsos

## Regra geral: 
Antes de implementar uma alteração, siga as tecnologias, arquitetura, convenções e restrições descritas neste documento. Caso alguma informação esteja ausente, analise o código existente e siga os padrões já adotados no projeto.
