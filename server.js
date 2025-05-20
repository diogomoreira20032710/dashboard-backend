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
const allowedOrigins = [
  'https://dashboard-frontend-five-beta.vercel.app',
  'https://dashboard-frontend-git-main-digonopereira.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  console.log('Servidor rodando em ${API_URL}');
});
