// SOBRE.JS - NetworkUp
// Paleta de cores: Gray (#9CA0A1), Ivory (#D7D4CC), Aquamarine (#A7C0BE), Charcoal (#4D6772)

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
