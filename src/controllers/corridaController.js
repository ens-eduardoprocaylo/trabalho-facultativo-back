const Corrida = require('../models/Corrida');

// Criar uma corrida
const criarCorrida = async (req, res) => {
  const { usuarioId, origem, destino, preco } = req.body;
  try {
    const corrida = await Corrida.create({ usuarioId, origem, destino, preco });
    res.status(201).json({ mensagem: 'Corrida criada com sucesso', corrida });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao criar corrida', erro });
  }
};

module.exports = { criarCorrida };
