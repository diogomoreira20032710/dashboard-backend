const express = require('express');
const router = express.Router();
const { registar, login, forgotPassword, resetPassword } = require('../controllers/authController'); // Importa as funções do controlador

// Rota de registo
router.post('/register', (req, res) => {
  console.log('[DEBUG] Rota /register chamada');
  console.log('[DEBUG] Dados:', req.body);
  registar(req, res);  // Chama a função de registro
});

// Rota de login
router.post('/login', (req, res) => {
  console.log('[DEBUG] Rota /login chamada');
  console.log('[DEBUG] Dados:', req.body);
  login(req, res);  // Chama a função de login
});

// Rota de recuperação de senha (Forgot Password)
router.post('/forgot-password', (req, res, next) => {
  console.log('[DEBUG] Rota /forgot-password chamada');
  console.log('[DEBUG] Dados:', req.body);
  next();  // Passa para a próxima função que é a função de recuperação de senha
}, forgotPassword);

// Rota para redefinir a senha (Reset Password)
router.post('/reset-password', (req, res, next) => {
  console.log('[DEBUG] Rota /reset-password chamada');
  console.log('[DEBUG] Dados:', req.body);
  next();  // Passa para a próxima função de redefinir senha
}, resetPassword); // Função para redefinir a senha


module.exports = router;  // Exporta o roteador para ser utilizado na aplicação
