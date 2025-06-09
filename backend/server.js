// 1. Importação das bibliotecas
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const crypto = require('crypto');
const { enviarEmailVerificacao } = require('./email');

// 2. Configuração do Servidor e Conexão com o Banco
const app = express();
const PORT = process.env.API_PORT || 3001;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 3. Middlewares: Funções que preparam nosso servidor
app.use(cors()); // Permite que o frontend acesse a API
app.use(express.json()); // Permite que o servidor entenda requisições com corpo em JSON

// Substitua o seu endpoint de cadastro antigo por este
app.post('/api/cadastrar', async (req, res) => {
    const { nome, usuario, email, senha, funcao } = req.body; // Adicionamos 'funcao'

    // 1. CHECAGEM DO DOMÍNIO DO E-MAIL
    const dominiosPermitidos = ['@fatec.sp.gov.br', '@etec.sp.gov.br'];
    const dominioValido = dominiosPermitidos.some(dominio => email.endsWith(dominio));

    if (!dominioValido) {
        return res.status(400).json({ error: 'Por favor, use seu e-mail institucional FATEC ou ETEC.' });
    }

    // Validação dos outros campos
    if (!nome || !usuario || !senha || !funcao) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // 2. GERAÇÃO DO TOKEN DE VERIFICAÇÃO
        const token = crypto.randomBytes(32).toString('hex');
        const expiracao = new Date();
        expiracao.setHours(expiracao.getHours() + 1); // Token expira em 1 hora

        // 3. CRIAÇÃO DO USUÁRIO COMO "PENDENTE"
        const query = `
            INSERT INTO usuarios (nome_completo, nome_usuario, email, senha, funcao, token_verificacao, token_expiracao)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email;
        `;
        const values = [nome, usuario, email, senhaCriptografada, funcao, token, expiracao];

        await pool.query(query, values);

        // 4. ENVIO DO E-MAIL DE VERIFICAÇÃO (Será implementado no próximo passo)
        await enviarEmailVerificacao(email, token);

        res.status(201).json({
            message: 'Cadastro realizado com sucesso! Por favor, verifique seu e-mail institucional para ativar sua conta.'
        });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'O email ou nome de usuário já está em uso.' });
        }
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});
// ENDPOINT DE LOGIN
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        // AQUI ESTÁ A LINHA QUE PROVAVELMENTE ESTAVA COM PROBLEMA
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const user = result.rows[0];

        if (user.status !== 'ATIVO') {
            return res.status(403).json({ error: 'Sua conta ainda não foi ativada. Por favor, verifique seu e-mail.' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        delete user.senha;

        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: user
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

app.get('/api/verificar', async (req,res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token de verificação não fornecido.'});
    }

    try {
        // 1. Encontrar o usuário pelo token de verificação
        const query = 'SELECT * FROM usuarios WHERE token_verificacao = $1';
        const result = await pool.query(query, [token]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Token inválido ou não encontrado'});
        }

        const user = result.rows[0];

        // 2. Verificar se o token já expirou
        const now = new Date();
        if (now > user.token_expiracao) {
            // TODO: No futuro, poderíamos adicionar uma lógica para reenviar um novo token.
            return res.status(400).json({ message: 'Seu token de verificação expirou. Por favor, solicite um novo.'});
        }

        // 3. Se o token for válido e não estiver expirado atualiza o status do usuário
        const updateQuery = ` UPDATE usuarios SET status = 'ATIVO', token_verificacao = NULL, token_expiracao = NULL WHERE id =$1`;

        await pool.query(updateQuery, [user.id]);

        res.status(200).json({ message: 'Conta ativada com sucesso! Você já pode fazer login.'})
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.'});
    }
});

app.post('/api/publicacoes', async (req,res) => {
    const { conteudo, imagem_url } = req.body;

    const usuario_id = 13

    if (!conteudo && !imagem_url){
        return res.status(400).json({ error: 'A publicação não pode estar vazia.'});
    }

    try {
        const query = `INSERT INTO publicacoes (conteudo, imagem_url, usuario_id) VALUES ($1, $2, $3) RETURNING *;`
        const values = [conteudo, imagem_url || null, usuario_id];

        const result = await pool.query(query,values);

        res.status(201).json({
            message: 'Publicação criada com sucesso!',
            publicacao: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar publicação:', error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.'});
    }
});

app.get('/api/publicacoes', async (req,res) => {
    try {
        const query = ` SELECT publicacoes.*, usuarios.nome_completo,usuarios.foto_perfil FROM publicacoes JOIN usuarios ON publicacoes.usuario_id = usuarios.id ORDER BY publicacoes.data_criacao DESC;`;

        const result = await pool.query(query);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Erro ao buscar publicações', error);
        res.status(500).json({ error: "Ocorreu um erro interno no servidor"});
    }
});

// 5. Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});