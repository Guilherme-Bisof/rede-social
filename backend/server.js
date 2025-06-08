// 1. Importação das bibliotecas
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

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

// 4. Endpoint (Rota) de Cadastro de Usuário
app.post('/api/cadastrar', async (req, res) => {
    // Extraímos os dados do corpo da requisição (que virão do formulário do frontend)
    const { nome, usuario, email, senha, sexo, tipo_usuario } = req.body;

    // Validação simples para garantir que os campos essenciais foram enviados
    if (!nome || !usuario || !email || !senha || !tipo_usuario) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        // Criptografa a senha para nunca salvar a senha original no banco de dados
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // Comando SQL para inserir os dados. Usamos $1, $2, etc., para previnir SQL Injection.
        const query = `
            INSERT INTO usuarios (nome_completo, nome_usuario, email, senha, sexo, tipo_usuario)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome_completo, nome_usuario, email, tipo_usuario;
        `;

        const values = [nome, usuario, email, senhaCriptografada, sexo, tipo_usuario];

        // Executa o comando no banco de dados
        const result = await pool.query(query, values);

        // Envia uma resposta de sucesso com os dados do usuário criado (sem a senha)
        res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error); // Log do erro no console do servidor

        // Verificamos se o erro é de violação de chave única (email ou usuário já existe)
        if (error.code === '23505') {
            return res.status(409).json({ error: 'O email ou nome de usuário já está em uso.' });
        }

        // Para qualquer outro erro, enviamos uma resposta de erro genérica
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    
})

// 5. Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});