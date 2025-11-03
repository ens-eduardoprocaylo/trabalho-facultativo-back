const { Sequelize } = require('sequelize');
require('dotenv').config();  // Carregar as variáveis de ambiente do arquivo .env

// Criação da instância do Sequelize para se conectar ao banco de dados
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres', // Utilizando o banco de dados PostgreSQL
});

// Testar a conexão com o banco de dados
sequelize.authenticate()
  .then(() => console.log('Conectado ao banco de dados com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

module.exports = sequelize;
