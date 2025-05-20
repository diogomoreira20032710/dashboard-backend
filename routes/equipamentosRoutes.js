const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// POST /api/equipamentos - Adicionar novo equipamento
router.post('/equipamentos', async (req, res) => {
  console.log('[DEBUG] req.body:', req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Corpo da requisição vazio ou inválido" });
  }

  let {
    prd,
    tipo,
    marca_modelo,
    processador,
    memoria_ram,
    disco,
    data_aquisicao,
    garantia,
    observacoes,
    funcionario_id,
    estado = 'operacional'
  } = req.body;

  if (!prd || !tipo) {
    return res.status(400).json({ error: "Campos obrigatórios em falta: PRD e Tipo" });
  }

  // Se for telefone, ignorar campos técnicos
  if (tipo.toLowerCase() === 'telefone') {
    processador = null;
    memoria_ram = null;
    disco = null;
  }

  try {
    const result = await pool.query(
      `INSERT INTO equipamentos
        (prd, tipo, marca_modelo, processador, memoria_ram, disco, data_aquisicao, garantia, observacoes, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [prd, tipo, marca_modelo, processador, memoria_ram, disco, data_aquisicao, garantia, observacoes, estado]
    );

    const equipamento = result.rows[0];

    // Se existir funcionario_id, associar na tabela de ligação
    if (funcionario_id) {
      await pool.query(
        `INSERT INTO funcionarios_equipamentos (funcionario_id, equipamento_id, data_atribuicao)
         VALUES ($1, $2, CURRENT_DATE)`,
        [funcionario_id, equipamento.id]
      );
    }

    res.status(201).json({ message: 'Equipamento adicionado com sucesso!', equipamento });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao adicionar equipamento." });
  }
});

// GET /api/equipamentos - com nome do funcionário (último atribuído)
router.get('/equipamentos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        f.nome AS funcionario_nome
      FROM equipamentos e
      LEFT JOIN funcionarios_equipamentos fe ON fe.equipamento_id = e.id
      LEFT JOIN funcionarios f ON f.id = fe.funcionario_id
      ORDER BY e.id DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar equipamentos com funcionário:', err);
    res.status(500).json({ error: 'Erro ao buscar equipamentos.' });
  }
});


// PUT /api/equipamentos/:id - Atualizar equipamento
router.put('/equipamentos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    prd, tipo, marca_modelo, processador, memoria_ram,
    disco, data_aquisicao, garantia, observacoes, estado
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE equipamentos SET
        prd = $1,
        tipo = $2,
        marca_modelo = $3,
        processador = $4,
        memoria_ram = $5,
        disco = $6,
        data_aquisicao = $7,
        garantia = $8,
        observacoes = $9,
        estado = $10
       WHERE id = $11 RETURNING *`,
      [prd, tipo, marca_modelo, processador, memoria_ram, disco, data_aquisicao, garantia, observacoes, estado, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }

    res.json({ message: 'Equipamento atualizado com sucesso!', equipamento: result.rows[0] });
  } catch (err) {
    console.error("Erro ao atualizar equipamento:", err);
    res.status(500).json({ error: 'Erro ao atualizar equipamento.' });
  }
});

// DELETE /api/equipamentos/:id - Eliminar equipamento e ligações
router.delete('/equipamentos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM funcionarios_equipamentos WHERE equipamento_id = $1', [id]);
    const result = await pool.query('DELETE FROM equipamentos WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }

    res.json({ message: 'Equipamento eliminado com sucesso!', equipamento: result.rows[0] });
  } catch (err) {
    console.error("Erro ao eliminar equipamento:", err);
    res.status(500).json({ error: 'Erro ao eliminar equipamento.' });
  }
});

// GET /api/equipamentos/livres
router.get('/equipamentos/livres', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*
      FROM equipamentos e
      WHERE NOT EXISTS (
        SELECT 1 FROM funcionarios_equipamentos fe
        WHERE fe.equipamento_id = e.id
      )
      ORDER BY e.prd ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar equipamentos livres:', err);
    res.status(500).json({ error: 'Erro ao buscar equipamentos livres.' });
  }
});

// GET /api/equipamentos/stats
router.get('/equipamentos/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM equipamentos');
    const manutencao = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE estado = 'manutencao'`);

    res.json({
      total: parseInt(total.rows[0].count),
      em_manutencao: parseInt(manutencao.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter estatísticas.' });
  }
});

// GET /api/estatisticas
router.get('/estatisticas', async (req, res) => {
  try {
    const totalEquipamentos = await pool.query('SELECT COUNT(*) FROM equipamentos');
    const emManutencao = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE estado = 'manutencao'`);
    const desktops = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE tipo ILIKE 'desktop'`);
    const portateis = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE tipo ILIKE 'portátil' OR tipo ILIKE 'portatil'`);
    const funcionarios = await pool.query('SELECT COUNT(*) FROM funcionarios');

    const desktopsOp = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE tipo ILIKE 'desktop' AND estado = 'operacional'`);
    const desktopsMan = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE tipo ILIKE 'desktop' AND estado = 'manutencao'`);

    const portateisOp = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE (tipo ILIKE 'portátil' OR tipo ILIKE 'portatil') AND estado = 'operacional'`);
    const portateisMan = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE (tipo ILIKE 'portátil' OR tipo ILIKE 'portatil') AND estado = 'manutencao'`);

    const telefonesOp = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE tipo ILIKE 'telefone' AND estado = 'operacional'`);
    const telefonesMan = await pool.query(`SELECT COUNT(*) FROM equipamentos WHERE tipo ILIKE 'telefone' AND estado = 'manutencao'`);

    res.json({
      totalEquipamentos: parseInt(totalEquipamentos.rows[0].count),
      emManutencao: parseInt(emManutencao.rows[0].count),
      desktops: parseInt(desktops.rows[0].count),
      portateis: parseInt(portateis.rows[0].count),
      funcionarios: parseInt(funcionarios.rows[0].count),
      desktops_operacionais: parseInt(desktopsOp.rows[0].count),
      desktops_manutencao: parseInt(desktopsMan.rows[0].count),
      portateis_operacionais: parseInt(portateisOp.rows[0].count),
      portateis_manutencao: parseInt(portateisMan.rows[0].count),
      telefones_operacionais: parseInt(telefonesOp.rows[0].count),
      telefones_manutencao: parseInt(telefonesMan.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter estatísticas.' });
  }
});


module.exports = router;
