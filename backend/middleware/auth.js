// Middleware de autenticação e autorização
const { executeQuery } = require('../db');

// Middleware para verificar se o usuário está autenticado
async function isAuthenticated(req, res, next) {
    try {
        const userId = req.headers['user-id'];
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Autenticação necessária' 
            });
        }
        
        // Verificar se o usuário existe e está ativo
        const users = await executeQuery(
            'SELECT id, nome, email, role, status FROM usuarios WHERE id = ?', 
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }
        
        const user = users[0];
        
        if (user.status === 'banido') {
            return res.status(403).json({ 
                success: false, 
                message: 'Usuário banido' 
            });
        }
        
        if (user.status === 'suspenso') {
            return res.status(403).json({ 
                success: false, 
                message: 'Usuário suspenso' 
            });
        }
        
        // Adicionar informações do usuário ao request
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor' 
        });
    }
}

// Middleware para verificar se o usuário é administrador
async function isAdmin(req, res, next) {
    try {
        // Primeiro verificar autenticação
        const userId = req.headers['user-id'];
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Autenticação necessária' 
            });
        }
        
        // Buscar usuário e verificar role
        const users = await executeQuery(
            'SELECT id, nome, email, role, status FROM usuarios WHERE id = ?', 
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }
        
        const user = users[0];
        
        // Verificar se é admin
        if (user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Acesso negado. Privilégios de administrador necessários.' 
            });
        }
        
        // Verificar status
        if (user.status !== 'ativo') {
            return res.status(403).json({ 
                success: false, 
                message: 'Conta não está ativa' 
            });
        }
        
        // Adicionar informações do usuário ao request
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Erro no middleware de admin:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor' 
        });
    }
}

// Middleware para verificar se o usuário pode acessar o recurso
// (ou é o próprio usuário ou é admin)
async function canAccessResource(req, res, next) {
    try {
        const userId = req.headers['user-id'];
        const targetUserId = req.params.id || req.body.usuario_id;
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Autenticação necessária' 
            });
        }
        
        // Buscar usuário
        const users = await executeQuery(
            'SELECT id, nome, email, role, status FROM usuarios WHERE id = ?', 
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }
        
        const user = users[0];
        
        // Verificar se é admin ou se é o próprio usuário
        if (user.role === 'admin' || parseInt(userId) === parseInt(targetUserId)) {
            req.user = user;
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'Acesso negado' 
            });
        }
        
    } catch (error) {
        console.error('Erro no middleware de acesso:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor' 
        });
    }
}

module.exports = {
    isAuthenticated,
    isAdmin,
    canAccessResource
};
