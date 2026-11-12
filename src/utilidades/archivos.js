const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// No usamos readFileSync ni writeFileSync en las peticiones.
async function leerJson(nombreArchivo) {
  const ruta = path.resolve(__dirname, '..', '..', nombreArchivo);
  try {
    const contenido = await fs.readFile(ruta, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

// Cada actualización espera la anterior: evita perder datos si llegan
// solicitudes casi al mismo tiempo. El archivo temporal se reemplaza al final.
const colas = new Map();
function modificarJson(nombreArchivo, actualizar) {
  const anterior = colas.get(nombreArchivo) || Promise.resolve();
  const operacion = anterior.catch(() => {}).then(async () => {
    const datos = await leerJson(nombreArchivo);
    if (!Array.isArray(datos)) throw new Error(`${nombreArchivo} debe contener un arreglo JSON`);
    const resultado = await actualizar(datos);
    const ruta = path.resolve(__dirname, '..', '..', nombreArchivo);
    const temporal = `${ruta}.${process.pid}.${crypto.randomUUID()}.tmp`;
    try {
      await fs.writeFile(temporal, JSON.stringify(datos, null, 2) + '\n', 'utf8');
      await fs.rename(temporal, ruta);
    } finally {
      await fs.unlink(temporal).catch(() => {});
    }
    return resultado;
  });
  colas.set(nombreArchivo, operacion.catch(() => {}));
  return operacion;
}

module.exports = { leerJson, modificarJson };
