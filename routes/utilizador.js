const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const verificarToken = require('../middlewares/verificarToken');

router.get('/utilizador', verificarToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT nome FROM utilizadores WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    res.json({ nome: result.rows[0].nome });
  } catch (err) {
    console.error('Erro ao obter utilizador:', err);
    res.status(500).json({ error: 'Erro ao obter utilizador.' });
  }
});

module.exports = router;
