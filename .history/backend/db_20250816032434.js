const mysql = require('mysql2/promise');

// Configuração da conexão com MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'networkup_certo',
    port: 3306,
    charset: 'utf8mb4'
};

// Pool de conexões
let pool;

// Função para conectar ao banco de dados
async function connectDB() {
    try {
        console.log('Conectando ao banco de dados MySQL...');
        
        // Criar pool de conexões
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Testar conexão
        const connection = await pool.getConnection();
        console.log('Conexão com MySQL estabelecida com sucesso!');
        console.log(`Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
        
        connection.release();
        
        // Criar tabelas se não existirem
        await createTables();
        
        return pool;
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error.message);
        
        // Se o banco não existe, tentar criar
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('Tentando criar o banco de dados...');
            await createDatabase();
        } else {
            console.error('Verifique se o MySQL está rodando e as configurações estão corretas');
            console.error('Config atual:', {
                host: dbConfig.host,
                user: dbConfig.user,
                database: dbConfig.database,
                port: dbConfig.port
            });
        }
        
        throw error;
    }
}

// Função para criar o banco de dados
async function createDatabase() {
    try {
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        
        const tempConnection = await mysql.createConnection(tempConfig);
        
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Banco de dados '${dbConfig.database}' criado com sucesso!`);
        
        await tempConnection.end();
        
        // Reconectar com o banco criado
        return await connectDB();
    } catch (error) {
        console.error('Erro ao criar banco de dados:', error.message);
        throw error;
    }
}

// Função para criar as tabelas
async function createTables() {
    try {
        console.log('Verificando/criando tabelas...');
        
        // Tabela de usuários
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                descricao TEXT,
                foto_perfil TEXT,
                ativo BOOLEAN DEFAULT true,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_ativo (ativo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Adicionar coluna descricao se não existir (para tabelas existentes)
        try {
            await pool.execute(`ALTER TABLE usuarios ADD COLUMN descricao TEXT AFTER biografia`);
            console.log('Coluna descricao adicionada');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('Coluna descricao já existe');
            } else {
                console.log('Erro ao adicionar coluna descricao:', error.message);
            }
        }

        // Tabela de postagens
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS postagens (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Tabela de comentários
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS comentarios (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Tabela de curtidas
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS curtidas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                postagem_id INT NOT NULL,
                usuario_id INT NOT NULL,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_curtida (postagem_id, usuario_id),
                FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_postagem_id (postagem_id),
                INDEX idx_usuario_id (usuario_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('Tabelas criadas/verificadas com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar tabelas:', error.message);
        throw error;
    }
}

// Função para obter uma conexão do pool
function getConnection() {
    if (!pool) {
        throw new Error('Banco de dados não conectado. Execute connectDB() primeiro.');
    }
    return pool;
}

// Função para executar queries com tratamento de erro
async function executeQuery(query, params = []) {
    try {
        const connection = getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Erro na query:', error.message);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    }
}

// Função para limpar dados foi removida porque não estava funcionando corretamente

// Função para fechar conexão com o banco de dados
async function closeConnection() {
    if (pool) {
        await pool.end();
        console.log('Conexão com banco de dados fechada');
    }
}

// Configurar handlers para fechamento do servidor
process.on('SIGINT', async () => {
    console.log('\nRecebido SIGINT, fechando servidor...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nRecebido SIGTERM, fechando servidor...');
    await closeConnection();
    process.exit(0);
});

process.on('beforeExit', async () => {
    console.log('\nEvento beforeExit recebido...');
    await closeConnection();
});

// Exportar funções
module.exports = {
    connectDB,
    getConnection,
    executeQuery,
    closeConnection
};
