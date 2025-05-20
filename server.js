const express = require('express');
const app = express();
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const equipamentosRoutes = require('./routes/equipamentosRoutes');
const alteracoesRoutes = require('./routes/alteracoesRoutes');
const funcionariosRoutes = require('./routes/funcionarios');
const definicoesRoutes = require('./routes/definicoes');
const utilizadorRoutes = require('./routes/utilizador');
const anotacoesRoutes = require('./routes/anotacoesRoutes');

// Middleware para CORS - permite só o teu frontend autorizado
app.use(cors({
  origin: 'https://dashboard-frontend-five-beta.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsear JSON no corpo das requests
app.use(express.json());

// Definição das rotas API
app.use('/api', authRoutes);
app.use('/api', equipamentosRoutes);
app.use('/api', alteracoesRoutes);
app.use('/api', funcionariosRoutes);
app.use('/api', definicoesRoutes);
app.use('/api', utilizadorRoutes);
app.use('/api', anotacoesRoutes);

// Porta dinâmica para ambiente cloud (Render, Heroku, etc.) ou 3001 local
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
