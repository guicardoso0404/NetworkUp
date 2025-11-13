// Verificar se usuário está logado e é admin
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = '/login';
} else if (currentUser.role !== 'admin') {
    alert('Acesso negado! Apenas administradores podem acessar esta página.');
    window.location.href = '/feed';
}

// Variáveis globais
let currentPage = 1;
let currentSection = 'dashboard';

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-name').textContent = currentUser.nome;
    loadDashboard();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
    });

    // Busca de usuários
    document.getElementById('search-btn').addEventListener('click', () => {
        currentPage = 1;
        loadUsers();
    });

    document.getElementById('search-users').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadUsers();
        }
    });

    // Paginação
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadUsers();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        loadUsers();
    });

    // Modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').classList.remove('show');
        });
    });

    document.getElementById('confirm-no').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('show');
    });
}

// Trocar seção
function switchSection(section) {
    currentSection = section;
    
    // Atualizar navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Mostrar seção
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Carregar dados
    if (section === 'dashboard') {
        loadDashboard();
    } else if (section === 'users') {
        loadUsers();
    } else if (section === 'posts') {
        loadRecentPosts();
    }
}

// Carregar Dashboard
async function loadDashboard() {
    try {
        const response = await fetch('http://localhost:3002/api/admin/stats', {
            headers: {
                'user-id': currentUser.id
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('total-users').textContent = stats.total_usuarios;
            document.getElementById('active-users').textContent = stats.usuarios_ativos;
            document.getElementById('banned-users').textContent = stats.usuarios_banidos;
            document.getElementById('total-posts').textContent = stats.total_postagens;
            document.getElementById('total-comments').textContent = stats.total_comentarios;
            document.getElementById('total-likes').textContent = stats.total_curtidas;
        } else {
            alert('Erro ao carregar estatísticas: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Erro ao carregar estatísticas');
    }
}

// Carregar Usuários
async function loadUsers() {
    try {
        const search = document.getElementById('search-users').value;
        const url = `http://localhost:3002/api/admin/users?page=${currentPage}&limit=20&search=${search}`;
        
        const response = await fetch(url, {
            headers: {
                'user-id': currentUser.id
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayUsers(result.data.users);
            updatePagination(result.data.pagination);
        } else {
            alert('Erro ao carregar usuários: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao carregar usuários');
    }
}

// Exibir Usuários
function displayUsers(users) {
    const tbody = document.getElementById('users-list');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td><span class="status-badge role-${user.role}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${user.total_posts || 0}</td>
            <td>${formatDate(user.data_criacao)}</td>
            <td style="white-space: nowrap;">
                <button onclick="viewUser(${user.id})" class="btn-primary btn-small">Ver</button>
                ${user.role !== 'admin' ? (
                    user.status === 'banido' 
                        ? `<button onclick="unbanUser(${user.id}, '${user.nome}')" class="btn-success btn-small">Desbanir</button>`
                        : `<button onclick="banUser(${user.id}, '${user.nome}')" class="btn-danger btn-small">Banir</button>`
                ) : '<span style="color: #9CA0A1; font-size: 12px;">Admin</span>'}
            </td>
        </tr>
    `).join('');
}

// Atualizar Paginação
function updatePagination(pagination) {
    document.getElementById('page-info').textContent = 
        `Página ${pagination.page} de ${pagination.totalPages} (${pagination.total} usuários)`;
    
    document.getElementById('prev-page').disabled = pagination.page === 1;
    document.getElementById('next-page').disabled = pagination.page === pagination.totalPages;
}

// Ver detalhes do usuário
async function viewUser(userId) {
    try {
        const response = await fetch(`http://localhost:3002/api/admin/users/${userId}`, {
            headers: {
                'user-id': currentUser.id
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const user = result.data.user;
            const stats = result.data.stats;
            
            document.getElementById('user-details').innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">${user.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Nome:</span>
                    <span class="detail-value">${user.nome}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${user.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Role:</span>
                    <span class="detail-value"><span class="status-badge role-${user.role}">${user.role}</span></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value"><span class="status-badge status-${user.status}">${user.status}</span></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Descrição:</span>
                    <span class="detail-value">${user.descricao || 'Não informado'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Data de Criação:</span>
                    <span class="detail-value">${formatDate(user.data_criacao)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total de Posts:</span>
                    <span class="detail-value">${stats.total_posts}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total de Comentários:</span>
                    <span class="detail-value">${stats.total_comentarios}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total de Curtidas:</span>
                    <span class="detail-value">${stats.total_curtidas}</span>
                </div>
            `;
            
            document.getElementById('user-modal').classList.add('show');
        } else {
            alert('Erro ao carregar detalhes do usuário: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes do usuário');
    }
}

// Banir usuário
function banUser(userId, userName) {
    document.getElementById('confirm-message').textContent = 
        `Tem certeza que deseja banir o usuário ${userName}?`;
    
    document.getElementById('confirm-yes').onclick = async () => {
        try {
            const motivo = prompt('Digite o motivo do banimento (opcional):');
            
            const response = await fetch(`http://localhost:3002/api/admin/users/${userId}/ban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser.id
                },
                body: JSON.stringify({ motivo })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                loadUsers();
            } else {
                alert('Erro: ' + result.message);
            }
            
            document.getElementById('confirm-modal').classList.remove('show');
        } catch (error) {
            console.error('Erro ao banir usuário:', error);
            alert('Erro ao banir usuário');
        }
    };
    
    document.getElementById('confirm-modal').classList.add('show');
}

// Desbanir usuário
function unbanUser(userId, userName) {
    document.getElementById('confirm-message').textContent = 
        `Tem certeza que deseja desbanir o usuário ${userName}?`;
    
    document.getElementById('confirm-yes').onclick = async () => {
        try {
            const response = await fetch(`http://localhost:3002/api/admin/users/${userId}/unban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': currentUser.id
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                loadUsers();
            } else {
                alert('Erro: ' + result.message);
            }
            
            document.getElementById('confirm-modal').classList.remove('show');
        } catch (error) {
            console.error('Erro ao desbanir usuário:', error);
            alert('Erro ao desbanir usuário');
        }
    };
    
    document.getElementById('confirm-modal').classList.add('show');
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

// Carregar postagens recentes
async function loadRecentPosts() {
    try {
        const response = await fetch('http://localhost:3002/api/posts/feed?limit=20');
        const result = await response.json();
        
        if (result.success) {
            displayPosts(result.data);
        } else {
            document.getElementById('posts-list').innerHTML = '<p class="loading">Erro ao carregar postagens</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        document.getElementById('posts-list').innerHTML = '<p class="loading">Erro ao carregar postagens</p>';
    }
}

// Exibir postagens
function displayPosts(posts) {
    const container = document.getElementById('posts-list');
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="loading">Nenhuma postagem encontrada</p>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card-admin">
            <div class="post-header-admin">
                <div class="post-author-admin">
                    <div class="post-author-avatar">👤</div>
                    <div class="post-author-info">
                        <h4>${post.usuario_nome || 'Usuário'}</h4>
                        <p>${formatDate(post.created_at)}</p>
                    </div>
                </div>
            </div>
            <div class="post-content-admin">
                ${post.conteudo}
                ${post.imagem ? `<img src="${post.imagem}" alt="Imagem do post" style="max-width: 100%; border-radius: 12px; margin-top: 1rem;">` : ''}
            </div>
            <div class="post-stats-admin">
                <span>❤️ ${post.curtidas} curtidas</span>
                <span>💬 ${post.comentarios} comentários</span>
            </div>
            <div class="post-actions-admin">
                <button onclick="deletePost(${post.id}, '${post.usuario_nome}')" class="btn-danger btn-small">Deletar Post</button>
            </div>
        </div>
    `).join('');
}

// Deletar postagem
function deletePost(postId, userName) {
    document.getElementById('confirm-message').textContent = 
        `Tem certeza que deseja deletar esta postagem de ${userName}?`;
    
    document.getElementById('confirm-yes').onclick = async () => {
        try {
            const response = await fetch(`http://localhost:3002/api/admin/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'user-id': currentUser.id
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                loadRecentPosts();
            } else {
                alert('Erro: ' + result.message);
            }
            
            document.getElementById('confirm-modal').classList.remove('show');
        } catch (error) {
            console.error('Erro ao deletar postagem:', error);
            alert('Erro ao deletar postagem');
        }
    };
    
    document.getElementById('confirm-modal').classList.add('show');
}

