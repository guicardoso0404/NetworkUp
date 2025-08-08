const { executeQuery, connectDB } = require('./db');

async function fixProfilePhoto() {
    try {
        await connectDB();
        
        console.log('🔧 Corrigindo foto de perfil da conta principal...');
        
        // Verificar dados atuais da conta principal
        const currentData = await executeQuery('SELECT id, nome, email, foto_perfil FROM usuarios WHERE email = ?', ['guilherme@networkup.com.br']);
        
        if (currentData.length === 0) {
            console.log('❌ Conta principal não encontrada!');
            return;
        }
        
        console.log('📊 Dados atuais:');
        console.table(currentData);
        
        // Atualizar foto de perfil para uma das fotos existentes
        const fotoPath = '/uploads/profiles/profile-1753932090369-585392988.JPG';
        
        await executeQuery('UPDATE usuarios SET foto_perfil = ? WHERE email = ?', [fotoPath, 'guilherme@networkup.com.br']);
        
        console.log('✅ Foto de perfil atualizada!');
        
        // Verificar após atualização
        const updatedData = await executeQuery('SELECT id, nome, email, foto_perfil FROM usuarios WHERE email = ?', ['guilherme@networkup.com.br']);
        console.log('📊 Dados após atualização:');
        console.table(updatedData);
        
        console.log('\n✅ Correção concluída! Faça login novamente para ver a mudança.');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir foto de perfil:', error);
    }
    
    process.exit(0);
}

fixProfilePhoto();
