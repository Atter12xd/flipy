/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * Debe ejecutarse después del middleware verifyToken
 * 
 * @param {Array<string>} allowedRoles - Array de roles permitidos ['MOTORIZADO', 'TIENDA', 'ADMIN']
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado (debe existir req.user del middleware anterior)
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que el rol del usuario esté en la lista de roles permitidos
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'No tienes permisos para acceder a este recurso',
          requiredRoles: allowedRoles,
          currentRole: req.user.role
        });
      }

      // Usuario tiene el rol necesario, continuar
      next();

    } catch (error) {
      console.error('Error en requireRole:', error);
      res.status(500).json({
        message: 'Error al verificar permisos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = {
  requireRole
};

