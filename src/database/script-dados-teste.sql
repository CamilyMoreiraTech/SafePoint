/* dados de teste para ver a dashboard funcionando
   rodar DEPOIS do script-tabelas.sql (os temas 1, 2 e 3 precisam existir)
   os ids começam em 101 para não bater com contas criadas pelo site
   todas as pessoas, e-mails e servidores são fictícios */

USE safepoint;

-- senha de teste: Teste@123
INSERT INTO usuaria (id, nome, email, senha, faixa_etaria, plataforma, tipo) VALUES
	(101, 'Ana Souza', 'ana.souza@exemplo.com', 'Teste@123', '25-34', 'pc', 'moderadora'),
	(102, 'Bianca Lima', 'bianca.lima@exemplo.com', 'Teste@123', '18-24', 'pc', 'usuaria'),
	(103, 'Carla Mendes', 'carla.mendes@exemplo.com', 'Teste@123', '25-34', 'nao_jogo', 'usuaria'),
	(104, 'Daniela Rocha', 'daniela.rocha@exemplo.com', 'Teste@123', '35+', 'nao_jogo', 'usuaria'),
	(105, 'Elisa Martins', 'elisa.martins@exemplo.com', 'Teste@123', '18-24', 'console', 'usuaria'),
	(106, 'Fernanda Alves', 'fernanda.alves@exemplo.com', 'Teste@123', '25-34', 'celular', 'usuaria'),
	(107, 'Gabriela Nunes', 'gabriela.nunes@exemplo.com', 'Teste@123', '18-24', 'pc', 'usuaria'),
	(108, 'Helena Costa', 'helena.costa@exemplo.com', 'Teste@123', '35+', 'celular', 'usuaria'),
	(109, 'Isabela Freitas', 'isabela.freitas@exemplo.com', 'Teste@123', '25-34', 'console', 'usuaria'),
	(110, 'Júlia Ramos', 'julia.ramos@exemplo.com', 'Teste@123', '18-24', 'celular', 'usuaria');

-- temas: 1 = games, 2 = artesanato, 3 = leitura
INSERT INTO interesse_usuaria (fk_usuaria, fk_tema) VALUES
	(101, 1), (101, 3),
	(102, 1),
	(103, 2),
	(104, 3),
	(105, 1),
	(106, 1), (106, 2),
	(107, 1),
	(108, 2), (108, 3),
	(109, 1), (109, 3),
	(110, 2), (110, 3);

-- 6 aprovados, 1 pendente e 1 recusado (só os aprovados aparecem na dashboard)
INSERT INTO servidor (id, nome, link_convite, descricao, status, fk_usuaria, fk_moderadora) VALUES
	(101, 'Cantinho das Gamers', 'https://discord.gg/exemplo-cantinho', 'Servidor para jogar em grupo com calma e sem pressão.', 'aprovado', 102, 101),
	(102, 'Ponto Cruz', 'https://discord.gg/exemplo-pontocruz', 'Bordado, crochê e troca de receitas.', 'aprovado', 103, 101),
	(103, 'Clube do Livro Lilás', 'https://discord.gg/exemplo-clubelilas', 'Uma leitura por mês e encontros por voz.', 'aprovado', 104, 101),
	(104, 'Party Rosa', 'https://discord.gg/exemplo-partyrosa', 'Grupo para montar party em jogos online.', 'aprovado', 105, 101),
	(105, 'Fios e Fases', 'https://discord.gg/exemplo-fiosefases', 'Artesanato e jogos tranquilos no mesmo lugar.', 'aprovado', 106, 101),
	(106, 'Arena Livre', 'https://discord.gg/exemplo-arenalivre', 'Servidor grande de jogos competitivos.', 'aprovado', 107, 101),
	(107, 'Leitoras da Madrugada', 'https://discord.gg/exemplo-madrugada', 'Leituras em conjunto para quem dorme tarde.', 'pendente', 108, NULL),
	(108, 'Squad Ranked BR', 'https://discord.gg/exemplo-squadranked', 'Times para subir de elo.', 'recusado', 109, 101);

INSERT INTO tema_servidor (fk_servidor, fk_tema) VALUES
	(101, 1),
	(102, 2),
	(103, 3),
	(104, 1),
	(105, 1), (105, 2),
	(106, 1),
	(107, 3),
	(108, 1);


INSERT INTO avaliacao (nota_seguranca, nota_moderacao, nota_acolhimento, nota_atividade, presenciou_toxicidade, comentario, fk_usuaria, fk_servidor) VALUES
	(5, 5, 5, 4, 0, 'Me senti em casa desde o primeiro dia.', 102, 101),
	(4, 4, 5, 5, 0, 'Sempre tem alguém para jogar.', 102, 104),
	(2, 1, 2, 4, 1, 'Muitos comentários desrespeitosos no chat de voz.', 102, 106),
	(5, 4, 5, 5, 0, 'Moderação rápida e pessoas gentis.', 103, 101),
	(5, 5, 5, 3, 0, 'Aprendi muito com as receitas do pessoal.', 103, 102),
	(4, 4, 5, 4, 0, 'Ótimo para relaxar depois do trabalho.', 103, 105),
	(5, 5, 5, 4, 0, 'As discussões dos livros são muito boas.', 104, 103),
	(4, 5, 5, 4, 0, 'Comunidade acolhedora.', 104, 102),
	(1, 2, 1, 3, 1, 'Saí depois de ouvir piadas machistas.', 104, 106),
	(4, 5, 4, 5, 0, 'Regras claras e bem aplicadas.', 105, 101),
	(5, 4, 5, 4, 0, 'Achei minha party fixa aqui.', 105, 104),
	(2, 2, 2, 5, 1, 'Movimentado, mas a moderação demora a agir.', 105, 106),
	(5, 5, 5, 4, 0, 'Junta meus dois hobbies favoritos.', 106, 105),
	(5, 4, 5, 3, 0, 'Pouco movimento, mas muito respeito.', 106, 102),
	(4, 4, 4, 3, 0, 'Bom clube, encontros um pouco espaçados.', 106, 103),
	(5, 5, 5, 5, 0, 'O melhor servidor que já entrei.', 107, 101),
	(3, 3, 4, 5, 1, 'Na maior parte do tempo é tranquilo.', 107, 104),
	(3, 2, 3, 4, 1, 'Algumas pessoas não respeitam as regras.', 107, 106),
	(5, 5, 5, 5, 0, 'Encontros por voz muito agradáveis.', 108, 103),
	(4, 5, 5, 3, 0, 'Lugar calmo para bordar conversando.', 108, 105),
	(4, 4, 4, 5, 0, 'Bom para achar grupo rápido.', 109, 104),
	(5, 5, 4, 4, 0, 'As moderadoras estão sempre presentes.', 109, 101),
	(1, 1, 2, 4, 1, 'Não recomendo para mulheres.', 109, 106),
	(5, 5, 5, 4, 0, 'Todo mundo ajuda quem está começando.', 110, 102),
	(5, 4, 5, 4, 0, 'Indico para quem gosta de ler.', 110, 103),
	(5, 4, 4, 4, 0, 'Ambiente leve e respeitoso.', 110, 105);
