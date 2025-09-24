# NetworkUp API - Documentação Swagger

Este repositório contém a documentação da API do projeto NetworkUp, uma rede social para conectar microempresas de tecnologia do Rio Grande do Sul.

## Sobre a Documentação

A documentação da API foi criada utilizando o formato Swagger/OpenAPI 2.0, permitindo visualizar de forma interativa todos os endpoints disponíveis, seus parâmetros, respostas e modelos de dados. A interface foi personalizada para seguir a identidade visual do NetworkUp, utilizando a mesma paleta de cores e estilo do projeto principal.

## Como Acessar a Documentação

1. **Inicie o servidor do NetworkUp:**
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Acesse a documentação pelo navegador:**
   - URL: [🦟 http://localhost:3002/api-docs](http://localhost:3002/api-docs)
   - Ou clique no link "Documentação da API" na página "Sobre"

## Principais Endpoints

A API do NetworkUp é dividida em 5 categorias principais:

### Autenticação
- `POST /api/auth/cadastro` - Cadastrar novo usuário
- `POST /api/auth/login` - Fazer login

### Usuários
- `PUT /api/users/update` - Atualizar perfil de usuário
- `POST /api/users/upload-avatar` - Enviar/atualizar foto de perfil
- `GET /api/users/{id}` - Obter perfil de usuário

### Posts
- `POST /api/posts/postar` - Criar postagem
- `GET /api/posts/feed` - Obter feed
- `POST /api/posts/curtir` - Curtir/descurtir postagem
- `POST /api/posts/comentar` - Adicionar comentário
- `DELETE /api/posts/deletar/{id}` - Deletar postagem

### Chat
- `GET /api/chat/conversas/{usuarioId}` - Obter conversas do usuário
- `GET /api/chat/mensagens/{conversaId}` - Obter mensagens de uma conversa
- `POST /api/chat/conversas/criar` - Criar nova conversa
- `GET /api/chat/usuarios/buscar` - Buscar usuários para conversa

### Administração
- `GET /api/users/find/{email}` - Buscar usuário por email (somente admin)
- `GET /api/users/list` - Listar todos usuários (somente admin)

## Modelos de Dados

A documentação inclui modelos detalhados para as principais entidades do sistema:

- `Usuario` - Dados básicos de usuário
- `UsuarioDetalhado` - Perfil completo do usuário
- `Post` - Publicação básica
- `PostDetalhado` - Publicação com informações completas
- `Comentario` - Comentário em uma publicação
- `Conversa` - Conversa entre usuários (chat)
- `Mensagem` - Mensagem dentro de uma conversa

## Socket.io

Além dos endpoints REST, o NetworkUp também utiliza Socket.io para comunicação em tempo real no sistema de chat. A documentação Swagger não cobre estas funcionalidades em tempo real, mas os principais eventos são:

- `authenticate` - Autenticar usuário no socket
- `send_message` - Enviar mensagem
- `new_message` - Receber mensagem nova
- `mark_as_read` - Marcar mensagens como lidas
- `messages_read` - Notificar que mensagens foram lidas
- `typing` - Indicar que usuário está digitando
- `user_typing` - Notificar que usuário está digitando

## Autenticação

A API utiliza uma abordagem simples de autenticação baseada em informações do usuário armazenadas no localStorage. Para endpoints administrativos, a verificação é feita pelo endereço de email do usuário.

## Recursos da Interface

A interface da documentação inclui:
- Design responsivo para desktop e dispositivos móveis
- Menu de navegação consistente com o resto do site
- Código de cores para métodos HTTP (GET, POST, PUT, DELETE)
- Expansão/recolhimento de endpoints e modelos
- Exemplos de solicitação e resposta
- Campo de busca para filtrar endpoints
- Integração visual com a identidade do NetworkUp

---

Desenvolvido por Guilherme Cardoso para o projeto NetworkUp.