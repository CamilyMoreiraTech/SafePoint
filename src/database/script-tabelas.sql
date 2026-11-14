CREATE DATABASE safepoint;

USE safepoint;

CREATE TABLE tema (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(20) UNIQUE
);

/* dados do formulário de cadastro */
CREATE TABLE usuaria (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	senha VARCHAR(255) NOT NULL,
	faixa_etaria VARCHAR(10) NOT NULL,
	plataforma VARCHAR(10) NOT NULL,
	-- quem se cadastra pelo site é sempre 'usuaria'; moderadoras são nomeadas direto no banco
	tipo VARCHAR(15) NOT NULL DEFAULT 'usuaria',
	dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT chk_faixa_etaria CHECK (faixa_etaria IN ('18-24', '25-34', '35+')),
	CONSTRAINT chk_plataforma CHECK (plataforma IN ('pc', 'console', 'celular', 'nao_jogo')),
	CONSTRAINT chk_tipo CHECK (tipo IN ('usuaria', 'moderadora'))
);

/* interesses marcados no cadastro (uma usuária pode ter de 1 a 3) */
CREATE TABLE interesse_usuaria (
	fk_usuaria INT,
	fk_tema INT,
	PRIMARY KEY (fk_usuaria, fk_tema),
	FOREIGN KEY (fk_usuaria) REFERENCES usuaria(id),
	FOREIGN KEY (fk_tema) REFERENCES tema(id)
);

/* dados do formulário de indicação: todo servidor começa como pendente */
CREATE TABLE servidor (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	link_convite VARCHAR(200) NOT NULL UNIQUE,
	descricao VARCHAR(300),
	status VARCHAR(10) NOT NULL DEFAULT 'pendente',
	dt_indicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
	fk_usuaria INT,
	-- moderadora que aprovou ou recusou; fica vazio enquanto o servidor está pendente
	fk_moderadora INT,
	FOREIGN KEY (fk_usuaria) REFERENCES usuaria(id),
	FOREIGN KEY (fk_moderadora) REFERENCES usuaria(id),
	CONSTRAINT chk_status CHECK (status IN ('pendente', 'aprovado', 'recusado'))
);

/* temas do servidor (um servidor pode ter de 1 a 3) */
CREATE TABLE tema_servidor (
	fk_servidor INT,
	fk_tema INT,
	PRIMARY KEY (fk_servidor, fk_tema),
	FOREIGN KEY (fk_servidor) REFERENCES servidor(id),
	FOREIGN KEY (fk_tema) REFERENCES tema(id)
);

/* dados do formulário de avaliação: cada usuária avalia cada servidor uma vez */
/* as FKs fazem parte da chave primária: não existe avaliação sem usuária e sem servidor */
CREATE TABLE avaliacao (
	id INT AUTO_INCREMENT,
	nota_seguranca INT NOT NULL,
	nota_moderacao INT NOT NULL,
	nota_acolhimento INT NOT NULL,
	nota_atividade INT NOT NULL,
	nota_respeito INT NOT NULL,
	comentario VARCHAR(500),
	presenciou_toxicidade TINYINT NOT NULL, -- 1 = sim, 0 = não
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
	CONSTRAINT chk_nota_respeito CHECK (nota_respeito BETWEEN 1 AND 5),
	CONSTRAINT chk_toxicidade CHECK (presenciou_toxicidade IN (0, 1))
);

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