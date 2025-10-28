const { verifyToken } = require('../utils/jwt');

/**
 * Middleware para verificar JWT en header Authorization
 * Extrae el token, lo verifica y adjunta userId a req.user
 */
const verifyTokenMiddleware = (req, res, next) => {
  try {
    // BUG FIX 1: Debug logging para multipart/form-data
    console.log('[DEBUG AUTH] Content-Type:', req.headers['content-type']);
    console.log('[DEBUG AUTH] Authorization header:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');
    
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.error('[DEBUG AUTH] ❌ Token no proporcionado');
      return res.status(401).json({
        message: 'Token de autenticación no proporcionado'
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.error('[DEBUG AUTH] ❌ Formato de token inválido');
      return res.status(401).json({
        message: 'Formato de token inválido. Use: Bearer TOKEN'
      });
    }

    const token = parts[1];
    console.log('[DEBUG AUTH] ✅ Token recibido:', token.substring(0, 20) + '...');

    // Verificar y decodificar el token
    const decoded = verifyToken(token);

    // Adjuntar información del usuario a la request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    console.log('[DEBUG AUTH] ✅ Usuario autenticado:', decoded.email, `(${decoded.role})`);

    // Continuar con el siguiente middleware
    next();

  } catch (error) {
    // Manejar errores específicos de token
    if (error.message === 'Token expirado') {
      console.error('[DEBUG AUTH] ❌ Token expirado');
      return res.status(401).json({
        message: 'Token expirado. Por favor, inicie sesión nuevamente'
      });
    }

    if (error.message === 'Token inválido') {
      console.error('[DEBUG AUTH] ❌ Token inválido');
      return res.status(401).json({
        message: 'Token inválido'
      });
    }

    // Error genérico
    console.error('[DEBUG AUTH] ❌ Error en verifyTokenMiddleware:', error);
    res.status(500).json({
      message: 'Error al verificar autenticación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  verifyToken: verifyTokenMiddleware
};

