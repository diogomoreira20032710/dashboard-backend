const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // ligação ao PostgreSQL

// Rota POST para adicionar alteração
router.post('/alteracoes', async (req, res) => {
  const { equipamento_id, data, descricao } = req.body;

  if (!equipamento_id || !data || !descricao) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO alteracoes (equipamento_id, data, descricao)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [equipamento_id, data, descricao]
    );

    res.status(201).json({ message: 'Alteração adicionada com sucesso!', alteracao: result.rows[0] });
  } catch (err) {
    console.error('[ERRO] ao adicionar alteração:', err);
    res.status(500).json({ error: 'Erro ao adicionar alteração.' });
  }
})

// GET /api/alteracoes/equipamento/:id → listar alterações de um equipamento
router.get('/alteracoes/equipamento/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT * FROM alteracoes WHERE equipamento_id = $1 ORDER BY data DESC`,
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao buscar alterações do equipamento.' });
    }
  });
  
// DELETE /api/alteracoes/:id - Remover uma alteração específica
router.delete('/alteracoes/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM alteracoes WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Alteração não encontrada.' });
      }
  
      res.json({ message: 'Alteração removida com sucesso!', alteracao: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao remover alteração.' });
    }
  })

  // GET /api/alteracoes/recentes - Últimas alterações para o dashboard
router.get('/alteracoes/recentes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.descricao, a.data, e.prd
      FROM alteracoes a
      JOIN equipamentos e ON a.equipamento_id = e.id
      ORDER BY a.data DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar alterações recentes:', err);
    res.status(500).json({ error: 'Erro ao buscar alterações recentes.' });
  }
});

  
module.exports = router;
