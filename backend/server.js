const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { connectDB, executeQuery } = require('./db');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/posts');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

// Configuração para fotos de perfil
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/profiles');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const profileUpload = multer({ 
    storage: profileStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB para fotos de perfil
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

// Log de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ===== ROTAS DE AUTENTICAÇÃO =====

// Cadastro
app.post('/api/auth/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, biografia, telefone, data_nascimento, localizacao } = req.body;
        
        // Validação básica
        if (!nome || !email || !senha) {
            return res.json({ success: false, message: 'Nome, email e senha são obrigatórios' });
        }
        
        // Verificar se email já existe
        const existing = await executeQuery('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.json({ success: false, message: 'Este email já está cadastrado' });
        }
        
        // Inserir usuário (senha sem criptografia)
        const result = await executeQuery(`
            INSERT INTO usuarios (nome, email, senha, biografia, telefone, data_nascimento, localizacao)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [nome, email, senha, biografia || null, telefone || null, data_nascimento || null, localizacao || null]);
        
        console.log('✅ Usuário cadastrado:', { id: result.insertId, nome, email, senha: senha });
        
        res.json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            data: { id: result.insertId, nome, email }
        });
        
    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        res.json({ success: false, message: 'Erro interno do servidor: ' + error.message });
    }
});

// Atualizar usuário
app.put('/api/users/update', async (req, res) => {
    try {
        const { usuario_id, nome, email, senha, descricao } = req.body;
        
        if (!usuario_id || !nome || !email) {
            return res.json({ success: false, message: 'ID do usuário, nome e email são obrigatórios' });
        }
        
        // Verificar se o usuário existe
        const userExists = await executeQuery('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);
        if (userExists.length === 0) {
            return res.json({ success: false, message: 'Usuário não encontrado' });
        }
        
        // Verificar se o email já está sendo usado por outro usuário
        const emailExists = await executeQuery('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, usuario_id]);
        if (emailExists.length > 0) {
            return res.json({ success: false, message: 'Este email já está sendo usado por outro usuário' });
        }
        
        // Preparar query de atualização
        let updateQuery = 'UPDATE usuarios SET nome = ?, email = ?, descricao = ?';
        let updateParams = [nome, email, descricao || null];
        
        // Adicionar senha se foi fornecida
        if (senha) {
            updateQuery += ', senha = ?';
            updateParams.push(senha);
        }
        
        updateQuery += ' WHERE id = ?';
        updateParams.push(usuario_id);
        
        // Executar atualização
        await executeQuery(updateQuery, updateParams);
        
        console.log('✅ Usuário atualizado:', { id: usuario_id, nome, email });
        
        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso!',
            data: { id: usuario_id, nome, email, descricao }
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.json({ success: false, message: 'Erro interno do servidor: ' + error.message });
    }
});

// Upload de avatar
app.post('/api/users/upload-avatar', profileUpload.single('avatar'), async (req, res) => {
    try {
        const { usuario_id } = req.body;
        
        if (!usuario_id || !req.file) {
            return res.json({ success: false, message: 'Usuário e arquivo são obrigatórios' });
        }
        
        // Caminho da imagem
        const avatarPath = `/uploads/profiles/${req.file.filename}`;
        
        // Atualizar banco de dados
        await executeQuery('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [avatarPath, usuario_id]);
        
        console.log('✅ Avatar atualizado para usuário:', usuario_id);
        
        res.json({
            success: true,
            message: 'Foto de perfil atualizada com sucesso!',
            data: { foto_perfil: avatarPath }
        });
        
    } catch (error) {
        console.error('❌ Erro ao fazer upload do avatar:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.json({ success: false, message: 'Email e senha são obrigatórios' });
        }
        
        // Buscar usuário (comparação direta da senha)
        const users = await executeQuery('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);
        
        if (users.length === 0) {
            console.log('❌ Login falhou:', email);
            return res.json({ success: false, message: 'Email ou senha incorretos' });
        }
        
        const user = users[0];
        console.log('✅ Login sucesso:', { id: user.id, nome: user.nome, email: user.email, senha: senha });
        delete user.senha; // Remover senha da resposta
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            data: { usuario: user, redirectTo: '/feed' }
        });
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// ===== ROTAS DE POSTAGENS =====

// Criar postagem
app.post('/api/posts/postar', upload.single('photo'), async (req, res) => {
    try {
        const { usuario_id, conteudo } = req.body;
        
        if (!usuario_id || (!conteudo && !req.file)) {
            return res.json({ success: false, message: 'Usuário e conteúdo (ou imagem) são obrigatórios' });
        }
        
        // Caminho da imagem se foi enviada
        const imagePath = req.file ? `/uploads/posts/${req.file.filename}` : null;
        
        const result = await executeQuery(
            'INSERT INTO postagens (usuario_id, conteudo, imagem) VALUES (?, ?, ?)', 
            [usuario_id, conteudo || '', imagePath]
        );
        
        console.log('✅ Postagem criada:', result.insertId);
        
        res.json({
            success: true,
            message: 'Postagem criada com sucesso!',
            data: { id: result.insertId, usuario_id, conteudo, imagem: imagePath }
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar postagem:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Obter feed
app.get('/api/posts/feed', async (req, res) => {
    try {
        const posts = await executeQuery(`
            SELECT 
                p.id, p.conteudo, p.imagem, p.curtidas, p.data_criacao as created_at,
                u.id as usuario_id, u.nome as usuario_nome, u.email as usuario_email, u.foto_perfil
            FROM postagens p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.ativo = true
            ORDER BY p.data_criacao DESC
            LIMIT 20
        `);
        
        // Buscar comentários para cada post
        for (let post of posts) {
            const comments = await executeQuery(`
                SELECT 
                    c.id, c.conteudo, c.data_criacao as created_at,
                    u.id as usuario_id, u.nome as usuario_nome, u.foto_perfil
                FROM comentarios c
                JOIN usuarios u ON c.usuario_id = u.id
                WHERE c.postagem_id = ? AND c.ativo = true
                ORDER BY c.data_criacao ASC
                LIMIT 3
            `, [post.id]);
            
            post.comentarios_lista = comments;
        }
        
        res.json({ success: true, data: posts });
        
    } catch (error) {
        console.error('❌ Erro ao obter feed:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Curtir postagem
app.post('/api/posts/curtir', async (req, res) => {
    try {
        const { postagem_id, usuario_id } = req.body;
        
        if (!postagem_id || !usuario_id) {
            return res.json({ success: false, message: 'Postagem e usuário são obrigatórios' });
        }
        
        // Verificar se já curtiu
        const existing = await executeQuery('SELECT id FROM curtidas WHERE postagem_id = ? AND usuario_id = ?', [postagem_id, usuario_id]);
        
        let acao;
        if (existing.length > 0) {
            // Remover curtida
            await executeQuery('DELETE FROM curtidas WHERE postagem_id = ? AND usuario_id = ?', [postagem_id, usuario_id]);
            acao = 'descurtiu';
        } else {
            // Adicionar curtida
            await executeQuery('INSERT INTO curtidas (postagem_id, usuario_id) VALUES (?, ?)', [postagem_id, usuario_id]);
            acao = 'curtiu';
        }
        
        // Contar total de curtidas
        const total = await executeQuery('SELECT COUNT(*) as count FROM curtidas WHERE postagem_id = ?', [postagem_id]);
        const totalCurtidas = total[0].count;
        
        // Atualizar contador na postagem
        await executeQuery('UPDATE postagens SET curtidas = ? WHERE id = ?', [totalCurtidas, postagem_id]);
        
        res.json({
            success: true,
            message: `Postagem ${acao} com sucesso!`,
            data: { postagem_id, usuario_id, acao, total_curtidas: totalCurtidas }
        });
        
    } catch (error) {
        console.error('❌ Erro ao curtir:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Comentar postagem
app.post('/api/posts/comentar', async (req, res) => {
    try {
        const { postagem_id, usuario_id, conteudo } = req.body;
        
        if (!postagem_id || !usuario_id || !conteudo) {
            return res.json({ success: false, message: 'Todos os campos são obrigatórios' });
        }
        
        const result = await executeQuery('INSERT INTO comentarios (postagem_id, usuario_id, conteudo) VALUES (?, ?, ?)', 
            [postagem_id, usuario_id, conteudo]);
        
        // Contar total de comentários
        const total = await executeQuery('SELECT COUNT(*) as count FROM comentarios WHERE postagem_id = ?', [postagem_id]);
        const totalComentarios = total[0].count;
        
        // Atualizar contador na postagem
        await executeQuery('UPDATE postagens SET comentarios = ? WHERE id = ?', [totalComentarios, postagem_id]);
        
        console.log('✅ Comentário adicionado:', result.insertId);
        
        res.json({
            success: true,
            message: 'Comentário adicionado com sucesso!',
            data: { id: result.insertId, postagem_id, usuario_id, conteudo }
        });
        
    } catch (error) {
        console.error('❌ Erro ao comentar:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Deletar postagem (apenas para administradores)
app.delete('/api/posts/deletar/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { usuario_id } = req.body;
        
        if (!postId || !usuario_id) {
            return res.json({ success: false, message: 'Post ID e usuário são obrigatórios' });
        }
        
        // Verificar se o usuário é o criador do post ou administrador
        const post = await executeQuery('SELECT * FROM postagens WHERE id = ?', [postId]);
        const user = await executeQuery('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
        
        if (post.length === 0) {
            return res.json({ success: false, message: 'Postagem não encontrada' });
        }
        
        if (user.length === 0) {
            return res.json({ success: false, message: 'Usuário não encontrado' });
        }
        
        // Verificar se é o criador do post ou admin (email específico)
        const isOwner = post[0].usuario_id === parseInt(usuario_id);
        const isAdmin = user[0].email === 'admin@networkup.com' || user[0].email === 'teste@teste.com';
        
        if (!isOwner && !isAdmin) {
            return res.json({ success: false, message: 'Você não tem permissão para deletar este post' });
        }
        
        // Deletar comentários primeiro
        await executeQuery('DELETE FROM comentarios WHERE postagem_id = ?', [postId]);
        
        // Deletar curtidas
        await executeQuery('DELETE FROM curtidas WHERE postagem_id = ?', [postId]);
        
        // Deletar postagem
        await executeQuery('DELETE FROM postagens WHERE id = ?', [postId]);
        
        console.log('✅ Postagem deletada:', postId, 'por usuário:', usuario_id);
        
        res.json({
            success: true,
            message: 'Postagem deletada com sucesso!',
            data: { postagem_id: postId }
        });
        
    } catch (error) {
        console.error('❌ Erro ao deletar postagem:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Obter informações de um usuário específico
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId) {
            return res.json({ success: false, message: 'ID do usuário é obrigatório' });
        }
        
        // Buscar informações do usuário
        const users = await executeQuery('SELECT id, nome, email, foto_perfil, descricao, data_criacao FROM usuarios WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.json({ success: false, message: 'Usuário não encontrado' });
        }
        
        const user = users[0];
        
        // Buscar posts do usuário
        const posts = await executeQuery(`
            SELECT 
                p.id, p.conteudo, p.imagem, p.curtidas, p.comentarios, p.data_criacao as created_at
            FROM postagens p
            WHERE p.usuario_id = ? AND p.ativo = true
            ORDER BY p.data_criacao DESC
            LIMIT 10
        `, [userId]);
        
        // Contar total de posts
        const totalPosts = await executeQuery('SELECT COUNT(*) as count FROM postagens WHERE usuario_id = ? AND ativo = true', [userId]);
        
        res.json({
            success: true,
            data: {
                user: user,
                posts: posts,
                stats: {
                    total_posts: totalPosts[0].count
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter usuário:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// ===== ROTAS FRONTEND =====

// Página inicial - redirecionar para home
app.get('/', (req, res) => {
    res.sendFile('html/home.html', { root: '../public' });
});

app.get('/home', (req, res) => {
    res.sendFile('html/home.html', { root: '../public' });
});

app.get('/inicial', (req, res) => {
    res.sendFile('html/home.html', { root: '../public' });
});

app.get('/login-teste', (req, res) => {
    res.sendFile('html/login-teste.html', { root: '../public' });
});

app.get('/login', (req, res) => {
    res.sendFile('html/login.html', { root: '../public' });
});

app.get('/cadastro', (req, res) => {
    res.sendFile('html/cadastro.html', { root: '../public' });
});

app.get('/feed', (req, res) => {
    res.sendFile('html/feed.html', { root: '../public' });
});

app.get('/profile', (req, res) => {
    res.sendFile('html/profile.html', { root: '../public' });
});

app.get('/user-profile', (req, res) => {
    res.sendFile('html/user-profile.html', { root: '../public' });
});

app.get('/test-profile', (req, res) => {
    res.sendFile('html/test-profile.html', { root: '../public' });
});

app.get('/sobre', (req, res) => {
    res.sendFile('html/sobre.html', { root: '../public' });
});

// Info da API
app.get('/api', (req, res) => {
    res.json({
        message: 'NetworkUp API está funcionando!',
        version: '1.0.0',
        endpoints: {
            'POST /api/auth/cadastro': 'Cadastrar usuário',
            'POST /api/auth/login': 'Fazer login',
            'POST /api/posts/postar': 'Criar postagem',
            'GET /api/posts/feed': 'Obter feed',
            'POST /api/posts/curtir': 'Curtir postagem',
            'POST /api/posts/comentar': 'Comentar postagem',
            'GET /api/users/:id': 'Obter perfil de usuário'
        }
    });
});

// Endpoint de teste para adicionar dados fictícios
app.post('/api/test/seed-data', async (req, res) => {
    try {
        console.log('🌱 Adicionando dados de teste...');
        
        // Adicionar alguns usuários de teste com fotos
        const users = [
            {
                nome: 'Ana Silva',
                email: 'ana@techstart.com',
                senha: '123456',
                descricao: 'Desenvolvedora Full Stack especializada em React e Node.js'
            },
            {
                nome: 'João Santos',
                email: 'joao@devmaster.com', 
                senha: '123456',
                descricao: 'Especialista em UX/UI Design e Front-end'
            }
        ];
        
        for (const user of users) {
            const existing = await executeQuery('SELECT id FROM usuarios WHERE email = ?', [user.email]);
            if (existing.length === 0) {
                await executeQuery(
                    'INSERT INTO usuarios (nome, email, senha, descricao) VALUES (?, ?, ?, ?)',
                    [user.nome, user.email, user.senha, user.descricao]
                );
                console.log(`✅ Usuário criado: ${user.nome}`);
            }
        }
        
        res.json({ success: true, message: 'Dados de teste adicionados!' });
        
    } catch (error) {
        console.error('❌ Erro ao adicionar dados de teste:', error);
        res.json({ success: false, message: 'Erro ao adicionar dados' });
    }
});

// 404
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ success: false, message: 'Endpoint não encontrado' });
    } else {
        res.sendFile('html/home.html', { root: '../public' });
    }
});

// Iniciar servidor
async function startServer() {
    try {
        await connectDB();
        
        // Criar conta teste se não existir
        await createTestAccount();
        
        app.listen(PORT, () => {
            console.log('\n🚀 ===== NETWORKUP SERVER =====');
            console.log(`✅ Servidor rodando na porta ${PORT}`);
            console.log('\n🌐 ACESSE SEU PROJETO:');
            console.log(`   🏠 Página Inicial: \x1b[36mhttp://localhost:${PORT}/home\x1b[0m`);
            console.log(`   🔐 Login:          \x1b[36mhttp://localhost:${PORT}/login\x1b[0m`);
            console.log(`   📝 Cadastro:       \x1b[36mhttp://localhost:${PORT}/cadastro\x1b[0m`);
            console.log(`   📰 Feed:           \x1b[36mhttp://localhost:${PORT}/feed\x1b[0m`);
            console.log(`   ℹ️  Sobre:          \x1b[36mhttp://localhost:${PORT}/sobre\x1b[0m`);
            console.log('\n🔧 DESENVOLVIMENTO:');
            console.log(`   🔌 API:            \x1b[33mhttp://localhost:${PORT}/api\x1b[0m`);
            console.log('\n👤 CONTAS TESTE:');
            console.log(`   📧 Email 1:        \x1b[32mguilherme@networkup.com.br\x1b[0m`);
            console.log(`   📧 Email 2:        \x1b[32mguilherme123@networkup.com.br\x1b[0m`);
            console.log(`   🔑 Senha:          \x1b[32m123456\x1b[0m (para ambas)`);
            console.log('\n⚠️  IMPORTANTE: Posts e dados dessas contas são \x1b[33mPRESERVADOS\x1b[0m!');
            console.log('\n💡 DICA: \x1b[32mCtrl+Click\x1b[0m nos links para abrir!');
            console.log('================================\n');
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Função para criar conta teste
async function createTestAccount() {
    try {
        // Lista de contas de teste para preservar
        const testAccounts = [
            {
                nome: 'Guilherme Cardoso',
                email: 'guilherme@networkup.com.br',
                senha: '123456',
                descricao: 'Desenvolvedor Full Stack e criador do NetworkUp'
            },
            {
                nome: 'Guilherme Test',
                email: 'guilherme123@networkup.com.br', 
                senha: '123456',
                descricao: 'Conta de teste secundária para desenvolvimento'
            }
        ];
        
        for (const account of testAccounts) {
            const existing = await executeQuery('SELECT id FROM usuarios WHERE email = ?', [account.email]);
            
            if (existing.length === 0) {
                await executeQuery(`
                    INSERT INTO usuarios (nome, email, senha, descricao)
                    VALUES (?, ?, ?, ?)
                `, [account.nome, account.email, account.senha, account.descricao]);
                console.log(`✅ Conta teste criada: ${account.email}`);
            } else {
                console.log(`✅ Conta teste já existe: ${account.email}`);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao criar contas teste:', error);
    }
}

startServer();
