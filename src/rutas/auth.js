const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { leerJson, modificarJson } = require('../utilidades/archivos');
const { errorHttp } = require('../middlewares/manejarErrores');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { usuario, password } = req.body || {};
    if (typeof usuario !== 'string' || usuario.trim().length < 3 ||
        typeof password !== 'string' || password.length < 8) {
      throw errorHttp(400, 'Envía usuario (mínimo 3 caracteres) y password (mínimo 8 caracteres)');
    }
    const nombre = usuario.trim();
    // Hash asíncrono: nunca guardamos la contraseña original.
    const passwordHash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await modificarJson('usuarios.json', (usuarios) => {
      if (usuarios.some((u) => u.usuario.toLowerCase() === nombre.toLowerCase())) {
        throw errorHttp(409, 'Ese usuario ya está registrado');
      }
      const nuevo = { id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8), usuario: nombre, passwordHash };
      usuarios.push(nuevo);
      return { id: nuevo.id, usuario: nuevo.usuario };
    });
    console.log('[AUTH] Usuario registrado:', nuevoUsuario.usuario);
    res.status(201).json({ mensaje: 'Usuario registrado', usuario: nuevoUsuario });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { usuario, password } = req.body || {};
    if (typeof usuario !== 'string' || typeof password !== 'string') {
      throw errorHttp(400, 'Debes enviar usuario y password');
    }
    const usuarios = await leerJson('usuarios.json');
    if (!Array.isArray(usuarios)) throw new Error('usuarios.json debe ser un arreglo');
    const encontrado = usuarios.find((u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase());
    if (!encontrado || !(await bcrypt.compare(password, encontrado.passwordHash))) {
      throw errorHttp(401, 'Credenciales incorrectas');
    }
    const token = jwt.sign({ sub: encontrado.id, usuario: encontrado.usuario }, process.env.JWT_SECRET, {
      algorithm: 'HS256', expiresIn: '1h'
    });
    console.log('[AUTH] Inicio de sesión correcto:', encontrado.usuario);
    res.json({ mensaje: 'Inicio de sesión correcto', token, tipo: 'Bearer', expiresIn: '1h' });
  } catch (error) { next(error); }
});

module.exports = router;
