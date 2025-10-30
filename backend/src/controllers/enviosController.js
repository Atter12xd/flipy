const prisma = require('../config/prisma');
const { createId } = require('@paralleldrive/cuid2');
const notificacionService = require('../services/notificacionService');

/**
 * Crear nuevo envío
 * POST /api/envios
 * Requiere: TIENDA
 */
const createEnvio = async (req, res) => {
  try {
    const { origen, destino, precio, detalles } = req.body;

    // Validar que el usuario sea TIENDA
    if (req.user.role !== 'TIENDA') {
      return res.status(403).json({
        message: 'Solo las tiendas pueden crear envíos'
      });
    }

    // Validar campos requeridos
    if (!origen || !destino || !precio) {
      return res.status(400).json({
        message: 'Origen, destino y precio son requeridos'
      });
    }

    // Validar que origen y destino tengan estructura correcta
    if (typeof origen !== 'object' || typeof destino !== 'object') {
      return res.status(400).json({
        message: 'Origen y destino deben ser objetos con estructura: { lat, lng, direccion, nombre }'
      });
    }

    // Obtener tienda del usuario
    const tienda = await prisma.tienda.findUnique({
      where: { userId: req.user.userId }
    });

    if (!tienda) {
      return res.status(404).json({
        message: 'Tienda no encontrada'
      });
    }

    // Crear envío
    const envio = await prisma.envio.create({
      data: {
        tiendaId: tienda.id,
        origen,
        destino,
        precio: parseFloat(precio),
        detalles: detalles || null,
        estado: 'PENDIENTE_PUJAS',
        trackingToken: createId()
      }
    });

    // Buscar tienda con usuario para notificación
    const tiendaConUsuario = await prisma.tienda.findUnique({
      where: { id: tienda.id },
      include: {
        user: {
          select: { phone: true, email: true }
        }
      }
    });

    console.log('\n[ENVIOS DEBUG] ======================');
    console.log('[ENVIOS DEBUG] Tienda completa:', JSON.stringify(tiendaConUsuario, null, 2));
    console.log('[ENVIOS DEBUG] User:', tiendaConUsuario.user);
    console.log('[ENVIOS DEBUG] Phone:', tiendaConUsuario.user?.phone);
    console.log('[ENVIOS DEBUG] ======================\n');

    // Enviar notificación WhatsApp (simulada)
    console.log('[ENVIOS] Intentando enviar notificación WhatsApp...');
    
    const telefono = tiendaConUsuario.user?.phone;
    console.log('[ENVIOS] Teléfono de tienda:', telefono || 'NO TIENE');
    
    if (telefono) {
      const linkRastreo = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/rastreo/${envio.trackingToken}`;
      console.log('[ENVIOS] Link de rastreo generado:', linkRastreo);
      console.log('[ENVIOS] Llamando a notificacionService.enviarWhatsApp...');
      
      const resultado = await notificacionService.enviarWhatsApp(
        telefono,
        notificacionService.templates.pedidoCreado(tiendaConUsuario.nombre, linkRastreo),
        { envioId: envio.id, tipo: 'pedido_creado' }
      );
      
      console.log('[ENVIOS] Resultado de notificación:', resultado);
    } else {
      console.log('[ENVIOS] ⚠️ No se envió notificación - tienda no tiene teléfono');
    }

    // Retornar envío con tienda completa
    const envioCompleto = await prisma.envio.findUnique({
      where: { id: envio.id },
      include: {
        tienda: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Envío creado exitosamente',
      data: envioCompleto
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en createEnvio:', error);
    }
    res.status(500).json({
      message: 'Error al crear envío',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener envíos
 * GET /api/envios
 * - TIENDA: retorna solo sus envíos
 * - MOTORIZADO: retorna envíos con estado PENDIENTE_PUJAS
 */
const getEnvios = async (req, res) => {
  try {
    console.log('[ENVIOS] Usuario:', req.user.email, 'Role:', req.user.role);
    let whereClause = {};

    if (req.user.role === 'TIENDA') {
      // Obtener tienda del usuario
      const tienda = await prisma.tienda.findUnique({
        where: { userId: req.user.userId }
      });

      if (!tienda) {
        return res.status(404).json({
          message: 'Tienda no encontrada'
        });
      }

      console.log('[ENVIOS] Tienda encontrada:', tienda.nombre, 'ID:', tienda.id);
      // Solo envíos de esta tienda
      whereClause.tiendaId = tienda.id;

    } else if (req.user.role === 'MOTORIZADO') {
      // Solo envíos disponibles para pujar
      whereClause.estado = 'PENDIENTE_PUJAS';
    }

    // Obtener envíos
    const envios = await prisma.envio.findMany({
      where: whereClause,
      include: {
        tienda: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            user: {
              select: {
                email: true,
                phone: true
              }
            }
          }
        },
        ofertas: {
          include: {
            motorizado: {
              select: {
                id: true,
                licencia: true,
                vehiculo: true,
                user: {
                  select: {
                    email: true,
                    phone: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('[ENVIOS] Retornando', envios.length, 'envíos');
    console.log('[ENVIOS] Estados:', envios.map(e => e.estado).join(', '));
    
    res.status(200).json({
      success: true,
      envios,
      total: envios.length
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en getEnvios:', error);
    }
    res.status(500).json({
      message: 'Error al obtener envíos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener envío por ID
 * GET /api/envios/:id
 */
const getEnvioById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar envío
    const envio = await prisma.envio.findUnique({
      where: { id },
      include: {
        tienda: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        },
        ofertas: {
          include: {
            motorizado: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          },
          orderBy: {
            precioOferta: 'asc' // Ordenar por precio (menor a mayor)
          }
        }
      }
    });

    if (!envio) {
      return res.status(404).json({
        message: 'Envío no encontrado'
      });
    }

    // Validar permisos
    if (req.user.role === 'TIENDA') {
      const tienda = await prisma.tienda.findUnique({
        where: { userId: req.user.userId }
      });

      if (envio.tiendaId !== tienda?.id) {
        return res.status(403).json({
          message: 'No tienes permisos para ver este envío'
        });
      }
    }

    res.status(200).json({ 
      success: true,
      data: envio 
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en getEnvioById:', error);
    }
    res.status(500).json({
      message: 'Error al obtener envío',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancelar envío
 * DELETE /api/envios/:id
 * Requiere: TIENDA (dueño del envío)
 */
const cancelEnvio = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario sea TIENDA
    if (req.user.role !== 'TIENDA') {
      return res.status(403).json({
        message: 'Solo las tiendas pueden cancelar envíos'
      });
    }

    // Obtener tienda del usuario
    const tienda = await prisma.tienda.findUnique({
      where: { userId: req.user.userId }
    });

    if (!tienda) {
      return res.status(404).json({
        message: 'Tienda no encontrada'
      });
    }

    // Buscar envío
    const envio = await prisma.envio.findUnique({
      where: { id }
    });

    if (!envio) {
      return res.status(404).json({
        message: 'Envío no encontrado'
      });
    }

    // Validar que el envío pertenezca a la tienda
    if (envio.tiendaId !== tienda.id) {
      return res.status(403).json({
        message: 'No tienes permisos para cancelar este envío'
      });
    }

    // Validar que el envío no esté ya entregado
    if (envio.estado === 'ENTREGADO') {
      return res.status(400).json({
        message: 'No se puede cancelar un envío ya entregado'
      });
    }

    // Actualizar estado a CANCELADO
    const envioActualizado = await prisma.envio.update({
      where: { id },
      data: {
        estado: 'CANCELADO'
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

    res.status(200).json({
      success: true,
      message: 'Envío cancelado exitosamente',
      data: envioActualizado
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en cancelEnvio:', error);
    }
    res.status(500).json({
      message: 'Error al cancelar envío',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener envíos asignados al motorizado
 * GET /api/envios/motorizado/asignados
 * Requiere: MOTORIZADO
 */
const getEnviosAsignados = async (req, res) => {
  try {
    // Validar que el usuario sea MOTORIZADO
    if (req.user.role !== 'MOTORIZADO') {
      return res.status(403).json({
        success: false,
        message: 'Solo los motorizados pueden acceder a esta ruta'
      });
    }

    // Obtener motorizado del usuario
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId: req.user.userId }
    });

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    // Buscar envíos donde el motorizado tiene una oferta aceptada
    const enviosAsignados = await prisma.envio.findMany({
      where: {
        ofertas: {
          some: {
            motorizadoId: motorizado.id,
            aceptada: true
          }
        },
        estado: {
          in: ['ASIGNADO', 'EN_CURSO', 'ENTREGADO']
        }
      },
      include: {
        tienda: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            user: {
              select: {
                email: true,
                phone: true
              }
            }
          }
        },
        ofertas: {
          where: {
            motorizadoId: motorizado.id,
            aceptada: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      envios: enviosAsignados,
      total: enviosAsignados.length
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en getEnviosAsignados:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error al obtener envíos asignados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createEnvio,
  getEnvios,
  getEnvioById,
  cancelEnvio,
  getEnviosAsignados
};

