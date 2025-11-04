const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');  // Modelo Sequelize
const bcrypt = require('bcryptjs');  // Para criptografar a senha
const jwt = require('jsonwebtoken');  // Para criar o token de recuperação
const nodemailer = require('nodemailer');  // Para envio de e-mails

// Normaliza email (minúsculas e trim)
const normalizeEmail = (email) => (email || '').toString().trim().toLowerCase();

// Rota para registrar um novo usuário
router.post('/registrar', async (req, res) => {
  try {
    let { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos' });
    }

    email = normalizeEmail(email);

    // ✅ Sequelize: use WHERE corretamente
    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ mensagem: 'O e-mail já está em uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    await Usuario.create({ nome, email, senha: senhaCriptografada });

    return res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error('[REGISTRAR][ERRO]:', err);
    return res.status(500).json({ mensagem: 'Erro ao registrar o usuário' });
  }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
  try {
    let { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos' });
    }

    email = normalizeEmail(email);
    console.log('[LOGIN] Email recebido:', email);

    // ✅ Sequelize: use WHERE corretamente
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      console.log('[LOGIN] Usuário não encontrado para:', email);
      return res.status(400).json({ mensagem: 'Email ou senha incorretos' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      console.log('[LOGIN] Senha incorreta para:', email);
      return res.status(400).json({ mensagem: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ mensagem: 'Login bem-sucedido', token });
  } catch (err) {
    console.error('[LOGIN][ERRO]:', err);
    return res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
});

// Rota para recuperação de senha
router.post('/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ mensagem: 'Email é obrigatório' });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Criar token de recuperação (com validade de 1 hora)
    const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Configuração do Nodemailer para enviar o e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Serviço de e-mail (pode ser outro, como Outlook, se necessário)
      auth: {
        user: process.env.EMAIL_USER,  // E-mail de envio (deve vir do .env)
        pass: process.env.EMAIL_PASS,  // Senha de e-mail ou senha de aplicativo (do .env)
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,  // Remetente (do .env)
      to: usuario.email,  // Destinatário
      subject: 'Recuperação de Senha',
      text: `Clique no link abaixo para redefinir sua senha:\n\nhttp://localhost:5173/resetar-senha/${token}`,  // Link de recuperação
    };

    // Enviar o e-mail
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ mensagem: 'E-mail de recuperação enviado com sucesso' });
  } catch (error) {
    console.error('[RECUPERAR-SENHA][ERRO]:', error);
    return res.status(500).json({ mensagem: 'Erro ao enviar e-mail de recuperação' });
  }
});

// Rota para redefinir a senha
router.post('/resetar-senha', async (req, res) => {
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

    // Criptografar a nova senha e salvar no banco
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    usuario.senha = senhaCriptografada;
    await usuario.save();

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('[REDEFINIR-SENHA][ERRO]:', error);
    res.status(500).json({ mensagem: 'Erro ao redefinir a senha' });
  }
});

module.exports = router;
