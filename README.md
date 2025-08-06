# 🌐 Rede Social Full-Stack

> Uma plataforma de rede social moderna e responsiva, desenvolvida com as melhores tecnologias do mercado.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![Node.js](https://img.shields.io/badge/Node.js-18.0-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

## 📸 Preview

> 🚧 **Screenshots em breve** - Projeto em desenvolvimento ativo

## 🚀 Funcionalidades

### ✅ Implementadas
- [x] Sistema de autenticação JWT
- [x] Cadastro e login de usuários
- [x] Feed de publicações
- [x] Interface responsiva
- [x] Sistema de emails

### 🔄 Em Desenvolvimento
- [ ] Sistema de curtidas e comentários
- [ ] Upload de imagens
- [ ] Chat em tempo real
- [ ] Notificações push
- [ ] Sistema de amizades
- [ ] Dark/Light mode

### 🎯 Próximas Features
- [ ] Stories temporários
- [ ] Sistema de grupos
- [ ] Busca avançada de usuários
- [ ] Dashboard de analytics

## 🛠️ Tecnologias Utilizadas

### Frontend
- **[Next.js 14](https://nextjs.org/)** - Framework React com SSR
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[JavaScript ES6+](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)** - Linguagem principal

### Backend
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[Express.js](https://expressjs.com/)** - Framework web minimalista
- **[JWT](https://jwt.io/)** - Autenticação baseada em tokens

### Banco de Dados
- **[MySQL](https://www.mysql.com/)** - Banco relacional

### Ferramentas
- **[Git](https://git-scm.com/)** - Controle de versão
- **[ESLint](https://eslint.org/)** - Linter para JavaScript
- **[Nodemailer](https://nodemailer.com/)** - Envio de emails

## 📋 Pré-requisitos

- Node.js 18.0 ou superior
- MySQL 8.0 ou superior
- Git

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/Guilherme-Bisof/rede-social.git
cd rede-social
```

### 2. Configure o Backend
```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações de banco
```

### 3. Configure o Frontend
```bash
cd ../frontend
npm install
```

### 4. Configure o Banco de Dados
```sql
-- Crie o banco de dados
CREATE DATABASE rede_social;

-- Execute as migrations (em desenvolvimento)
```

### 5. Execute o projeto
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
rede-social/
│
├── backend/                 # API Node.js
│   ├── controllers/         # Controladores da aplicação
│   ├── routes/             # Rotas da API
│   ├── middleware/         # Middlewares personalizados
│   ├── config/             # Configurações (DB, JWT, etc)
│   ├── utils/              # Utilitários
│   └── server.js           # Servidor principal
│
├── frontend/               # Aplicação Next.js
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── styles/         # Estilos globais
│   │   └── utils/          # Utilitários do frontend
│   └── public/             # Arquivos estáticos
│
└── README.md
```

## 🎨 Design System

- **Cores principais:** Azul (#3B82F6), Cinza (#6B7280)
- **Tipografia:** Inter, system fonts
- **Breakpoints:** Mobile-first, responsivo
- **Componentes:** Reutilizáveis e modulares

## 📊 Arquitetura

- **Frontend:** SPA com Next.js e roteamento client-side
- **Backend:** API RESTful stateless
- **Banco:** Modelo relacional otimizado
- **Autenticação:** JWT com refresh tokens
- **Deploy:** Vercel (Frontend) + Railway (Backend)

## 🔒 Segurança

- Validação de dados no frontend e backend
- Sanitização de inputs contra XSS
- Rate limiting nas rotas sensíveis
- Hashing de senhas com bcrypt
- Headers de segurança configurados

## 🧪 Testes

> Em desenvolvimento - Testes unitários e de integração planejados

## 📈 Performance

- Otimização de imagens automática (Next.js)
- Lazy loading de componentes
- Cache de API responses
- Minificação de assets

## 🤝 Contribuição

Este é um projeto pessoal para fins de aprendizado e portfólio. Sugestões são bem-vindas!

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Guilherme Bisof**
- LinkedIn: [/in/guilhermebisof](https://www.linkedin.com/in/guilhermebisof/)
- GitHub: [@Guilherme-Bisof](https://github.com/Guilherme-Bisof)
- Email: gui_bisof@hotmail.com

## 🙏 Agradecimentos

- Fatec Tatuí - Curso de GTI
- Comunidade open source
- Mentores e colegas de curso

---

⭐ **Se este projeto te ajudou de alguma forma, considere dar uma star!**
