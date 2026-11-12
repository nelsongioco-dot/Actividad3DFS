const jwt = require('jsonwebtoken');
const { errorHttp } = require('./manejarErrores');

function autenticarToken(req, res, next) {
  const encabezado = req.headers.authorization;
  if (!encabezado) return next(errorHttp(401, 'Falta el token de autenticación'));
  const partes = encabezado.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
    return next(errorHttp(401, 'Usa el encabezado Authorization: Bearer <token>'));
  }
  try {
    req.usuarioAutenticado = jwt.verify(partes[1], process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    return next();
  } catch (error) {
    return next(errorHttp(403, 'Token inválido o expirado'));
  }
}

module.exports = autenticarToken;
