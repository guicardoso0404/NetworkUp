# 🌐 NetworkUp

**NetworkUp** é uma aplicação web de rede social corporativa para empresas de tecnologia. Ela permite o cadastro de usuários, criação e exclusão de postagens, visualização de feed, perfis e integração com banco de dados MySQL.

## 📁 Estrutura do Projeto

```
NOVONETWORK/
├── backend/              # Lógica do servidor Node.js
│   ├── server.js         # Servidor Express e rotas da API
│   ├── db.js             # Conexão com banco de dados e funções de DB
│   └── networkup_database_complete.sql  # Schema do banco de dados
├── public/               # Frontend HTML/CSS/JS
│   ├── html/             # Páginas HTML
│   ├── css/              # Estilos CSS
│   ├── js/               # Scripts JavaScript
│   ├── assets/           # Recursos estáticos
│   └── uploads/          # Pasta para uploads de imagens
└── README.md             # Documentação
```

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** `>=16.0.0`
- **Express** - Framework web
- **MySQL2** - Conexão com banco de dados
- **Multer** - Upload de arquivos
- **CORS** - Cross-Origin Resource Sharing
- **Nodemon** - Hot reload em desenvolvimento

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript Vanilla**

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
- Crie um banco de dados chamado `networkup_certo`.
- Ajuste as configurações no arquivo `db.js` se necessário:
  ```js
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'networkup_certo',
    port: 3306
  };
  ```

### 4. Inicie o servidor
- Em ambiente de produção:
  ```bash
  npm start
  ```
- Em desenvolvimento:
  ```bash
  npm run dev
  ```

## 🧠 Funcionalidades

- 📝 Cadastro e login de usuários
- 🖼️ Upload de fotos de perfil
- ✏️ Edição de perfil
- 📸 Criação de postagens com texto e imagens
- 👍 Curtir/descurtir postagens
- 💬 Comentar em postagens
- 👥 Visualização de perfis de usuário
- 🏠 Feed principal de postagens
- 🗑️ Remoção de postagens (próprias ou admin)
- 👮 Funcionalidades administrativas para contas com "guilherme" no email

## 🌐 Estrutura do Frontend

- **Páginas**:
  - `home.html` - Página inicial
  - `login.html` - Autenticação
  - `cadastro.html` - Registro de usuários
  - `feed.html` - Feed de postagens
  - `profile.html` - Perfil do usuário logado
  - `user-profile.html` - Perfil de outros usuários
  - `sobre.html` - Informações sobre o projeto

- **Recursos**:
  - CSS específico por página
  - JavaScript para interação com a API
  - Upload e exibição de imagens

## 📜 Scripts Disponíveis

| Comando         | Descrição                        |
|-----------------|----------------------------------|
| `npm start`     | Inicia o servidor Node.js        |
| `npm run dev`   | Inicia com `nodemon` (hot reload)|
| `npm run setup` | Script de setup                  |

## 📄 Licença

MIT © Guilherme Cardoso
