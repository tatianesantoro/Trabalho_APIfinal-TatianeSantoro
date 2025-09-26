const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET = 'segredo_super_secreto';
const users = [
    { username: 'tatiane', password: '4321' }
];


// Rota POST tradicional
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Rota GET via query string para autenticação
app.get('/login-query', (req, res) => {
  const { username, password } = req.query;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).send('Credenciais inválidas');
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.send(`Token: ${token}`);
});

// Rota GET para autenticar token via query string
app.get('/autenticar-token', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(401).send('Token não fornecido');
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).send('Token inválido');
    res.send(`Sucesso! Usuário autenticado: ${user.username}`);
  });
});

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

app.get('/protegido', autenticar, (req, res) => {
  res.json({ mensagem: `Olá, ${req.user.username}! Você acessou uma rota protegida.` });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
}

module.exports = app;
