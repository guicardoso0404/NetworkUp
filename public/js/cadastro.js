// CADASTRO.JS - NetworkUp
// Paleta de cores: Gray (#9CA0A1), Ivory (#D7D4CC), Aquamarine (#A7C0BE), Charcoal (#4D6772)

// Configurações da API
const API_BASE_URL = 'http://localhost:3002/api';

document.addEventListener('DOMContentLoaded', function() {
    // FORÇAR LIMPEZA COMPLETA PARA DEBUG
    console.log('🧹 Limpando localStorage para debug...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Aguardar um pouco antes de verificar usuário
    setTimeout(() => {
        // Verificar se usuário já está logado
        const currentUser = getCurrentUser();
        if (currentUser) {
            console.log('✅ Usuário já logado, redirecionando...');
            window.location.href = '/feed';
            return;
        }
        
        console.log('📝 Usuário não logado, carregando página de cadastro');
    }, 100);
    
    // Configurar formulário de cadastro
    const cadastroForm = document.getElementById('registerForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', handleRegister);
        
        // Configurar validação em tempo real
        setupFormValidation();
    }
    
    // Configurar toggle de senha
    const toggleBtns = document.querySelectorAll('.toggle-password');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            togglePassword(input.id);
        });
    });
});

// Função de cadastro
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validações
    if (!data.nome || !data.email || !data.senha) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    if (!validateEmail(data.email)) {
        showToast('E-mail inválido', 'error');
        return;
    }
    
    if (!validatePassword(data.senha)) {
        showToast('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    if (data.confirmSenha && data.senha !== data.confirmSenha) {
        showToast('As senhas não coincidem', 'error');
        return;
    }
    
    const termsCheckbox = form.querySelector('input[name="terms"]');
    if (termsCheckbox && !termsCheckbox.checked) {
        showToast('Você deve aceitar os termos de uso', 'error');
        return;
    }
    
    setButtonLoading(submitButton, true);
    
    try {
        console.log('📝 Tentando cadastro:', data.email);
        
        const response = await fetch(`${API_BASE_URL}/auth/cadastro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Cadastro realizado com sucesso!');
            console.log('👤 Dados do usuário cadastrado:', result.data);
            showToast('Cadastro realizado com sucesso!', 'success');
            
            // Fazer login automático após cadastro
            console.log('🔐 Fazendo login automático...');
            
            try {
                const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: data.email,
                        senha: data.senha
                    })
                });
                
                const loginResult = await loginResponse.json();
                
                if (loginResult.success) {
                    console.log('✅ Login automático realizado!');
                    console.log('👤 Usuário logado:', loginResult.data.usuario);
                    
                    // Salvar dados do usuário no localStorage
                    localStorage.setItem('currentUser', JSON.stringify(loginResult.data.usuario));
                    
                    showToast('Bem-vindo! Redirecionando para o feed...', 'success');
                    
                    // Redirecionar para o feed imediatamente
                    setTimeout(() => {
                        console.log('🔄 Redirecionando para o feed...');
                        window.location.href = '/feed';
                    }, 1000);
                } else {
                    console.log('⚠️ Login automático falhou:', loginResult.message);
                    showToast('Cadastro realizado! Redirecionando para o login...', 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                }
            } catch (loginError) {
                console.error('❌ Erro no login automático:', loginError);
                showToast('Cadastro realizado! Redirecionando para o login...', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
        } else {
            console.log('❌ Cadastro falhou:', result.message);
            showToast(result.message || 'Erro no cadastro', 'error');
        }
    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        showToast('Erro de conexão. Verifique se o servidor está rodando.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Função para obter usuário atual
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

// Validação de email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validação de senha
function validatePassword(password) {
    return password.length >= 6;
}

// Toggle senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    
    if (input && button) {
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
            button.setAttribute('title', 'Ocultar senha');
        } else {
            input.type = 'password';
            button.textContent = '👁️';
            button.setAttribute('title', 'Mostrar senha');
        }
    }
}

// Função global para ser chamada pelo HTML
window.togglePassword = togglePassword;

// Loading button
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        button.textContent = 'Cadastrando...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = 'Cadastrar';
    }
}

// Configurar validação de formulário
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

// Validar campo individual
function validateField(input) {
    const formGroup = input.closest('.form-group');
    let isValid = true;
    let message = '';
    
    // Validações específicas
    if (input.type === 'email' && input.value) {
        if (!validateEmail(input.value)) {
            isValid = false;
            message = 'E-mail inválido';
        }
    } else if (input.type === 'password' && input.value) {
        if (!validatePassword(input.value)) {
            isValid = false;
            message = 'Senha deve ter pelo menos 6 caracteres';
        }
    } else if (input.name === 'confirmSenha' && input.value) {
        const senhaInput = document.getElementById('senha');
        if (senhaInput && input.value !== senhaInput.value) {
            isValid = false;
            message = 'As senhas não coincidem';
        }
    }
    
    // Verificar se campo obrigatório está vazio
    if (input.required && !input.value.trim()) {
        isValid = false;
        message = 'Este campo é obrigatório';
    }
    
    // Aplicar estilos visuais
    if (isValid) {
        formGroup.classList.remove('invalid');
        formGroup.classList.add('valid');
    } else {
        formGroup.classList.remove('valid');
        formGroup.classList.add('invalid');
        showFieldError(input, message);
    }
    
    return isValid;
}

// Mostrar erro no campo
function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    let errorElement = formGroup.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            color: #dc2626;
            font-size: 0.8em;
            margin-top: 4px;
        `;
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Limpar erro do campo
function clearFieldError(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('invalid');
    
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Função para mostrar toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Criar container se não existir
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
    
    // Estilos do toast
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
    
    // Mostrar toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover toast após 4 segundos
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
