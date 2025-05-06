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

-- Tabela de Referências de Pagamento (mês/ano)
CREATE TABLE referencia (
    id_referencia INT AUTO_INCREMENT PRIMARY KEY,
    mes TINYINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano YEAR NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    vencimento DATE NOT NULL,
    CONSTRAINT uq_referencia_mes_ano UNIQUE (mes, ano)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Pagamentos
CREATE TABLE pagamento (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    id_apartamento INT NOT NULL,
    id_referencia INT NOT NULL,
    data_pagamento DATE NOT NULL DEFAULT (CURRENT_DATE),
    valor_pago DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_pagamento_apartamento FOREIGN KEY (id_apartamento)
        REFERENCES apartamento (id_apartamento)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pagamento_referencia FOREIGN KEY (id_referencia)
        REFERENCES referencia (id_referencia)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_pagamento_apartamento_referencia UNIQUE (id_apartamento, id_referencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Tipos de Manutenção
CREATE TABLE tipo_manutencao (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    CONSTRAINT uq_tipo_manutencao_descricao UNIQUE (descricao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Manutenções
CREATE TABLE manutencao (
    id_manutencao INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    data_manutencao DATE NOT NULL,
    local VARCHAR(150) NOT NULL,
    CONSTRAINT fk_manutencao_tipo FOREIGN KEY (id_tipo)
        REFERENCES tipo_manutencao (id_tipo)
        ON UPDATE CASCADE ON DELETE RESTRICT
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

INSERT INTO referencia (mes, ano, valor, vencimento) VALUES
(4, 2025, 350.00, '2025-04-10'),
(5, 2025, 350.00, '2025-05-10');

INSERT INTO pagamento (id_apartamento, id_referencia, valor_pago) VALUES
(1, 1, 350.00);

INSERT INTO tipo_manutencao (descricao) VALUES
('Elétrica'),
('Hidráulica');

INSERT INTO manutencao (id_tipo, data_manutencao, local) VALUES
(1, '2025-04-15', 'Sala de Máquinas'),
(2, '2025-04-20', 'Banheiro do corredor');

SELECT * FROM morador WHERE id_apartamento = 5;

select * from bloco;

