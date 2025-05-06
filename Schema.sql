DROP DATABASE IF EXISTS gestao_condominios;
CREATE DATABASE gestao_condominios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestao_condominios;

SELECT * FROM bloco;

-- Tabela de Blocos
CREATE TABLE bloco (
    id_bloco INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    qtd_apartamentos INT NOT NULL,
    CONSTRAINT uq_bloco_descricao UNIQUE (descricao),
    CONSTRAINT chk_qtd_apartamentos CHECK (qtd_apartamentos > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Apartamentos
CREATE TABLE apartamento (
    id_apartamento INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    id_bloco  int NOT NULL,
    andar INT,
    CONSTRAINT fk_apartamento_bloco FOREIGN KEY (id_bloco)
        REFERENCES bloco (id_bloco)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_apartamento_bloco_numero UNIQUE (id_bloco, numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Moradores
CREATE TABLE morador (
    id_morador INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf CHAR(11) NOT NULL,
    telefone VARCHAR(15),
    id_apartamento INT NOT NULL,
    CONSTRAINT fk_morador_apartamento FOREIGN KEY (id_apartamento)
        REFERENCES apartamento (id_apartamento)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_morador_cpf UNIQUE (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dados de teste
INSERT INTO bloco (descricao, qtd_apartamentos) VALUES
('Bloco A', 20),
('Bloco B', 15);

INSERT INTO apartamento (numero, id_bloco, andar) VALUES
('101', 1, 1),
('102', 1, 1),
('201', 1, 2),
('101', 2, 1);

INSERT INTO morador (nome, cpf, telefone, id_apartamento) VALUES
('João Silva', '12345678901', '47999990001', 1),
('Maria Souza', '10987654321', '47999990002', 2);


SELECT * FROM morador WHERE id_apartamento = 5;

select * from bloco;

