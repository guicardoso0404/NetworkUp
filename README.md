
# 🌐 NetworkUp

**NetworkUp** é uma aplicação web de rede social corporativa para empresas de tecnologia. Ela permite o cadastro de usuários, criação e exclusão de postagens, visualização de feed, perfis e integração com banco de dados MySQL.

---

## 📁 Estrutura do Projeto

```
NOVONETWORK/
├── backend/              # Lógica do servidor Node.js
│   ├── server.js
│   ├── db.js
│   ├── delete-post.js
│   ├── clear-posts.js
│   └── networkup_database_complete.sql
├── public/               # Frontend HTML/CSS/JS
│   ├── html/
│   ├── css/
│   ├── js/
│   └── assets/
└── README.md             # Documentação
```

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** `>=16.0.0`
- **Express**
- **MySQL2**
- **Multer** (upload de arquivos)
- **Body-Parser**
- **CORS**
- **Nodemon** (dev)

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript Vanilla**

---

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
- Crie um banco de dados.
- Importe o arquivo SQL:
  ```
  backend/networkup_database_complete.sql
  ```
- Edite o `db.js` com suas credenciais:
  ```js
  const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'networkup'
  });
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

---

## 🧠 Funcionalidades

- 📝 Cadastro e login de usuários
- 📸 Upload de postagens
- 🗑️ Remoção de postagens
- 👥 Visualização de perfis e usuários
- 🏠 Feed principal de postagens
- 🧹 Limpeza de postagens antigas via script

---

## 🌐 Estrutura do Frontend

A pasta `public/` contém:

- **HTML**: telas como `login.html`, `cadastro.html`, `feed.html`, `profile.html`
- **CSS**: estilos específicos por tela (`feed.css`, `login.css` etc.)
- **JS**: scripts para controle de interação
- **Assets**: imagens como o logo

---

## 📜 Scripts Disponíveis

| Comando         | Descrição                        |
|-----------------|----------------------------------|
| `npm start`     | Inicia o servidor Node.js        |
| `npm run dev`   | Inicia com `nodemon` (hot reload)|
| `npm run setup` | Script de setup (se existir)     |

---

## 📄 Licença

MIT © Guilherme Cardoso
