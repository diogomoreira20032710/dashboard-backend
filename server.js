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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


app.use(cors());

app.use(express.json());



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
