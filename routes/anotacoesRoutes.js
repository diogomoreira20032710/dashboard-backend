const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // ligação ao PostgreSQL

// POST /api/anotacoes → Adicionar nova anotação
router.post('/anotacoes', async (req, res) => {
  const { funcionario_id, texto } = req.body;

  if (!funcionario_id || !texto) {
    return res.status(400).json({ error: 'Funcionário e texto são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO anotacoes (funcionario_id, texto) VALUES ($1, $2) RETURNING *`,
      [funcionario_id, texto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar anotação:', err);
    res.status(500).json({ error: 'Erro ao adicionar anotação.' });
  }
});

// GET /api/anotacoes/funcionario/:id → Buscar anotações de um funcionário
router.get('/anotacoes/funcionario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM anotacoes WHERE funcionario_id = $1 ORDER BY data DESC`,
      [id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar anotações:', err);
    res.status(500).json({ error: 'Erro ao buscar anotações.' });
  }
})
// DELETE /api/anotacoes/:id → Eliminar anotação por ID
router.delete('/anotacoes/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM anotacoes WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Anotação não encontrada.' });
      }
  
      res.json({ message: 'Anotação removida com sucesso!' });
    } catch (err) {
      console.error('Erro ao eliminar anotação:', err);
      res.status(500).json({ error: 'Erro ao eliminar anotação.' });
    }
  });
  
module.exports = router;
