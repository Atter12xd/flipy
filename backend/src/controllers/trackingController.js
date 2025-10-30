const prisma = require('../config/prisma');
const notificacionService = require('../services/notificacionService');

/**
 * Actualizar ubicación del motorizado durante entrega
 * POST /api/tracking/:envioId/ubicacion
 * Requiere: MOTORIZADO (asignado al envío)
 */
const updateUbicacion = async (req, res) => {
  try {
    const { envioId } = req.params;
    const { lat, lng } = req.body;

    // Validar que el usuario sea MOTORIZADO
    if (req.user.role !== 'MOTORIZADO') {
      return res.status(403).json({
        success: false,
        message: 'Solo los motorizados pueden actualizar ubicación'
      });
    }

    // Validar datos requeridos
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitud y longitud son requeridas'
      });
    }

    // Validar coordenadas válidas
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas inválidas'
      });
    }

    // Obtener motorizado
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId: req.user.userId }
    });

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    // Obtener envío
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
      include: {
        ofertas: {
          where: {
            motorizadoId: motorizado.id,
            aceptada: true
          }
        }
      }
    });

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    // Validar que el motorizado tiene este envío asignado
    if (envio.ofertas.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este envío'
      });
    }

    // Validar que el envío esté en estado EN_CURSO
    if (envio.estado !== 'EN_CURSO' && envio.estado !== 'ASIGNADO') {
      return res.status(400).json({
        success: false,
        message: `No se puede actualizar ubicación para envío con estado ${envio.estado}`
      });
    }

    // Crear objeto de ubicación con timestamp
    const nuevaUbicacion = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      timestamp: new Date().toISOString()
    };

    // Obtener historial actual
    const historialActual = Array.isArray(envio.historialUbicaciones) 
      ? envio.historialUbicaciones 
      : [];

    // Actualizar envío con nueva ubicación
    const envioActualizado = await prisma.envio.update({
      where: { id: envioId },
      data: {
        ubicacionActual: nuevaUbicacion,
        historialUbicaciones: [...historialActual, nuevaUbicacion]
      },
      include: {
        tienda: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Ubicación actualizada exitosamente',
      data: {
        envioId: envioActualizado.id,
        ubicacionActual: envioActualizado.ubicacionActual,
        estado: envioActualizado.estado
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en updateUbicacion:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar ubicación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener ubicación actual del motorizado
 * GET /api/tracking/:envioId/ubicacion
 * Permite a TIENDA (dueña) y MOTORIZADO (asignado) ver ubicación
 */
const getUbicacion = async (req, res) => {
  try {
    const { envioId } = req.params;

    // Obtener envío
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
      include: {
        tienda: {
          select: {
            id: true,
            nombre: true,
            userId: true
          }
        },
        ofertas: {
          where: {
            aceptada: true
          },
          include: {
            motorizado: {
              select: {
                id: true,
                userId: true,
                vehiculo: true,
                licencia: true
              }
            }
          }
        }
      }
    });

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    // Validar permisos
    let tienePermiso = false;

    if (req.user.role === 'TIENDA') {
      // La tienda debe ser la dueña del envío
      tienePermiso = envio.tienda.userId === req.user.userId;
    } else if (req.user.role === 'MOTORIZADO') {
      // El motorizado debe tener el envío asignado
      const motorizado = await prisma.motorizado.findUnique({
        where: { userId: req.user.userId }
      });
      
      if (motorizado && envio.ofertas.length > 0) {
        tienePermiso = envio.ofertas[0].motorizado.userId === req.user.userId;
      }
    }

    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este envío'
      });
    }

    // Retornar información
    return res.status(200).json({
      success: true,
      data: {
        envioId: envio.id,
        estado: envio.estado,
        origen: envio.origen,
        destino: envio.destino,
        ubicacionActual: envio.ubicacionActual,
        motorizado: envio.ofertas.length > 0 ? {
          vehiculo: envio.ofertas[0].motorizado.vehiculo,
          licencia: envio.ofertas[0].motorizado.licencia
        } : null,
        updatedAt: envio.updatedAt
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en getUbicacion:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error al obtener ubicación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cambiar estado del envío
 * PUT /api/tracking/:envioId/estado
 * Requiere: MOTORIZADO (asignado al envío)
 */
const cambiarEstadoEnvio = async (req, res) => {
  try {
    const { envioId } = req.params;
    const { nuevoEstado } = req.body;

    // Validar que el usuario sea MOTORIZADO
    if (req.user.role !== 'MOTORIZADO') {
      return res.status(403).json({
        success: false,
        message: 'Solo los motorizados pueden cambiar el estado del envío'
      });
    }

    // Validar nuevo estado
    const estadosPermitidos = ['EN_CURSO', 'ENTREGADO'];
    if (!nuevoEstado || !estadosPermitidos.includes(nuevoEstado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Estados permitidos: EN_CURSO, ENTREGADO'
      });
    }

    // Obtener motorizado
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId: req.user.userId }
    });

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    // Obtener envío
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
      include: {
        ofertas: {
          where: {
            motorizadoId: motorizado.id,
            aceptada: true
          }
        }
      }
    });

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    // Validar que el motorizado tiene este envío asignado
    if (envio.ofertas.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar este envío'
      });
    }

    // Validar transiciones de estado válidas
    const transicionesValidas = {
      'ASIGNADO': ['EN_CURSO'],
      'EN_CURSO': ['ENTREGADO']
    };

    const estadosPermitidosDesdeActual = transicionesValidas[envio.estado] || [];
    
    if (!estadosPermitidosDesdeActual.includes(nuevoEstado)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de ${envio.estado} a ${nuevoEstado}`
      });
    }

    // Actualizar estado
    const envioActualizado = await prisma.envio.update({
      where: { id: envioId },
      data: {
        estado: nuevoEstado
      },
      include: {
        tienda: {
          include: {
            user: {
              select: {
                phone: true
              }
            }
          }
        }
      }
    });

    // Enviar notificaciones según el nuevo estado
    console.log('\n[TRACKING DEBUG] ======================');
    console.log('[TRACKING DEBUG] Tienda user:', envioActualizado.tienda.user);
    console.log('[TRACKING DEBUG] Phone:', envioActualizado.tienda.user?.phone);
    console.log('[TRACKING DEBUG] Nuevo estado:', nuevoEstado);
    console.log('[TRACKING DEBUG] ======================\n');
    
    const telefono = envioActualizado.tienda.user?.phone;
    console.log('[TRACKING] Teléfono de tienda:', telefono || 'NO TIENE');
    
    if (telefono) {
      const linkRastreo = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/rastreo/${envio.trackingToken}`;

      if (nuevoEstado === 'EN_CURSO') {
        // Pedido en camino
        console.log('[TRACKING] Enviando notificación "pedido en camino"...');
        const resultado = await notificacionService.enviarWhatsApp(
          telefono,
          notificacionService.templates.pedidoEnCamino(linkRastreo),
          { envioId, tipo: 'pedido_en_camino' }
        );
        console.log('[TRACKING] Resultado:', resultado);
      } else if (nuevoEstado === 'ENTREGADO') {
        // Pedido entregado
        console.log('[TRACKING] Enviando notificación "pedido entregado"...');
        const resultado = await notificacionService.enviarWhatsApp(
          telefono,
          notificacionService.templates.pedidoEntregado(envioActualizado.tienda.nombre),
          { envioId, tipo: 'pedido_entregado' }
        );
        console.log('[TRACKING] Resultado:', resultado);
      }
    } else {
      console.log('[TRACKING] ⚠️ No se envió notificación - tienda no tiene teléfono');
    }

    return res.status(200).json({
      success: true,
      message: `Estado cambiado a ${nuevoEstado} exitosamente`,
      data: {
        envioId: envioActualizado.id,
        estado: envioActualizado.estado,
        updatedAt: envioActualizado.updatedAt
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en cambiarEstadoEnvio:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del envío',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  updateUbicacion,
  getUbicacion,
  cambiarEstadoEnvio
};

