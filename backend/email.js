const nodemailer = require('nodemailer');

// 1. Configurar o "transportador" de e-email

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_HOST,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// 2. Criar a função que envia o e-mail
async function enviarEmailVerificacao(destinatario, token) {
    console.log(`Preparando para enviar email para ${destinatario} com o token ${token}`);

    // O link de verificação que o usuário irá clicar
    const urlVerificacao = `http://localhost:3000/verificar?token=${token}`;

    // 3. Definir o conteúdo do e-mail
    const mailOptions = {
        from:`"AKADEMIA" <${process.env.SENDER_EMAIL}>`,
        to: destinatario,
        subject: 'Bem-vindo(a)! Ative sua Conta na AKADEMIA CPS',
        html: `
        <h1>Bem-Vindo(a) à nossa plataforma!</h1>
        <p>Obrigado por se cadastrar. Por favor, clique no link abaixo para ativar sua conta:</p>
        <a href="${urlVerificacao}"style="background-color: #027A8A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ativar Minha Conta</a>
        <p>Se você não se cadastrou, por favor, ignore este e-mail.</p>`
    };

    // 4. Enviar o e-mail
    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de verificação enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar e-mail de verificação:', error);
    }
}

// 5. Exportar a função para que ela possa ser usada no server.js
module.exports = { enviarEmailVerificacao };