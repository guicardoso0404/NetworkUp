// FEED.JS - NetworkUp
// Paleta de cores: Gray (#9CA0A1), Ivory (#D7D4CC), Aquamarine (#A7C0BE), Charcoal (#4D6772)

// Configurações da API
const API_BASE_URL = 'http://localhost:3002/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Feed carregando...');
    
    // Verificar se usuário está logado (opcional)
    currentUser = getCurrentUser();
    
    if (currentUser) {
        console.log('✅ Usuário logado detectado:', currentUser.nome, currentUser.email);
    } else {
        console.log('ℹ️ Usuário não logado - modo visitante');
    }
    
    // Configurar interface
    setupUserInterface();
    setupPostForm();
    setupUserMenu();
    
    // Carregar feed
    loadFeed();
    
    console.log('✅ Feed inicializado!');
});

// Configurar interface do usuário
function setupUserInterface() {
    const loggedUserArea = document.getElementById('loggedUserArea');
    const guestUserArea = document.getElementById('guestUserArea');
    const headerUserName = document.getElementById('headerUserName');
    const headerUserEmail = document.getElementById('headerUserEmail');
    const createPostSection = document.getElementById('createPostSection');
    const guestMessageSection = document.getElementById('guestMessageSection');
    
    if (currentUser) {
        console.log('🔧 Configurando interface para usuário logado:', currentUser.nome);
        
        // Mostrar área do usuário logado
        if (loggedUserArea) loggedUserArea.style.display = 'block';
        if (guestUserArea) guestUserArea.style.display = 'none';
        
        // Atualizar informações do usuário
        if (headerUserName) headerUserName.textContent = currentUser.nome;
        if (headerUserEmail) headerUserEmail.textContent = currentUser.email;
        
        // Atualizar foto de perfil no header
        const headerUserAvatar = document.getElementById('headerUserAvatar');
        if (headerUserAvatar) {
            if (currentUser.foto_perfil) {
                headerUserAvatar.src = currentUser.foto_perfil;
                headerUserAvatar.alt = `Foto de ${currentUser.nome}`;
            } else {
                // Se não tiver foto, usar logo padrão
                headerUserAvatar.src = '../assets/imagens/Logo.png';
                headerUserAvatar.alt = 'Avatar padrão';
            }
        }
        
        // Mostrar seção de criar post para usuários logados
        if (createPostSection) createPostSection.style.display = 'block';
        if (guestMessageSection) guestMessageSection.style.display = 'none';
    } else {
        console.log('🔧 Configurando interface para visitante');
        
        // Mostrar área do visitante
        if (loggedUserArea) loggedUserArea.style.display = 'none';
        if (guestUserArea) guestUserArea.style.display = 'block';
        
        // Mostrar mensagem para visitantes
        if (createPostSection) createPostSection.style.display = 'none';
        if (guestMessageSection) guestMessageSection.style.display = 'block';
    }
}

// Configurar formulário de postagem
function setupPostForm() {
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePost);
        
        // Contador de caracteres
        const textarea = document.getElementById('postContent');
        if (textarea) {
            textarea.addEventListener('input', updateCharacterCount);
            updateCharacterCount();
        }
        
        // Upload de foto
        const photoInput = document.getElementById('photoInput');
        if (photoInput) {
            photoInput.addEventListener('change', handlePhotoSelect);
        }
    }
}

// Configurar menu do usuário
function setupUserMenu() {
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Configurar botão de perfil
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            console.log('📱 Redirecionando para perfil...');
            window.location.href = '/profile';
        });
    }
    
    // Configurar botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('� Fazendo logout...');
            
            // Limpar dados do usuário
            localStorage.removeItem('currentUser');
            sessionStorage.clear();
            
            // Mostrar mensagem e redirecionar
            showToast('Logout realizado com sucesso!', 'success');
            
            setTimeout(() => {
                window.location.href = '/home';
            }, 1000);
        });
    }
}
    document.addEventListener('click', function(e) {
        if (!userMenuBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Botões apenas se estiver logado
    if (currentUser) {
        // Botão Perfil
        if (profileBtn) {
            profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = '/profile';
            });
        }
}

// Criar postagem
async function handleCreatePost(event) {
    event.preventDefault();
    
    const form = event.target;
    const content = form.content.value.trim();
    const photoInput = document.getElementById('photoInput');
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (!content && !photoInput.files[0]) {
        showToast('Digite algo ou adicione uma foto para postar', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Você precisa estar logado para postar', 'error');
        return;
    }
    
    setButtonLoading(submitButton, true);
    
    try {
        console.log('📝 Criando postagem...');
        
        // Preparar FormData para envio de arquivo
        const formData = new FormData();
        formData.append('usuario_id', currentUser.id);
        formData.append('conteudo', content);
        
        if (photoInput.files[0]) {
            formData.append('photo', photoInput.files[0]);
        }
        
        const response = await fetch(`${API_BASE_URL}/posts/postar`, {
            method: 'POST',
            body: formData // Não definir Content-Type para FormData
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Postagem criada:', data.data.id);
            showToast('Postagem criada com sucesso!', 'success');
            form.reset();
            removePhoto(); // Limpar preview da foto
            updateCharacterCount();
            loadFeed(); // Recarregar feed
        } else {
            console.log('❌ Erro ao criar postagem:', data.message);
            showToast(data.message || 'Erro ao criar postagem', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao criar postagem:', error);
        showToast('Erro de conexão. Verifique se o servidor está rodando.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Carregar feed
async function loadFeed() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;
    
    // Mostrar loading
    postsContainer.innerHTML = '<div class="loading"><p>Carregando postagens...</p></div>';
    
    try {
        console.log('📰 Carregando feed...');
        
        const response = await fetch(`${API_BASE_URL}/posts/feed`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Feed carregado:', data.data.length, 'postagens');
            renderPosts(data.data);
        } else {
            console.log('❌ Erro ao carregar feed:', data.message);
            postsContainer.innerHTML = '<div class="loading"><p>Erro ao carregar postagens</p></div>';
        }
    } catch (error) {
        console.error('❌ Erro ao carregar feed:', error);
        postsContainer.innerHTML = '<div class="loading"><p>Erro de conexão</p></div>';
    }
}

// Renderizar postagens
function renderPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="loading">
                <p>Nenhuma postagem encontrada</p>
                <p>Seja o primeiro a compartilhar algo!</p>
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="user-avatar" onclick="openUserProfile(${post.usuario_id})">
                    ${post.foto_perfil ? 
                        `<img src="${post.foto_perfil}" alt="Foto de ${post.usuario_nome}" />` : 
                        `<div class="avatar-placeholder">${post.usuario_nome ? post.usuario_nome.charAt(0).toUpperCase() : 'U'}</div>`
                    }
                </div>
                <div class="user-info">
                    <h3 onclick="openUserProfile(${post.usuario_id})" class="clickable-username">${post.usuario_nome || 'Usuário'}</h3>
                    <div class="post-time">${formatDate(post.created_at)}</div>
                </div>
                ${canDeletePost(post) ? `
                    <div class="post-menu">
                        <button class="delete-btn" onclick="deletePost(${post.id})" title="Deletar postagem">
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <div class="post-content">
                ${escapeHtml(post.conteudo)}
            </div>
            
            ${post.imagem ? `
                <div class="post-image">
                    <img src="${post.imagem}" alt="Imagem do post" onclick="openImageModal('${post.imagem}')">
                </div>
            ` : ''}
            
            <div class="post-actions">
                <button class="action-btn like-btn" onclick="toggleLike(${post.id})" ${!currentUser ? 'disabled title="Faça login para curtir"' : ''}>
                    ❤️ <span>${post.curtidas || 0}</span>
                </button>
                <button class="action-btn comment-btn" onclick="toggleComments(${post.id})">
                    💬 <span>${post.comentarios_lista ? post.comentarios_lista.length : 0}</span>
                </button>
                <button class="action-btn share-btn" onclick="sharePost(${post.id})">
                    📤 Compartilhar
                </button>
            </div>
            
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                ${renderComments(post.comentarios_lista || [])}
                
                ${currentUser ? `
                    <form class="comment-form" onsubmit="handleAddComment(event, ${post.id})">
                        <input type="text" placeholder="Adicione um comentário..." required>
                        <button type="submit">Enviar</button>
                    </form>
                ` : `
                    <div class="guest-comment-message">
                        <p>Para comentar, <a href="login.html">faça login</a> ou <a href="cadastro.html">crie uma conta</a>.</p>
                    </div>
                `}
            </div>
        </article>
    `).join('');
    
    // Adicionar modal de imagem se não existir
    if (!document.getElementById('imageModal')) {
        addImageModal();
    }
}

// Renderizar comentários
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p class="no-comments">Nenhum comentário ainda</p>';
    }
    
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-avatar" onclick="openUserProfile(${comment.usuario_id})">
                ${comment.foto_perfil ? 
                    `<img src="${comment.foto_perfil}" alt="Foto de ${comment.usuario_nome}" />` : 
                    `<div class="avatar-placeholder">${comment.usuario_nome ? comment.usuario_nome.charAt(0).toUpperCase() : 'U'}</div>`
                }
            </div>
            <div class="comment-content">
                <div class="comment-author" onclick="openUserProfile(${comment.usuario_id})">${comment.usuario_nome || 'Usuário'}</div>
                <div class="comment-text">${escapeHtml(comment.conteudo)}</div>
                <div class="comment-time">${formatDate(comment.created_at)}</div>
            </div>
        </div>
    `).join('');
}

// Curtir postagem
async function toggleLike(postId) {
    if (!currentUser) {
        showToast('Você precisa estar logado para curtir', 'error');
        return;
    }
    
    try {
        console.log('❤️ Curtindo postagem:', postId);
        
        const response = await fetch(`${API_BASE_URL}/posts/curtir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postagem_id: postId,
                usuario_id: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Curtida:', data.data.acao);
            
            // Atualizar interface
            const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
            const likeCount = likeBtn.querySelector('span');
            
            if (data.data.acao === 'curtiu') {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
            
            likeCount.textContent = data.data.total_curtidas;
        } else {
            console.log('❌ Erro ao curtir:', data.message);
            showToast(data.message || 'Erro ao curtir postagem', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao curtir postagem:', error);
        showToast('Erro de conexão', 'error');
    }
}

// Alternar comentários
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    }
}

// Adicionar comentário
async function handleAddComment(event, postId) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('Você precisa estar logado para comentar', 'error');
        return;
    }
    
    const form = event.target;
    const input = form.querySelector('input');
    const content = input.value.trim();
    
    if (!content) {
        showToast('Digite um comentário', 'error');
        return;
    }
    
    try {
        console.log('💬 Adicionando comentário na postagem:', postId);
        
        const response = await fetch(`${API_BASE_URL}/posts/comentar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postagem_id: postId,
                usuario_id: currentUser.id,
                conteudo: content
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Comentário adicionado:', data.data.id);
            form.reset();
            loadFeed(); // Recarregar feed para mostrar novo comentário
            showToast('Comentário adicionado!', 'success');
        } else {
            console.log('❌ Erro ao comentar:', data.message);
            showToast(data.message || 'Erro ao adicionar comentário', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar comentário:', error);
        showToast('Erro de conexão', 'error');
    }
}

// Compartilhar postagem
function sharePost(postId) {
    if (navigator.share) {
        navigator.share({
            title: 'NetworkUp - Postagem',
            text: 'Confira esta postagem no NetworkUp!',
            url: window.location.href
        });
    } else {
        showToast('Link copiado para área de transferência!', 'success');
        // Aqui você poderia implementar cópia para clipboard
    }
}

// Verificar se pode deletar post
function canDeletePost(post) {
    if (!currentUser) return false;
    
    // É o criador do post
    const isOwner = post.usuario_id === currentUser.id;
    
    // É administrador (verificar por email específico)
    const isAdmin = currentUser.email === 'admin@networkup.com' || currentUser.email === 'teste@teste.com';
    
    return isOwner || isAdmin;
}

// Deletar postagem
async function deletePost(postId) {
    if (!currentUser) {
        showToast('Você precisa estar logado para deletar posts', 'error');
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar esta postagem? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        console.log('🗑️ Deletando postagem:', postId);
        
        const response = await fetch(`${API_BASE_URL}/posts/deletar/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Postagem deletada:', postId);
            showToast('Postagem deletada com sucesso!', 'success');
            loadFeed(); // Recarregar feed
        } else {
            console.log('❌ Erro ao deletar postagem:', data.message);
            showToast(data.message || 'Erro ao deletar postagem', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao deletar postagem:', error);
        showToast('Erro de conexão', 'error');
    }
}

// Contador de caracteres
function updateCharacterCount() {
    const textarea = document.getElementById('postContent');
    const counter = document.querySelector('.character-count');
    
    if (textarea && counter) {
        const count = textarea.value.length;
        const max = textarea.getAttribute('maxlength') || 500;
        counter.textContent = `${count}/${max}`;
        
        if (count > max * 0.9) {
            counter.style.color = '#dc2626';
        } else {
            counter.style.color = '#9CA0A1';
        }
    }
}

// Logout
function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userToken');
        currentUser = null;
        
        console.log('✅ Logout realizado');
        showToast('Logout realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = '/home';
        }, 1000);
    }
}

// Utilitários
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
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('pt-BR');
}

function setButtonLoading(button, loading = true) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        button.textContent = 'Postando...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = 'Postar';
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(container);
    }
    
    toast.style.cssText = `
        background: ${type === 'success' ? '#A7C0BE' : type === 'error' ? '#dc2626' : '#4D6772'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Expor funções globalmente
window.toggleLike = toggleLike;
window.toggleComments = toggleComments;
window.handleAddComment = handleAddComment;
window.sharePost = sharePost;
window.deletePost = deletePost;
window.openUserProfile = openUserProfile;

// Função para abrir perfil do usuário
function openUserProfile(userId) {
    if (!userId) {
        console.error('ID do usuário não fornecido');
        return;
    }
    
    console.log('🔄 Abrindo perfil do usuário:', userId);
    
    // Verificar se é o próprio usuário
    if (currentUser && currentUser.id == userId) {
        // Redirecionar para página de perfil próprio
        window.location.href = '/profile';
    } else {
        // Redirecionar para página de perfil de outro usuário
        window.location.href = `/user-profile?user=${userId}`;
    }
}

// Funções para manipulação de fotos
function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione apenas arquivos de imagem', 'error');
        return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB', 'error');
        return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('photoPreview');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    const photoInput = document.getElementById('photoInput');
    const preview = document.getElementById('photoPreview');
    
    photoInput.value = '';
    preview.style.display = 'none';
}

function addImageModal() {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
        <span class="close-modal" onclick="closeImageModal()">&times;</span>
        <div class="image-modal-content">
            <img id="modalImage" src="" alt="Imagem ampliada">
        </div>
    `;
    document.body.appendChild(modal);
    
    // Fechar modal ao clicar fora da imagem
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
}

function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    modalImage.src = imageSrc;
    modal.style.display = 'block';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// Expor funções de imagem globalmente
window.removePhoto = removePhoto;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
