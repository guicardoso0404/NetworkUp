-- =====================================================
-- SCRIPT SQL COMPLETO PARA NETWORKUP
-- Execute este script no seu MySQL Workbench ou terminal
-- =====================================================

-- Usar o banco de dados networkup
USE networkup_certo;

-- =====================================================
-- 1. REMOVER TABELAS EXISTENTES (se existirem)
-- =====================================================

-- Desabilitar verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Apagar todas as tabelas na ordem correta
DROP TABLE IF EXISTS curtidas;
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS postagens;
DROP TABLE IF EXISTS usuarios;

-- Reabilitar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 2. CRIAR TABELAS NOVAS
-- =====================================================

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    biografia TEXT,
    foto_perfil TEXT,
    data_nascimento DATE,
    localizacao VARCHAR(100),
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de postagens
CREATE TABLE postagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    imagem TEXT,
    curtidas INT DEFAULT 0,
    comentarios INT DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_data_criacao (data_criacao),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de comentários
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postagem_id INT NOT NULL,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_postagem_id (postagem_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de curtidas
CREATE TABLE curtidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postagem_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_curtida (postagem_id, usuario_id),
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_postagem_id (postagem_id),
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- =====================================================

-- Mostrar todas as tabelas criadas
SHOW TABLES;

-- Mostrar estrutura de cada tabela
DESCRIBE usuarios;
DESCRIBE postagens;
DESCRIBE comentarios;
DESCRIBE curtidas;

-- =====================================================
-- 4. INSERIR DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Inserir usuário de teste
INSERT INTO usuarios (nome, email, senha, biografia, localizacao) VALUES 
('Admin NetworkUp', 'admin@networkup.com', '123456', 'Administrador do sistema', 'Porto Alegre, RS');

-- Inserir postagem de teste
INSERT INTO postagens (usuario_id, conteudo) VALUES 
(1, 'Bem-vindos ao NetworkUp! Esta é nossa primeira postagem de teste. 🚀');

-- Verificar se os dados foram inseridos
SELECT * FROM usuarios;
SELECT * FROM postagens;



SELECT 'Banco de dados NetworkUp configurado com sucesso!' as STATUS;
