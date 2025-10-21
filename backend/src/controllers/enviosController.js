const prisma = require('../config/prisma');

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
        estado: 'PENDIENTE_PUJAS'
      },
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
      message: 'Envío creado exitosamente',
      envio
    });

  } catch (error) {
    console.error('Error en createEnvio:', error);
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
            direccion: true
          }
        },
        ofertas: {
          include: {
            motorizado: {
              select: {
                id: true,
                licencia: true,
                vehiculo: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      envios,
      total: envios.length
    });

  } catch (error) {
    console.error('Error en getEnvios:', error);
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

    res.status(200).json({ envio });

  } catch (error) {
    console.error('Error en getEnvioById:', error);
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
      message: 'Envío cancelado exitosamente',
      envio: envioActualizado
    });

  } catch (error) {
    console.error('Error en cancelEnvio:', error);
    res.status(500).json({
      message: 'Error al cancelar envío',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createEnvio,
  getEnvios,
  getEnvioById,
  cancelEnvio
};

