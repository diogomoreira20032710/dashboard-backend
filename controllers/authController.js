const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models/db');

// Validação de segurança da palavra-passe
const validarPasswordSegura = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/;
  return regex.test(password);
};

// Função de registro de usuário (Registo)
const registar = async (req, res) => {
  const { nome, email, password, tipo } = req.body;

  if (!nome || !email || !password || !tipo) {
    return res.status(400).json({ msg: 'Todos os campos são obrigatórios.' });
  }

  if (!validarPasswordSegura(password)) {
    return res.status(400).json({
      msg: 'A palavra-passe deve ter pelo menos 9 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.'
    });
  }

  try {
    const result = await db.query('SELECT * FROM utilizadores WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user) {
      return res.status(400).json({ msg: 'Email já está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO utilizadores (nome, email, password_hash, tipo) VALUES ($1, $2, $3, $4)',
      [nome, email, hashedPassword, tipo]
    );

    res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao registrar o usuário.' });
  }
};

// Função de login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await db.query('SELECT * FROM utilizadores WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ msg: 'Email ou senha inválidos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ msg: 'Login bem-sucedido!', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao tentar realizar o login.' });
  }
};

// Função de recuperação de senha
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Por favor, forneça um e-mail.' });
  }

  try {
    const result = await db.query('SELECT * FROM utilizadores WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'diogomoreira046@gmail.com',
        pass: 'bhdb pzaf fhuo jdvl'
      }
    });

    const mailOptions = {
      from: 'diogomoreira046@gmail.com',
      to: email,
      subject: 'Recuperação de Senha',
      text: `Clique no link abaixo para redefinir sua senha:\n\nhttp://localhost/reset-password/${token}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: 'Um link de recuperação foi enviado para o seu e-mail.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao tentar enviar o e-mail.' });
  }
};

// Função para redefinir a senha
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ msg: 'Por favor, insira uma nova senha.' });
  }

  if (!validarPasswordSegura(newPassword)) {
    return res.status(400).json({
      msg: 'A nova palavra-passe deve ter pelo menos 9 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query('SELECT * FROM utilizadores WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE utilizadores SET password_hash = $1 WHERE id = $2', [hashedPassword, user.id]);

    res.status(200).json({ msg: 'Senha alterada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao redefinir a senha.' });
  }
};

module.exports = {
  registar,
  login,
  forgotPassword,
  resetPassword
};
