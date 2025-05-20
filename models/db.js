const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'inventario',
  password: process.env.DB_PASSWORD || '1234',
  port: Number(process.env.DB_PORT || 5432), // Aqui estava 3001 → corrigido para 5432
});

pool.connect()
  .then(() => console.log('🟢 Ligação à base de dados estabelecida com sucesso!'))
  .catch((err) => console.error('🔴 Erro ao ligar à base de dados:', err));

module.exports = pool;
