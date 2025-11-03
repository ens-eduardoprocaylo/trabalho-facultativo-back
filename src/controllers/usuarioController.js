const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Função para registrar um novo usuário
const registrar = async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação de dados de entrada
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos' });
  }

  try {
    // Verifica se o e-mail já está em uso
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ mensagem: 'O e-mail já está em uso' });
    }

    // Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    // Cria o novo usuário no banco de dados
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
    });

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao registrar o usuário' });
  }
};

// Função para login de usuário
const login = async (req, res) => {
  const { email, senha } = req.body;

  // Verificação básica dos campos
  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos' });
  }

  try {
    // Verifica se o usuário existe no banco de dados
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    // Verifica se a senha fornecida corresponde à senha criptografada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha incorreta' });
    }

    // Gera um token JWT após a autenticação bem-sucedida
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // O token expira em 1 hora
    });

    res.status(200).json({ mensagem: 'Login bem-sucedido', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
};

module.exports = { registrar, login };
