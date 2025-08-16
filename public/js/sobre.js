document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página Sobre carregada');
    
    // Configurar botão voltar
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.history.back();
        });
    }
});
