// Creacion de errores HTTP.
function errorHttp(estado, mensaje) {
  const error = new Error(mensaje);
  error.estado = estado;
  return error;
}

// Rutas no definidas.
function rutaNoEncontrada(req, res, next) {
  next(errorHttp(404, `La ruta ${req.method} ${req.originalUrl} no existe`));
}

// Middleware global de errores.
function manejarErrores(err, req, res, next) {
  const estado = err.estado || err.status || 500;
  // Registro de errores sin credenciales.
  console.error(`[ERROR] ${req.method} ${req.path} -> ${estado}: ${err.message}`);
  if (estado >= 500) console.error(err.stack);
  const mensaje = estado >= 500 ? 'Error interno del servidor' : err.message;
  res.status(estado).json({ error: mensaje });
}

module.exports = { errorHttp, rutaNoEncontrada, manejarErrores };
