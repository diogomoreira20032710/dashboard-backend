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





// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost'],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true
}));


// Configuração de JSON
app.use(express.json());

// Definição de rotas
app.use('/api', authRoutes); // Certifique-se de que a rota "/api" está configurada corretamente
app.use('/api', equipamentosRoutes); // agora sim, organizado
app.use('/api', alteracoesRoutes);
app.use('/api', funcionariosRoutes);
app.use('/api', definicoesRoutes);
app.use('/api', utilizadorRoutes);
app.use('/api', anotacoesRoutes);


// Iniciar o servidor
app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
