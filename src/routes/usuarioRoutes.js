const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');  // Modelo Sequelize
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = router;
