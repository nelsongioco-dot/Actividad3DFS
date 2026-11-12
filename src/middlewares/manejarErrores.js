// Construye errores con un código HTTP entendible para el cliente.
function errorHttp(estado, mensaje) {
  const error = new Error(mensaje);
  error.estado = estado;
  return error;
}

// Maneja URLs inexistentes, por ejemplo GET /no-existe.
function rutaNoEncontrada(req, res, next) {
  next(errorHttp(404, `La ruta ${req.method} ${req.originalUrl} no existe`));
}

// Express reconoce un middleware de error porque tiene cuatro parámetros.
function manejarErrores(err, req, res, next) {
  const estado = err.estado || err.status || 500;
  // Log para diagnosticar fallas, sin imprimir tokens ni contraseñas.
  console.error(`[ERROR] ${req.method} ${req.path} -> ${estado}: ${err.message}`);
  if (estado >= 500) console.error(err.stack);
  const mensaje = estado >= 500 ? 'Error interno del servidor' : err.message;
  res.status(estado).json({ error: mensaje });
}

module.exports = { errorHttp, rutaNoEncontrada, manejarErrores };
