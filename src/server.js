require('dotenv').config();  // Carregar variáveis de ambiente

const express = require('express');
const cors = require('cors');  // Adicionando a importação do cors
const sequelize = require('./config/database');
const usuarioRoutes = require('./routes/usuarioRoutes');

// Configurações do CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Porta onde seu React está rodando
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type',
};

const app = express();
const port = 5000;

// Usando o CORS com as configurações definidas
app.use(cors(corsOptions));
app.use(express.json());

// Rotas da API
app.use('/api/usuarios', usuarioRoutes);  // As rotas de usuário devem começar com '/api/usuarios'
app.use('/api/corridas', corridaRoutes);

// Rota para a raiz ("/")
app.get('/', (req, res) => {
  res.send('Bem-vindo à API Sinop Drivers!');
});

// Iniciar o servidor e conectar ao banco de dados
app.listen(port, async () => {
  try {
    // Autenticando a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados!');
  } catch (erro) {
    console.error('Erro ao conectar ao banco de dados:', erro);
  }

  console.log(`Servidor rodando na porta ${port}`);
});
