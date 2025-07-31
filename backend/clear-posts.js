const { executeQuery, connectDB } = require('./db');

async function clearAllPosts() {
    try {
        await connectDB();
        
        console.log('🧹 Limpando TODOS os posts, comentários e curtidas...');
        
        // Obter IDs das contas preservadas
        const preservedEmails = ['guilherme@networkup.com.br', 'guilherme123@networkup.com.br'];
        const preservedUsers = await executeQuery('SELECT id FROM usuarios WHERE email IN (?, ?)', preservedEmails);
        let preservedUserIds = [];
        
        if (preservedUsers.length > 0) {
            preservedUserIds = preservedUsers.map(user => user.id);
            console.log('🔒 Contas preservadas (IDs):', preservedUserIds);
        }
        
        // Deletar TODOS os comentários
        await executeQuery('DELETE FROM comentarios WHERE 1=1');
        console.log('✅ Todos os comentários deletados');
        
        // Deletar TODAS as curtidas
        await executeQuery('DELETE FROM curtidas WHERE 1=1');
        console.log('✅ Todas as curtidas deletadas');
        
        // Deletar TODOS os posts
        await executeQuery('DELETE FROM postagens WHERE 1=1');
        console.log('✅ Todos os posts deletados');
        
        // Verificar se ainda existem posts
        const remainingPosts = await executeQuery('SELECT COUNT(*) as count FROM postagens');
        console.log(`📊 Posts restantes: ${remainingPosts[0].count}`);
        
        // Verificar usuários preservados
        const remainingUsers = await executeQuery('SELECT id, nome, email FROM usuarios ORDER BY data_criacao DESC');
        console.log('👥 Usuários restantes:');
        console.table(remainingUsers);
        
        console.log('\n✅ Limpeza completa realizada!');
        console.log('📝 Qualquer post "bom dia" foi definitivamente removido!');
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
    
    process.exit(0);
}

clearAllPosts();
