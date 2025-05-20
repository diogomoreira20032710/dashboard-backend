const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false // Importante para a Render aceitar a ligação
  }
});

pool.connect()
  .then(() => console.log('🟢 Ligação à base de dados estabelecida com sucesso!'))
  .catch((err) => console.error('🔴 Erro ao ligar à base de dados:', err));

module.exports = pool;
