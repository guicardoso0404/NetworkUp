<!-- 🦟👀 -->
# 🌐 NetworkUp

**NetworkUp** é uma aplicação web completa de rede social corporativa para empresas de tecnologia. Ela oferece funcionalidades como cadastro de usuários, criação e interação com postagens, perfis personalizáveis, chat em tempo real e muito mais, tudo com integração a banco de dados MySQL.

## � Demonstração

![NetworkUp Logo](./public/assets/imagens/Logo.png)

## �📁 Estrutura do Projeto

```
NOVONETWORK/
├── backend/              # Lógica do servidor Node.js
│   ├── server.js         # Servidor Express, rotas API e Socket.io
│   ├── db.js             # Conexão com banco de dados e funções de DB
│   └── networkup_database_complete.sql  # Schema completo do banco de dados
├── public/               # Frontend HTML/CSS/JS
│   ├── html/             # Páginas HTML (home, feed, chat, perfis, etc)
│   ├── css/              # Estilos CSS para cada página
│   ├── js/               # Scripts JavaScript client-side
│   ├── assets/           # Recursos estáticos (imagens, logos)
│   └── uploads/          # Arquivos enviados por usuários
│       ├── posts/        # Imagens das postagens
│       └── profiles/     # Fotos de perfil
└── README.md             # Documentação
```

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** `>=16.0.0`
- **Express** `^4.18.2` - Framework web
- **MySQL2** `^3.6.0` - Conexão com banco de dados
- **Multer** `^2.0.2` - Upload e gerenciamento de arquivos
- **Socket.io** `^4.8.1` - Comunicação em tempo real
- **CORS** - Cross-Origin Resource Sharing
- **Nodemon** - Hot reload em desenvolvimento

### Frontend
- **HTML5**
- **CSS3** 
- **JavaScript Vanilla**
- **Socket.io Client** - Comunicação em tempo real

### Banco de Dados
- **MySQL** - Relacional com suporte completo a UTF-8

## ⚙️ Instalação e Execução

### 1. Clone o repositório
```bash
git clone https://github.com/guicardoso0404/NetworkUp.git
cd networkup/backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados MySQL
- O sistema cria automaticamente o banco `networkup_certo` se não existir
- Ajuste as configurações no arquivo `db.js` se necessário:
  ```js
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'networkup_certo',
    port: 3306,
    charset: 'utf8mb4'
  };
  ```

### 4. Inicie o servidor
- Em ambiente de produção:
  ```bash
  npm start
  ```
- Em desenvolvimento (com hot reload):
  ```bash
  npm run dev
  ```

### 5. Acesse o aplicativo
- Abra o navegador em `http://localhost:3002/home`
- Credenciais de teste:
  - Email: `guilherme@networkup.com.br`
  - Senha: `123456`

## 🧠 Funcionalidades

### Usuários
- 📝 Cadastro e login de usuários
- 🖼️ Upload e gerenciamento de fotos de perfil
- ✏️ Edição completa de perfil (nome, email, senha, descrição)
- � Visualização de perfis de outros usuários
- 🔒 Sistema seguro de autenticação

### Feed e Postagens
- �📸 Criação de postagens com texto e imagens
- 🏠 Feed principal com postagens em ordem cronológica
- 👍 Sistema de curtidas em postagens
- 💬 Comentários em postagens
- �️ Remoção de postagens (próprias ou admin)

### Chat em Tempo Real
- 💌 Sistema completo de chat individual
- 🔔 Notificações de novas mensagens
- ✓ Indicador de mensagem lida
- ⌨️ Indicador de "digitando"
- 🔍 Busca de usuários para iniciar conversas

### Sistema Administrativo
- 👮 Funcionalidades administrativas para contas com "guilherme" no email
- 📊 Gerenciamento de usuários
- 🛡️ Remoção de conteúdo inadequado

## 🌐 Estrutura do Frontend

### Páginas
- **home.html** - Página inicial/landing page
- **login.html** - Autenticação de usuários
- **cadastro.html** - Registro de novos usuários
- **feed.html** - Feed principal de postagens
- **profile.html** - Perfil do usuário logado
- **user-profile.html** - Visualização de outros perfis
- **chat.html** - Sistema de mensagens em tempo real
- **sobre.html** - Informações sobre o projeto

### Recursos
- CSS específico para cada página
- JavaScript modular e orientado a objetos
- Sistema responsivo para diferentes dispositivos
- Upload e preview de imagens
- Validação de formulários

## 🔌 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/cadastro | Cadastrar novo usuário |
| POST | /api/auth/login | Autenticar usuário |
| PUT | /api/users/update | Atualizar perfil |
| POST | /api/users/upload-avatar | Atualizar foto de perfil |
| GET | /api/users/:id | Obter informações de usuário |
| POST | /api/posts/postar | Criar nova postagem |
| GET | /api/posts/feed | Obter feed de postagens |
| POST | /api/posts/curtir | Curtir/descurtir postagem |
| POST | /api/posts/comentar | Comentar em postagem |
| DELETE | /api/posts/deletar/:id | Remover postagem |
| GET | /api/chat/conversas/:usuarioId | Obter conversas do usuário |
| GET | /api/chat/mensagens/:conversaId | Obter mensagens de uma conversa |
| POST | /api/chat/conversas/criar | Criar nova conversa |
| GET | /api/chat/usuarios/buscar | Buscar usuários para chat |

## 📦 Estrutura do Banco de Dados

- **usuarios**: Armazenamento de dados de usuários
- **postagens**: Postagens com suporte a texto e imagem
- **comentarios**: Comentários em postagens
- **curtidas**: Sistema de curtidas com controle de unicidade
- **conversas**: Gerenciamento de conversas de chat
- **participantes_conversa**: Controle de participantes em chats
- **mensagens**: Armazenamento de mensagens com status

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor em modo produção |
| `npm run dev` | Inicia o servidor com hot reload (nodemon) |
| `npm run setup` | Script de configuração |

## 🔧 Requisitos de Sistema

- Node.js >= 16.0.0
- MySQL >= 5.7
- Navegador moderno com suporte a ES6
- Porta 3002 disponível para o servidor

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT © Guilherme Cardoso

---

Desenvolvido com ❤️ por Guilherme Cardoso | © 2023-2025
