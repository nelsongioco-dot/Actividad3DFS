require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const autenticarToken = require('./src/middlewares/autenticarToken');
const rutasAuth = require('./src/rutas/auth');
const rutasTareas = require('./src/rutas/tareas');
const { rutaNoEncontrada, manejarErrores } = require('./src/middlewares/manejarErrores');

const app = express();
const PORT = Number(process.env.PORT || 3000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERROR: primero crea un archivo .env con JWT_SECRET de al menos 32 caracteres.');
  process.exit(1);
}

// Middleware para interpretar el cuerpo JSON antes de las rutas.
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => res.json({ mensaje: 'API de tareas activa', puerto: PORT }));
app.use(rutasAuth);                     // POST /register y POST /login
app.use('/tareas', autenticarToken, rutasTareas); // CRUD protegido por JWT

// Estos dos middlewares deben ir al final.
app.use(rutaNoEncontrada);
app.use(manejarErrores);

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
