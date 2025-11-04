const nodemailer = require('nodemailer');  // Para enviar o e-mail
const bcrypt = require('bcryptjs');  // Para criptografar a senha
const jwt = require('jsonwebtoken');  // Para criar tokens JWT
const Usuario = require('../models/Usuario');  // Seu modelo de usuário

// Função para enviar o link de recuperação de senha
const enviarRecuperacaoSenha = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ mensagem: 'Email é obrigatório' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Criar o token de recuperação (1 hora de validade)
    const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Aqui, vamos configurar o link para ser dinâmico e pegar a URL correta do frontend
    const urlFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    const linkRecuperacao = `${urlFrontend}/recuperar-senha/${token}`;

    // Configuração do Nodemailer para enviar o e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // E-mail de envio
        pass: process.env.EMAIL_PASS,  // Senha ou senha de aplicativo
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: usuario.email,
      subject: 'Recuperação de Senha',
      text: `Clique no link abaixo para redefinir sua senha:\n\n${linkRecuperacao}`,
    };

    // Enviar o e-mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ mensagem: 'E-mail de recuperação enviado com sucesso' });
  } catch (error) {
    console.error('[RECUPERAR-SENHA][ERRO]:', error);
    res.status(500).json({ mensagem: 'Erro ao enviar o e-mail de recuperação' });
  }
};

// Função para redefinir a senha
const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;

  if (!novaSenha) {
    return res.status(400).json({ mensagem: 'Nova senha é obrigatória' });
  }

  try {
    // Validar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findOne({ where: { id: decoded.usuarioId } });

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Verificar se a nova senha é válida (por exemplo, comprimento mínimo)
    if (novaSenha.length < 6) {
      return res.status(400).json({ mensagem: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    // Criptografar a nova senha e salvar no banco
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    usuario.senha = senhaCriptografada;
    await usuario.save();

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('[REDEFINIR-SENHA][ERRO]:', error);
    res.status(500).json({ mensagem: 'Erro ao redefinir a senha' });
  }
};

module.exports = { enviarRecuperacaoSenha, redefinirSenha };
