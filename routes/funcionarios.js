const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// POST /api/funcionarios - Adicionar funcionário
router.post('/funcionarios', async (req, res) => {
  const { nome, email, departamento, cargo } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO funcionarios (nome, email, departamento, cargo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, email, departamento, cargo]
    );

    res.status(201).json({
      message: "Funcionário adicionado com sucesso!",
      funcionario: result.rows[0]
    });
  } catch (err) {
    console.error("Erro ao adicionar funcionário:", err);
    res.status(500).json({ error: "Erro ao adicionar funcionário." });
  }
});

// GET /api/funcionarios - Listar todos
router.get('/funcionarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funcionarios ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar funcionários:", err);
    res.status(500).json({ error: "Erro ao buscar funcionários." });
  }
});

// GET /api/funcionarios-equipamentos - Todas as relações
router.get('/funcionarios-equipamentos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funcionarios_equipamentos');
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar relações funcionário-equipamento:", err);
    res.status(500).json({ error: "Erro ao buscar relações." });
  }
});

// DELETE /api/funcionarios/:id - Eliminar funcionário e associações
router.delete('/funcionarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM funcionarios_equipamentos WHERE funcionario_id = $1', [id]);
    const result = await pool.query('DELETE FROM funcionarios WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }

    res.json({ message: 'Funcionário eliminado com sucesso.' });
  } catch (err) {
    console.error("Erro ao eliminar funcionário:", err);
    res.status(500).json({ error: 'Erro ao eliminar funcionário.' });
  }
});

// PUT /api/funcionarios/:id - Atualizar funcionário
router.put('/funcionarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, departamento, cargo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE funcionarios
       SET nome = $1,
           email = $2,
           departamento = $3,
           cargo = $4
       WHERE id = $5
       RETURNING *`,
      [nome, email, departamento, cargo, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado." });
    }

    res.json({ message: "Funcionário atualizado com sucesso!", funcionario: result.rows[0] });
  } catch (err) {
    console.error("Erro ao atualizar funcionário:", err);
    res.status(500).json({ error: "Erro ao atualizar funcionário." });
  }
});

// GET /api/funcionarios/:id/equipamentos - Listar equipamentos associados
router.get('/funcionarios/:id/equipamentos', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT e.*
      FROM equipamentos e
      INNER JOIN funcionarios_equipamentos fe ON e.id = fe.equipamento_id
      WHERE fe.funcionario_id = $1
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar equipamentos do funcionário:", err);
    res.status(500).json({ error: "Erro ao buscar equipamentos." });
  }
});

// DELETE /api/funcionarios/:id/equipamentos/:equipamentoId - Desassociar equipamento
router.delete('/funcionarios/:id/equipamentos/:equipamentoId', async (req, res) => {
  const { id, equipamentoId } = req.params;
  try {
    await pool.query(`
      DELETE FROM funcionarios_equipamentos
      WHERE funcionario_id = $1 AND equipamento_id = $2
    `, [id, equipamentoId]);
    res.json({ message: "Equipamento desassociado com sucesso." });
  } catch (err) {
    console.error("Erro ao desassociar equipamento:", err);
    res.status(500).json({ error: "Erro ao desassociar equipamento." });
  }
});

// PUT /api/funcionarios/:id/equipamentos - Atualizar equipamentos (sem duplicar)
router.put('/funcionarios/:id/equipamentos', async (req, res) => {
  const { id } = req.params;
  const { equipamento_ids } = req.body;

  if (!Array.isArray(equipamento_ids)) {
    return res.status(400).json({ error: "equipamento_ids deve ser um array." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: usados } = await client.query(`
      SELECT equipamento_id FROM funcionarios_equipamentos
      WHERE equipamento_id = ANY($1::int[])
      AND funcionario_id != $2
    `, [equipamento_ids, id]);

    if (usados.length > 0) {
      const idsOcupados = usados.map(e => e.equipamento_id).join(', ');
      throw new Error(`Os seguintes equipamentos já estão atribuídos: ${idsOcupados}`);
    }

    await client.query('DELETE FROM funcionarios_equipamentos WHERE funcionario_id = $1', [id]);

    for (const equipamentoId of equipamento_ids) {
      await client.query(
        `INSERT INTO funcionarios_equipamentos (funcionario_id, equipamento_id, data_atribuicao)
         VALUES ($1, $2, CURRENT_DATE)`,
        [id, equipamentoId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: "Equipamentos atualizados com sucesso." });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erro ao atualizar equipamentos do funcionário:", err);
    res.status(400).json({ error: err.message || "Erro ao atualizar equipamentos." });
  } finally {
    client.release();
  }
});

module.exports = router;
