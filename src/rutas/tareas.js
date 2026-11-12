const express = require('express');
const { leerJson, modificarJson } = require('../utilidades/archivos');
const { errorHttp } = require('../middlewares/manejarErrores');
const router = express.Router();

function validarCampos(body) {
  if (!body || typeof body.titulo !== 'string' || !body.titulo.trim() ||
      typeof body.descripcion !== 'string' || !body.descripcion.trim()) {
    throw errorHttp(400, 'titulo y descripcion son obligatorios y deben ser texto');
  }
  return { titulo: body.titulo.trim(), descripcion: body.descripcion.trim() };
}

// GET /tareas - leer todas las tareas
router.get('/', async (req, res, next) => {
  try {
    const tareas = await leerJson('tareas.json');
    if (!Array.isArray(tareas)) throw new Error('tareas.json debe ser un arreglo');
    res.json(tareas);
  } catch (error) { next(error); }
});

// POST /tareas - crear una tarea
router.post('/', async (req, res, next) => {
  try {
    const { titulo, descripcion } = validarCampos(req.body);
    const nueva = await modificarJson('tareas.json', (tareas) => {
      const id = tareas.reduce((max, tarea) => Math.max(max, Number(tarea.id) || 0), 0) + 1;
      const tarea = { id, titulo, descripcion, completada: false };
      tareas.push(tarea);
      return tarea;
    });
    console.log(`[CRUD] Tarea ${nueva.id} creada`);
    res.status(201).json(nueva);
  } catch (error) { next(error); }
});

// PUT /tareas/:id - actualizar una tarea existente
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw errorHttp(400, 'ID de tarea inválido');
    const { titulo, descripcion } = validarCampos(req.body);
    if (req.body.completada !== undefined && typeof req.body.completada !== 'boolean') {
      throw errorHttp(400, 'completada debe ser true o false');
    }
    const actualizada = await modificarJson('tareas.json', (tareas) => {
      const tarea = tareas.find((item) => item.id === id);
      if (!tarea) throw errorHttp(404, 'La tarea no existe');
      tarea.titulo = titulo;
      tarea.descripcion = descripcion;
      if (req.body.completada !== undefined) tarea.completada = req.body.completada;
      return tarea;
    });
    console.log(`[CRUD] Tarea ${id} actualizada`);
    res.json(actualizada);
  } catch (error) { next(error); }
});

// DELETE /tareas/:id - eliminar una tarea
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw errorHttp(400, 'ID de tarea inválido');
    const resultado = await modificarJson('tareas.json', (tareas) => {
      const indice = tareas.findIndex((item) => item.id === id);
      if (indice < 0) throw errorHttp(404, 'La tarea no existe');
      const [eliminada] = tareas.splice(indice, 1);
      return eliminada;
    });
    console.log(`[CRUD] Tarea ${id} eliminada`);
    res.json({ mensaje: 'Tarea eliminada', tarea: resultado });
  } catch (error) { next(error); }
});

module.exports = router;
