// 1. Importação das bibliotecas
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { enviarEmailVerificacao } = require('./email');

// 2. Configuração do Servidor e Conexão com o Banco
const app = express();
const PORT = process.env.API_PORT || 3001;
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Define a pasta de destino
    },
    filename: function (req, file, cb) {
        // Cria um nome de arquivo único para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware de Autenticação JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido ou expirado.'});
    }
}

// Endpoint de Cadastro
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
    if (!email || !senha) { return res.status(400).json({ error: 'Email e senha são obrigatórios.' }); }
    try {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const result = await pool.query(query, [email]);
        if (result.rows.length === 0) { return res.status(401).json({ error: 'Credenciais inválidas.' });}
        const user = result.rows[0];
        if (user.status !== 'ATIVO') { return res.status(403).json({ error: 'Sua conta ainda não foi ativada. Por favor, verifique seu e-mail.' });}
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) { return res.status(401).json({ error: 'Credenciais inválidas.' });}
        
        const payload = { id: user.id, funcao: user.funcao };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        
        delete user.senha;
        res.status(200).json({ message: 'Login bem-sucedido!', user: user, token: token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

app.get('/api/verificar', async (req, res) => {
    const { token } = req.query;
    if (!token) {return res.status(400).json({ message: 'Token de verificação não fornecido.' });}
    try {
        const query = 'SELECT * FROM usuarios WHERE token_verificacao = $1';
        const result = await pool.query(query, [token]);
        if (result.rows.length === 0) { return res.status(404).json({ message: 'Token inválido ou não encontrado.' });}
        const user = result.rows[0];
        const agora = new Date();
        if (agora > user.token_expiracao) { return res.status(400).json({ message: 'Seu token de verificação expirou.' });}
        const updateQuery = `UPDATE usuarios SET status = 'ATIVO', token_verificacao = NULL, token_expiracao = NULL WHERE id = $1;`;
        await pool.query(updateQuery, [user.id]);
        res.status(200).json({ message: 'Conta ativada com sucesso! Você já pode fazer login.' });
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
});

app.post('/api/publicacoes', verificarToken, async (req,res) => {
    const { conteudo, imagem_url } = req.body;
    const usuario_id = req.user.id;


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

app.get('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params; 

    try {

        const query = `SELECT id, nome_completo, nome_usuario, foto_perfil, funcao, data_criacao, habilidades FROM usuarios WHERE id = $1 AND status = 'ATIVO'`;

        const result = await pool.query(query, [id]);

        // Se a busca não retornar nenhuma linha, o usuário não existe
        if (result.rows.length === 0 ) {
            return res.status(404).json({ error: 'Usuário não encontrado ou não está ativo'})
        }

        // Se encontrarmos o usuário, retornamos o primeiro (e único) resultado
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(`Erro ao buscar usuário com ID ${id}:`, error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.'});
    }
});

app.put('/api/usuarios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { habilidades } = req.body


    // 1. Verificação de Segurança
    if (req.user.id !== parseInt(id, 10)) {
        return res.status(403).json({ error: 'Acesso negado. Você só pode editar seu próprio perfil.'});
    }

    try {
        const query = `UPDATE usuarios SET habilidades = $1 WHERE id = $2 RETURNING id, nome_completo, habilidades;`;
        const values = [habilidades, id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.'})
        }

        res.status(200).json ({
            message: 'Perfil atualizado com sucesso!',
            user: result.rows[0]
        });

    } catch (error) {
        console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.'});
    }
});

// ================== ENDPOINT PARA CRIAR UM NOVO PROJETO ==================
app.post('/api/projetos', verificarToken, async (req, res) => {
    // Pegamos o ID do usuário diretamente do token JWT verificado.
    const usuario_id = req.user.id;

    // Pegamos os dados do projeto do corpo da requisição.
    const { titulo, descricao, imagem_url, link_repositorio, link_producao } = req.body;

    // Validação simples para garantir que o projeto tenha pelo menos um título.
    if (!titulo) {
        return res.status(400).json({ error: 'O título do projeto é obrigatório.' });
    }

    try {
        const query = `
            INSERT INTO projetos (usuario_id, titulo, descricao, imagem_url, link_repositorio, link_producao)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            usuario_id,
            titulo,
            descricao || null,
            imagem_url || null,
            link_repositorio || null,
            link_producao || null
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Projeto adicionado com sucesso!',
            projeto: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

// ================== ENDPOINT PARA BUSCAR OS PROJETOS DE UM USUÁRIO ==================
app.get('/api/usuarios/:id/projetos', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT * FROM projetos 
            WHERE usuario_id = $1 
            ORDER BY data_criacao DESC;
        `;

        const result = await pool.query(query, [id]);

        // É normal um usuário não ter projetos, então retornamos um array vazio sem erro.
        res.status(200).json(result.rows);

    } catch (error) {
        console.error(`Erro ao buscar projetos do usuário com ID ${id}:`, error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

app.post('/api/usuarios/:id/foto', verificarToken, upload.single('foto_perfil'), async (req, res) => {
    const { id } = req.params;

    // Verificação de Segurança
    if (req.user.id !== parseInt(id, 10)) {
        return res.status(403).json({ error: 'Acesso negado.'});
    }

    // Se o multer não encontrar um arquivo, ele dará um erro
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.'});
    }

    try {
        // O Multer já salvou o arquivo. Agora, salvar o nome do arquivo
        const nomeArquivo = req.file.filename;
        const query = 'UPDATE usuarios SET foto_perfil = $1 WHERE id = $2 RETURNING foto_perfil';
        const result = await pool.query(query, [nomeArquivo, id]);

        res.status(200).json({
            message: 'Foto de perfil atualizada com sucesso!',
            foto_perfil: result.rows[0].foto_perfil
        });

    } catch (error) {
        console.error('Erro ao atualizar foto de perfil:', error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor'});
    }
});

app.delete('/api/projetos/:id', verificarToken, async (req, res) => {
    const projetoId = req.params.id;
    const usuarioLogadoId = req.user.id;

    try {
        // 1. Antes de apagar, buscamos o projeto para descobrir quem é o dono.
        const projetoQuery = 'SELECT usuario_id FROM projetos WHERE id = $1';
        const projetoResult = await pool.query(projetoQuery, [projetoId]);

        if (projetoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Projeto não encontrado.' });
        }

        const donoDoProjetoId = projetoResult.rows[0].usuario_id;

        // 2. Verificação de Segurança: O ID do usuário logado (do token) é o mesmo do dono do projeto?
        if (donoDoProjetoId !== usuarioLogadoId) {
            return res.status(403).json({ error: 'Acesso negado. Você não é o dono deste projeto.' });
        }

        // 3. Se a verificação passar, apagamos o projeto
        const deleteQuery = 'DELETE FROM projetos WHERE id = $1';
        await pool.query(deleteQuery, [projetoId]);

        res.status(200).json({ message: 'Projeto apagado com sucesso!' });

    } catch (error) {
        console.error(`Erro ao apagar o projeto ID ${projetoId}:`, error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

app.get('/api/projetos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM projetos WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Projeto não encontrado.'});
        }

        res.status(200).json(result.rows[0]);

    } catch (error){
        console.error(`Erro ao buscar projeto com ID ${id}:`, error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.'});
    }
})

app.put('/api/projetos/:id', verificarToken, async (req, res) => {
    const projetoId = req.params.id;
    const usuarioLogadoId = req.user.id;
    const { titulo, descricao, link_repositorio, link_producao } = req.body;

    try {
        // 1. Verificação de Segurança
        const projetoQuery = 'SELECT usuario id FROM projetos WHERE id = $1';
        const projetoResult = await pool.query(projetoQuery, [projetoId]);

        if (projetoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Projeto não encontrado.'});
        }
        if (projetoResult.rows[0].usuario_id !== usuarioLogadoId) {
            return res.status(403).json({ error: 'Acesso negado.'});
        }

        // 2. Se a verificação passar, atualiza o projeto.
        const updateQuery = `UPDATE projetos SET titulo = $1, descricao = $2, link_repositorio = $3, link_producao = $4 WHERE id = $5 RETURNING *;`;

        const values = [titulo, descricao, link_repositorio, link_producao, projetoId];
        const result = await pool.query(updateQuery, values);

        res.status(200).json({
            message: 'Projeto atualizado com sucesso!',
            projeto: result.rows[0]
        });

    } catch(error) {
        console.error(`Erro ao atualizar projeto com ID ${projetoID}:`, error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.'});
    }
});



// 5. Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});