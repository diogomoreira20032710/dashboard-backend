const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const bcrypt = require('bcryptjs');
const verificarToken = require('../middlewares/verificarToken');

// PATCH /api/definicoes/nome
router.patch('/definicoes/nome', verificarToken, async (req, res) => {
  const userId = req.user.id;
  const { novoNome } = req.body;

  try {
    await pool.query(
      'UPDATE utilizadores SET nome = $1 WHERE id = $2',
      [novoNome, userId]
    );
    res.json({ message: 'Nome atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar nome:', err);
    res.status(500).json({ error: 'Erro ao atualizar nome.' });
  }
});

// ✅ Função para validar força da nova password
const validarPasswordForte = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,#^+=])[A-Za-z\d@$!%*?&.,#^+=]{9,}$/;
  return regex.test(password);
};

// PATCH /api/definicoes/password
router.patch('/definicoes/password', verificarToken, async (req, res) => {
  const userId = req.user.id;
  const { passwordAtual, novaPassword } = req.body;

  if (!validarPasswordForte(novaPassword)) {
    return res.status(400).json({
      error: 'A nova palavra-passe deve ter pelo menos 9 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.'
    });
  }

  try {
    const resultado = await pool.query('SELECT password_hash FROM utilizadores WHERE id = $1', [userId]);
    const passwordValida = await bcrypt.compare(passwordAtual, resultado.rows[0].password_hash);

    if (!passwordValida) {
      return res.status(400).json({ error: 'Palavra-passe atual incorreta.' });
    }

    const hash = await bcrypt.hash(novaPassword, 10);
    await pool.query('UPDATE utilizadores SET password_hash = $1 WHERE id = $2', [hash, userId]);

    res.json({ message: 'Palavra-passe atualizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar palavra-passe:', err);
    res.status(500).json({ error: 'Erro ao atualizar palavra-passe.' });
  }
});

module.exports = router;
