const { verifyToken } = require('../utils/jwt');

/**
 * Middleware para verificar JWT en header Authorization
 * Extrae el token, lo verifica y adjunta userId a req.user
 */
const verifyTokenMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token de autenticación no proporcionado'
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        message: 'Formato de token inválido. Use: Bearer TOKEN'
      });
    }

    const token = parts[1];

    // Verificar y decodificar el token
    const decoded = verifyToken(token);

    // Adjuntar información del usuario a la request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // Continuar con el siguiente middleware
    next();

  } catch (error) {
    // Manejar errores específicos de token
    if (error.message === 'Token expirado') {
      return res.status(401).json({
        message: 'Token expirado. Por favor, inicie sesión nuevamente'
      });
    }

    if (error.message === 'Token inválido') {
      return res.status(401).json({
        message: 'Token inválido'
      });
    }

    // Error genérico
    console.error('Error en verifyTokenMiddleware:', error);
    res.status(500).json({
      message: 'Error al verificar autenticación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  verifyToken: verifyTokenMiddleware
};

