// Configurações da API
const API_BASE_URL = 'http://localhost:3002/api';
let currentUser = null;
let viewingUserId = null;
let userPosts = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 USER-PROFILE: Página carregando...');
    
    // Verificar usuário logado
    currentUser = getCurrentUser();
    console.log('🔄 USER-PROFILE: Usuário atual:', currentUser);
    
    // Obter ID do usuário a ser visualizado da URL
    const urlParams = new URLSearchParams(window.location.search);
    viewingUserId = urlParams.get('user');
    console.log('🔄 USER-PROFILE: ID do usuário para visualizar:', viewingUserId);
    
    if (!viewingUserId) {
        console.error('❌ USER-PROFILE: ID do usuário não encontrado na URL');
        showToast('ID do usuário não encontrado', 'error');
        setTimeout(() => {
            window.location.href = '/feed';
        }, 2000);
        return;
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar perfil do usuário
    loadUserProfile();
});

// Configurar event listeners
function setupEventListeners() {
    // Filtros de posts
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterPosts(filter);
        });
    });
}

// Carregar perfil do usuário
async function loadUserProfile() {
    try {
        console.log('🔄 USER-PROFILE: Iniciando carregamento do perfil...');
        showLoading(true);
        console.log('🔄 USER-PROFILE: Carregando perfil do usuário:', viewingUserId);
        
        const response = await fetch(`${API_BASE_URL}/users/${viewingUserId}`);
        console.log('🔄 USER-PROFILE: Resposta recebida:', response.status);
        
        const result = await response.json();
        console.log('🔄 USER-PROFILE: Dados recebidos:', result);
        
        if (result.success) {
            const user = result.data.user;
            const posts = result.data.posts;
            const stats = result.data.stats;
            
            console.log('✅ USER-PROFILE: Perfil carregado:', user);
            console.log('✅ USER-PROFILE: Posts encontrados:', posts.length);
            
            // Atualizar informações do usuário
            updateUserInfo(user, stats);
            
            // Armazenar posts
            userPosts = posts;
            
            // Exibir posts
            displayUserPosts(posts);
            
        } else {
            console.error('❌ USER-PROFILE: Erro ao carregar perfil:', result.message);
            showError('Usuário não encontrado');
        }
        
    } catch (error) {
        console.error('❌ USER-PROFILE: Erro ao carregar perfil:', error);
        showError('Erro ao carregar perfil');
    } finally {
        showLoading(false);
    }
}

// Atualizar informações do usuário
function updateUserInfo(user, stats) {
    // Avatar
    const userAvatar = document.getElementById('userAvatar');
    if (user.foto_perfil) {
        userAvatar.src = user.foto_perfil;
    } else {
        userAvatar.src = '../assets/imagens/Logo.png';
    }
    userAvatar.alt = `Foto de ${user.nome}`;
    
    // Nome e email
    document.getElementById('userName').textContent = user.nome || 'Nome não informado';
    document.getElementById('userEmail').textContent = user.email || 'Email não informado';
    document.getElementById('userNamePosts').textContent = user.nome || 'Usuário';
    
    // Descrição
    const description = user.descricao || 'Este usuário ainda não adicionou uma descrição.';
    document.getElementById('userDescription').textContent = description;
    
    // Estatísticas
    document.getElementById('postsCount').textContent = stats.total_posts || 0;
    
    // Data de membro
    if (user.data_criacao) {
        const memberDate = new Date(user.data_criacao);
        const formattedDate = memberDate.toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
        });
        document.getElementById('memberSince').textContent = formattedDate;
    }
    
    // Atualizar título da página
    document.title = `${user.nome} - NetworkUp`;
}

// Exibir posts do usuário
function displayUserPosts(posts) {
    const container = document.getElementById('userPostsContainer');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-posts">
                <h3>Nenhum post ainda</h3>
                <p>Este usuário ainda não fez nenhuma postagem.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">
                    <img src="${document.getElementById('userAvatar').src}" alt="Avatar">
                </div>
                <div class="post-info">
                    <h4>${document.getElementById('userName').textContent}</h4>
                    <div class="post-date">${formatDate(post.created_at)}</div>
                </div>
            </div>
            
            <div class="post-content">
                ${escapeHtml(post.conteudo)}
            </div>
            
            ${post.imagem ? `
                <div class="post-image">
                    <img src="${post.imagem}" alt="Imagem do post" onclick="openImageModal('${post.imagem}')">
                </div>
            ` : ''}
            
            <div class="post-stats">
                <span>❤️ ${post.curtidas || 0} curtidas</span>
                <span>💬 ${post.comentarios || 0} comentários</span>
                <span>📅 ${formatDate(post.created_at)}</span>
            </div>
        </article>
    `).join('');
    
    // Adicionar modal de imagem se não existir
    if (!document.getElementById('imageModal')) {
        addImageModal();
    }
}

// Filtrar posts
function filterPosts(filter) {
    let filteredPosts = [...userPosts];
    
    switch (filter) {
        case 'recent':
            // Filtrar apenas posts dos últimos 30 dias
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            filteredPosts = userPosts.filter(post => {
                const postDate = new Date(post.created_at);
                return postDate >= thirtyDaysAgo;
            });
            break;
        case 'all':
        default:
            // Mostrar todos os posts
            break;
    }
    
    displayUserPosts(filteredPosts);
}

// Mostrar/esconder loading
function showLoading(show) {
    const modal = document.getElementById('loadingModal');
    modal.style.display = show ? 'flex' : 'none';
}

// Mostrar erro
function showError(message) {
    const container = document.getElementById('userPostsContainer');
    container.innerHTML = `
        <div class="error-message">
            <h3>Erro</h3>
            <p>${message}</p>
            <button onclick="window.location.href='/feed'" style="
                background: #A7C0BE;
                color: #4D6772;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 1rem;
            ">Voltar ao Feed</button>
        </div>
    `;
}

// Abrir modal de imagem
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    if (!modal) {
        addImageModal();
    }
    
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    document.getElementById('imageModal').style.display = 'block';
}

// Adicionar modal de imagem
function addImageModal() {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeImageModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close-modal" onclick="closeImageModal()">&times;</span>
                <img id="modalImage" src="" alt="Imagem ampliada">
            </div>
        </div>
    `;
    
    // Adicionar estilos do modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
}

// Fechar modal de imagem
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Funções auxiliares
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
        localStorage.removeItem('currentUser');
        return null;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('pt-BR');
}

function showToast(message, type = 'info') {
    // Criar container se não existir
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remover toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Expor funções globalmente
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
