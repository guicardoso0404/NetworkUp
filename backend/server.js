// 🦟👀
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectDB, executeQuery } = require('./db');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:3002", 
            "http://localhost:3000", 
            "http://127.0.0.1:3002",
            "http://127.0.0.1:3000",
            "http://networkup.local:3002",
            "http://networkup.local:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});
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

// ROTAS DE LOGIN E CADASTRO


// Cadastro
app.post('/api/auth/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;  
        // Validação básica
        if (!nome || !email || !senha) {
            return res.json({ success: false, message: 'Nome, email e senha são obrigatórios' });
        }
        
        // Verificar se email já existe
        const existing = await executeQuery('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.json({ success: false, message: 'Este email já está cadastrado' });
        }
        
        // Inserir usuário 
        const result = await executeQuery(`
            INSERT INTO usuarios (nome, email, senha)
            VALUES (?, ?, ?)
        `, [nome, email, senha]);
        
        console.log('Usuário cadastrado:', { id: result.insertId, nome, email, senha: senha });
        
        res.json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            data: { id: result.insertId, nome, email }
        });
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
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
        
        console.log('Usuário atualizado:', { id: usuario_id, nome, email });
        
        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso!',
            data: { id: usuario_id, nome, email, descricao }
        });
        
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
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
        
        console.log('Avatar atualizado para usuário:', usuario_id);
        
        res.json({
            success: true,
            message: 'Foto de perfil atualizada com sucesso!',
            data: { foto_perfil: avatarPath }
        });
        
    } catch (error) {
        console.error('Erro ao fazer upload do avatar:', error);
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
            console.log('Login falhou:', email);
            return res.json({ success: false, message: 'Email ou senha incorretos' });
        }
        
        const user = users[0];
        console.log('Login sucesso:', { id: user.id, nome: user.nome, email: user.email, senha: senha });
        delete user.senha; // Remover senha da resposta
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            data: { usuario: user, redirectTo: '/feed' }
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

//ROTAS DE POSTAGENS 

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
        
        console.log('Postagem criada:', result.insertId);
        
        res.json({
            success: true,
            message: 'Postagem criada com sucesso!',
            data: { id: result.insertId, usuario_id, conteudo, imagem: imagePath }
        });
        
    } catch (error) {
        console.error('Erro ao criar postagem:', error);
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
                WHERE c.postagem_id = ?
                ORDER BY c.data_criacao ASC
                LIMIT 3
            `, [post.id]);
            
            post.comentarios_lista = comments;
        }
        
        res.json({ success: true, data: posts });
        
    } catch (error) {
        console.error('Erro ao obter feed:', error);
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
        console.error('Erro ao curtir:', error);
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
        
        console.log('Comentário adicionado:', result.insertId);
        
        res.json({
            success: true,
            message: 'Comentário adicionado com sucesso!',
            data: { id: result.insertId, postagem_id, usuario_id, conteudo }
        });
        
    } catch (error) {
        console.error('Erro ao comentar:', error);
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
        
        // Verificar se é o criador do post ou admin (email com "guilherme")
        const isOwner = post[0].usuario_id === parseInt(usuario_id);
        const isAdmin = user[0].email.includes('guilherme');
        
        if (!isOwner && !isAdmin) {
            return res.json({ success: false, message: 'Você não tem permissão para deletar este post' });
        }
        
        // Deletar comentários primeiro
        await executeQuery('DELETE FROM comentarios WHERE postagem_id = ?', [postId]);
        
        // Deletar curtidas
        await executeQuery('DELETE FROM curtidas WHERE postagem_id = ?', [postId]);
        
        // Deletar postagem
        await executeQuery('DELETE FROM postagens WHERE id = ?', [postId]);
        
        console.log('Postagem deletada:', postId, 'por usuário:', usuario_id);
        
        res.json({
            success: true,
            message: 'Postagem deletada com sucesso!',
            data: { postagem_id: postId }
        });
        
    } catch (error) {
        console.error('Erro ao deletar postagem:', error);
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
            WHERE p.usuario_id = ?
            ORDER BY p.data_criacao DESC
            LIMIT 10
        `, [userId]);
        
        // Contar total de posts
        const totalPosts = await executeQuery('SELECT COUNT(*) as count FROM postagens WHERE usuario_id = ?', [userId]);
        
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
        console.error('Erro ao obter usuário:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Endpoint seguro para verificar dados do usuário (somente para admin)
app.get('/api/users/find/:email', async (req, res) => {
    try {
        const requestEmail = req.headers['user-email'];
        const email = req.params.email;
        
        // Verificar se o solicitante é admin (contém "guilherme" no email)
        if (!requestEmail || !requestEmail.includes('guilherme')) {
            return res.json({ success: false, message: 'Acesso negado' });
        }
        
        const users = await executeQuery('SELECT id, nome, email, descricao, foto_perfil FROM usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.json({ success: false, message: 'Usuário não encontrado' });
        }
        
        res.json({
            success: true,
            data: users[0]
        });
        
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Listar usuários (acesso restrito)
app.get('/api/users/list', async (req, res) => {
    try {
        const requestEmail = req.headers['user-email'];
        
        // Verificar se o solicitante é admin (contém "guilherme" no email)
        if (!requestEmail || !requestEmail.includes('guilherme')) {
            return res.json({ success: false, message: 'Acesso negado' });
        }
        
        const users = await executeQuery(`
            SELECT id, nome, email, descricao, foto_perfil, 
                   DATE_FORMAT(data_criacao, '%d/%m/%Y %H:%i') as data_criacao 
            FROM usuarios 
            ORDER BY data_criacao DESC
        `);
        
        res.json({
            success: true,
            message: `${users.length} usuários encontrados`,
            data: users
        });
        
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
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

// Rota de teste removida

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

// Rota de teste removida

app.get('/sobre', (req, res) => {
    res.sendFile('html/sobre.html', { root: '../public' });
});

// Rota para página de chat
app.get('/chat', (req, res) => {
    res.sendFile('html/chat.html', { root: '../public' });
});

// ===== ROTAS DO CHAT =====

// Obter conversas do usuário
app.get('/api/chat/conversas/:usuarioId', async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.json({ success: false, message: 'ID do usuário é obrigatório' });
        }
        
        // Buscar conversas em que o usuário é participante
        const conversas = await executeQuery(`
            SELECT 
                c.id, c.nome, c.tipo, c.data_criacao
            FROM 
                conversas c
            INNER JOIN 
                participantes_conversa pc ON c.id = pc.conversa_id
            WHERE 
                pc.usuario_id = ? AND pc.status = 'ativo'
            ORDER BY 
                c.data_criacao DESC
        `, [usuarioId]);
        
        // Para cada conversa, buscar detalhes adicionais
        for (const conversa of conversas) {
            // Se for chat individual, buscar informações do outro usuário
            if (conversa.tipo === 'individual') {
                const outroUsuario = await executeQuery(`
                    SELECT 
                        u.id, u.nome, u.foto_perfil
                    FROM 
                        usuarios u
                    INNER JOIN 
                        participantes_conversa pc ON u.id = pc.usuario_id
                    WHERE 
                        pc.conversa_id = ? AND pc.usuario_id != ? AND pc.status = 'ativo'
                    LIMIT 1
                `, [conversa.id, usuarioId]);
                
                if (outroUsuario.length > 0) {
                    conversa.outro_usuario = outroUsuario[0];
                    // Se não tiver nome definido, usar nome do outro usuário
                    if (!conversa.nome) {
                        conversa.nome = outroUsuario[0].nome;
                    }
                }
            }
            
            // Buscar última mensagem
            const ultimaMensagem = await executeQuery(`
                SELECT 
                    m.id, m.conteudo, m.data_envio, m.status,
                    u.id as usuario_id, u.nome as usuario_nome
                FROM 
                    mensagens m
                INNER JOIN 
                    usuarios u ON m.usuario_id = u.id
                WHERE 
                    m.conversa_id = ?
                ORDER BY 
                    m.data_envio DESC
                LIMIT 1
            `, [conversa.id]);
            
            if (ultimaMensagem.length > 0) {
                conversa.ultima_mensagem = ultimaMensagem[0];
            }
            
            // Contar mensagens não lidas
            const mensagensNaoLidas = await executeQuery(`
                SELECT 
                    COUNT(*) as total
                FROM 
                    mensagens
                WHERE 
                    conversa_id = ? AND 
                    usuario_id != ? AND
                    status = 'enviada'
            `, [conversa.id, usuarioId]);
            
            conversa.nao_lidas = mensagensNaoLidas[0].total;
        }
        
        res.json({
            success: true,
            data: conversas
        });
        
    } catch (error) {
        console.error('Erro ao obter conversas:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Obter mensagens de uma conversa
app.get('/api/chat/mensagens/:conversaId', async (req, res) => {
    try {
        const conversaId = req.params.conversaId;
        const usuarioId = req.query.usuarioId;
        
        if (!conversaId || !usuarioId) {
            return res.json({ success: false, message: 'ID da conversa e do usuário são obrigatórios' });
        }
        
        // Verificar se o usuário é participante da conversa
        const participante = await executeQuery(`
            SELECT id FROM participantes_conversa
            WHERE conversa_id = ? AND usuario_id = ? AND status = 'ativo'
        `, [conversaId, usuarioId]);
        
        if (participante.length === 0) {
            return res.json({ success: false, message: 'Você não tem acesso a esta conversa' });
        }
        
        // Buscar mensagens
        const mensagens = await executeQuery(`
            SELECT 
                m.id, m.conteudo, m.data_envio, m.status,
                u.id as usuario_id, u.nome as usuario_nome, u.foto_perfil
            FROM 
                mensagens m
            INNER JOIN 
                usuarios u ON m.usuario_id = u.id
            WHERE 
                m.conversa_id = ?
            ORDER BY 
                m.data_envio ASC
        `, [conversaId]);
        
        // Marcar mensagens como lidas
        await executeQuery(`
            UPDATE mensagens
            SET status = 'lida'
            WHERE conversa_id = ? AND usuario_id != ? AND status = 'enviada'
        `, [conversaId, usuarioId]);
        
        res.json({
            success: true,
            data: mensagens
        });
        
    } catch (error) {
        console.error('Erro ao obter mensagens:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Criar nova conversa
app.post('/api/chat/conversas/criar', async (req, res) => {
    try {
        const { usuarioId, outroUsuarioId, tipo, nome } = req.body;
        
        if (!usuarioId || (!outroUsuarioId && tipo !== 'grupo') || !tipo) {
            return res.json({ success: false, message: 'Dados insuficientes para criar conversa' });
        }
        
        // Para chat individual, verificar se já existe conversa entre os usuários
        if (tipo === 'individual' && outroUsuarioId) {
            // Verificar se já existe conversa
            const conversaExistente = await executeQuery(`
                SELECT c.id
                FROM conversas c
                JOIN participantes_conversa pc1 ON c.id = pc1.conversa_id
                JOIN participantes_conversa pc2 ON c.id = pc2.conversa_id
                WHERE c.tipo = 'individual'
                AND pc1.usuario_id = ? AND pc1.status = 'ativo'
                AND pc2.usuario_id = ? AND pc2.status = 'ativo'
                LIMIT 1
            `, [usuarioId, outroUsuarioId]);
            
            if (conversaExistente.length > 0) {
                return res.json({
                    success: true,
                    message: 'Conversa já existe',
                    data: { id: conversaExistente[0].id, ja_existia: true }
                });
            }
        }
        
        // Criar nova conversa
        const resultConversa = await executeQuery(`
            INSERT INTO conversas (nome, tipo)
            VALUES (?, ?)
        `, [nome || null, tipo]);
        
        const conversaId = resultConversa.insertId;
        
        // Adicionar usuário criador como participante
        await executeQuery(`
            INSERT INTO participantes_conversa (conversa_id, usuario_id)
            VALUES (?, ?)
        `, [conversaId, usuarioId]);
        
        // Para chat individual, adicionar o outro usuário
        if (tipo === 'individual' && outroUsuarioId) {
            await executeQuery(`
                INSERT INTO participantes_conversa (conversa_id, usuario_id)
                VALUES (?, ?)
            `, [conversaId, outroUsuarioId]);
        }
        
        res.json({
            success: true,
            message: 'Conversa criada com sucesso',
            data: { id: conversaId, ja_existia: false }
        });
        
    } catch (error) {
        console.error('Erro ao criar conversa:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Buscar usuários para conversa
app.get('/api/chat/usuarios/buscar', async (req, res) => {
    try {
        const { termo, usuarioId } = req.query;
        
        if (!termo || !usuarioId) {
            return res.json({ success: false, message: 'Termo de busca e ID do usuário são obrigatórios' });
        }
        
        // Buscar usuários que correspondem ao termo (exceto o próprio usuário)
        const usuarios = await executeQuery(`
            SELECT id, nome, email, foto_perfil
            FROM usuarios
            WHERE (nome LIKE ? OR email LIKE ?)
            AND id != ?
            LIMIT 10
        `, [`%${termo}%`, `%${termo}%`, usuarioId]);
        
        res.json({
            success: true,
            data: usuarios
        });
        
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Info da API
app.get('/api', (req, res) => {
    res.json({
        message: 'NetworkUp API está funcionando!',
        version: '1.0.0',
        endpoints: {
            'POST /api/auth/cadastro': 'Cadastrar usuário',
            'POST /api/auth/login': 'Fazer login',
            'PUT /api/users/update': 'Atualizar perfil de usuário',
            'POST /api/users/upload-avatar': 'Enviar/atualizar foto de perfil',
            'POST /api/posts/postar': 'Criar postagem',
            'GET /api/posts/feed': 'Obter feed',
            'POST /api/posts/curtir': 'Curtir/descurtir postagem',
            'POST /api/posts/comentar': 'Comentar postagem',
            'GET /api/users/:id': 'Obter perfil de usuário',
            'DELETE /api/posts/deletar/:id': 'Deletar postagem (requer autenticação)',
            'GET /api/users/find/:email': 'Buscar usuário por email (somente admin)',
            'GET /api/users/list': 'Listar usuários cadastrados (somente admin)',
            'GET /api/chat/conversas/:usuarioId': 'Obter conversas do usuário',
            'GET /api/chat/mensagens/:conversaId': 'Obter mensagens de uma conversa',
            'POST /api/chat/conversas/criar': 'Criar nova conversa',
            'GET /api/chat/usuarios/buscar': 'Buscar usuários para conversa'
        }
    });
});


// 404
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ success: false, message: 'Endpoint não encontrado' });
    } else {
        res.sendFile('html/home.html', { root: '../public' });
    }
});

// Configurar Socket.io para chat em tempo real
function setupSocketIO() {
    // Mapear usuários conectados: { userId: socketId }
    const connectedUsers = new Map();
    
    io.on('connection', (socket) => {
        console.log(`Nova conexão: ${socket.id}`);
        
        // Autenticar usuário
        socket.on('authenticate', async (userData) => {
            try {
                const { userId } = userData;
                
                if (userId) {
                    // Associar socketId ao userId
                    connectedUsers.set(userId.toString(), socket.id);
                    socket.userId = userId;
                    console.log(`Usuário ${userId} autenticado, socket: ${socket.id}`);
                    
                    // Juntar-se a salas para cada conversa do usuário
                    const conversas = await executeQuery(`
                        SELECT conversa_id 
                        FROM participantes_conversa 
                        WHERE usuario_id = ? AND status = 'ativo'
                    `, [userId]);
                    
                    conversas.forEach(({ conversa_id }) => {
                        socket.join(`chat:${conversa_id}`);
                    });
                    
                    // Notificar cliente que está autenticado
                    socket.emit('authenticated', { success: true });
                }
            } catch (error) {
                console.error('Erro na autenticação socket:', error);
                socket.emit('authenticated', { success: false });
            }
        });
        
        // Enviar mensagem
        socket.on('send_message', async (data) => {
            try {
                const { conversaId, conteudo } = data;
                const userId = socket.userId;
                
                if (!userId || !conversaId || !conteudo) {
                    socket.emit('message_error', { message: 'Dados incompletos' });
                    return;
                }
                
                // Verificar se usuário é participante da conversa
                const participante = await executeQuery(`
                    SELECT id FROM participantes_conversa
                    WHERE conversa_id = ? AND usuario_id = ? AND status = 'ativo'
                `, [conversaId, userId]);
                
                if (participante.length === 0) {
                    socket.emit('message_error', { message: 'Você não tem acesso a esta conversa' });
                    return;
                }
                
                // Salvar mensagem no banco
                const result = await executeQuery(`
                    INSERT INTO mensagens (conversa_id, usuario_id, conteudo)
                    VALUES (?, ?, ?)
                `, [conversaId, userId, conteudo]);
                
                // Buscar detalhes da mensagem para retornar
                const [mensagem] = await executeQuery(`
                    SELECT 
                        m.id, m.conteudo, m.data_envio, m.status,
                        u.id as usuario_id, u.nome as usuario_nome, u.foto_perfil
                    FROM 
                        mensagens m
                    INNER JOIN 
                        usuarios u ON m.usuario_id = u.id
                    WHERE 
                        m.id = ?
                `, [result.insertId]);
                
                // Enviar mensagem para todos na sala
                io.to(`chat:${conversaId}`).emit('new_message', {
                    message: mensagem,
                    conversaId
                });
                
                console.log(`Mensagem enviada: ${result.insertId} para conversa ${conversaId}`);
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                socket.emit('message_error', { message: 'Erro ao enviar mensagem' });
            }
        });
        
        // Marcar mensagens como lidas
        socket.on('mark_as_read', async (data) => {
            try {
                const { conversaId } = data;
                const userId = socket.userId;
                
                if (!userId || !conversaId) {
                    return;
                }
                
                // Atualizar status das mensagens
                await executeQuery(`
                    UPDATE mensagens
                    SET status = 'lida'
                    WHERE conversa_id = ? AND usuario_id != ? AND status = 'enviada'
                `, [conversaId, userId]);
                
                // Notificar os outros usuários da conversa
                socket.to(`chat:${conversaId}`).emit('messages_read', {
                    conversaId,
                    userId
                });
            } catch (error) {
                console.error('Erro ao marcar mensagens como lidas:', error);
            }
        });
        
        // Quando usuário digita
        socket.on('typing', (data) => {
            const { conversaId } = data;
            const userId = socket.userId;
            
            if (!userId || !conversaId) {
                return;
            }
            
            // Notificar outros usuários da conversa
            socket.to(`chat:${conversaId}`).emit('user_typing', {
                conversaId,
                userId
            });
        });
        
        // Desconexão
        socket.on('disconnect', () => {
            if (socket.userId) {
                console.log(`Usuário ${socket.userId} desconectado`);
                connectedUsers.delete(socket.userId.toString());
            }
        });
    });
    
    console.log('Socket.io configurado para chat em tempo real');
}

// Iniciar servidor
async function startServer() {
    try {
        await connectDB();
        
        // Garantir contas padrão
        await createDefaultAccounts();
        
        // Configurar Socket.io
        setupSocketIO();
        
        httpServer.listen(PORT, () => {
            console.log('\nNETWORKUP SERVER');
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log('\nACESSAR MEU PROJETO:');
            console.log(`   Página Inicial: http://localhost:${PORT}/home`);
            console.log(`   Login: http://localhost:${PORT}/login`);
            console.log(`   Cadastro: http://localhost:${PORT}/cadastro`);
            console.log(`   Feed: http://localhost:${PORT}/feed`);
            console.log(`   Chat: http://localhost:${PORT}/chat`);
            console.log(`   Sobre: http://localhost:${PORT}/sobre`);
            console.log('\nDESENVOLVIMENTO:');
            console.log(`   API: http://localhost:${PORT}/api`);
            console.log('\nCONTAS TESTE:');
            console.log(`   Email 1: guilherme@networkup.com.br`);
            console.log(`   Email 2: guilherme123@networkup.com.br`);
            console.log(`   Senha: 123456 (para ambas)`);
            console.log('\nIMPORTANTE: Posts e dados dessas contas são PRESERVADOS!');
            console.log('\nDICA: Ctrl+Click nos links para abrir!');
            console.log('================================\n');
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Função para garantir que as contas principais existam
async function createDefaultAccounts() {
    try {
        // Lista de contas principais
        const mainAccounts = [
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
                descricao: 'Conta de teste secundária'
            }
        ];
        
        for (const account of mainAccounts) {
            const existing = await executeQuery('SELECT id FROM usuarios WHERE email = ?', [account.email]);
            
            if (existing.length === 0) {
                await executeQuery(`
                    INSERT INTO usuarios (nome, email, senha, descricao)
                    VALUES (?, ?, ?, ?)
                `, [account.nome, account.email, account.senha, account.descricao]);
                console.log(`Conta padrão criada: ${account.email}`);
            }
        }
    } catch (error) {
        console.error('Erro ao criar contas padrão:', error);
    }
}

startServer();
