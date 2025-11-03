const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const usuarioRoutes = require('./routes/usuarioRoutes');
const corridaRoutes = require('./routes/corridaRoutes');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/corridas', corridaRoutes);

// Rota para a raiz ("/")
app.get('/', (req, res) => {
  res.send('Bem-vindo à API Sinop Drivers!');
});

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados!');
  } catch (erro) {
    console.error('Erro ao conectar ao banco de dados:', erro);
  }

  console.log(`Servidor rodando na porta ${port}`);
});
