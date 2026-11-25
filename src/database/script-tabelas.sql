CREATE DATABASE safepoint;

USE safepoint;

CREATE TABLE tema (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(20) UNIQUE
);

CREATE TABLE usuaria (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	senha VARCHAR(255) NOT NULL,
	faixa_etaria VARCHAR(10) NOT NULL,
	plataforma VARCHAR(10) NOT NULL,
	tipo VARCHAR(15) NOT NULL DEFAULT 'usuaria',
	dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT chk_faixa_etaria CHECK (faixa_etaria IN ('18-24', '25-34', '35+')),
	CONSTRAINT chk_plataforma CHECK (plataforma IN ('pc', 'console', 'celular', 'nao_jogo')),
	CONSTRAINT chk_tipo CHECK (tipo IN ('usuaria', 'moderadora'))
);

CREATE TABLE interesse_usuaria (
	fk_usuaria INT,
	fk_tema INT,
	PRIMARY KEY (fk_usuaria, fk_tema),
	FOREIGN KEY (fk_usuaria) REFERENCES usuaria(id),
	FOREIGN KEY (fk_tema) REFERENCES tema(id)
);

CREATE TABLE servidor (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	link_convite VARCHAR(200) NOT NULL UNIQUE,
	descricao VARCHAR(300),
	status VARCHAR(10) NOT NULL DEFAULT 'pendente',
	dt_indicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
	fk_usuaria INT,
	fk_moderadora INT,
	FOREIGN KEY (fk_usuaria) REFERENCES usuaria(id),
	FOREIGN KEY (fk_moderadora) REFERENCES usuaria(id),
	CONSTRAINT chk_status CHECK (status IN ('pendente', 'aprovado', 'recusado'))
);

CREATE TABLE tema_servidor (
	fk_servidor INT,
	fk_tema INT,
	PRIMARY KEY (fk_servidor, fk_tema),
	FOREIGN KEY (fk_servidor) REFERENCES servidor(id),
	FOREIGN KEY (fk_tema) REFERENCES tema(id)
);

CREATE TABLE avaliacao (
	id INT AUTO_INCREMENT,
	nota_seguranca INT NOT NULL,
	nota_moderacao INT NOT NULL,
	nota_acolhimento INT NOT NULL,
	nota_atividade INT NOT NULL,
	comentario VARCHAR(500),
	presenciou_toxicidade TINYINT NOT NULL,
	dt_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
	fk_usuaria INT,
	fk_servidor INT,
	PRIMARY KEY (id, fk_usuaria, fk_servidor),
	FOREIGN KEY (fk_usuaria) REFERENCES usuaria(id),
	FOREIGN KEY (fk_servidor) REFERENCES servidor(id),
	CONSTRAINT uq_avaliacao UNIQUE (fk_usuaria, fk_servidor),
	CONSTRAINT chk_nota_seguranca CHECK (nota_seguranca BETWEEN 1 AND 5),
	CONSTRAINT chk_nota_moderacao CHECK (nota_moderacao BETWEEN 1 AND 5),
	CONSTRAINT chk_nota_acolhimento CHECK (nota_acolhimento BETWEEN 1 AND 5),
	CONSTRAINT chk_nota_atividade CHECK (nota_atividade BETWEEN 1 AND 5),
	CONSTRAINT chk_toxicidade CHECK (presenciou_toxicidade IN (0, 1))
);

CREATE VIEW vw_servidores_aprovados AS
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
	AVG(a.nota_moderacao) AS media_moderacao,
	AVG(a.nota_acolhimento) AS media_acolhimento,
	AVG(a.nota_atividade) AS media_atividade,
	SUM(a.presenciou_toxicidade) AS total_toxicidade
FROM servidor s
	LEFT JOIN avaliacao a
		ON a.fk_servidor = s.id
WHERE s.status = 'aprovado'
GROUP BY s.id, s.nome, s.descricao, s.link_convite;

insert into tema (nome) values ('games');
insert into tema (nome) values ('artesanato');
insert into tema (nome) values ('leitura');

/* como nomear uma moderadora (feito só pela administradora, direto no banco):
   1. achar o id:      SELECT id, nome, email, tipo FROM usuaria WHERE email = 'email.dela@exemplo.com';
   2. nomear:          UPDATE usuaria SET tipo = 'moderadora' WHERE id = 1;
   3. conferir:        SELECT id, nome, tipo FROM usuaria WHERE tipo = 'moderadora';
   para tirar:         UPDATE usuaria SET tipo = 'usuaria' WHERE id = 1;
   sempre usar o WHERE, e a pessoa precisa sair e entrar de novo no site */

select * from usuaria;