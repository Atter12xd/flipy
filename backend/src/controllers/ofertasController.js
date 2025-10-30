const prisma = require('../config/prisma');
const notificacionService = require('../services/notificacionService');

/**
 * Crear una nueva oferta para un envío
 * Solo motorizados pueden crear ofertas
 */
const createOferta = async (req, res) => {
  try {
    const { envioId, precioOferta, tiempoEstimado } = req.body;

    // Validar que el usuario sea MOTORIZADO
    if (req.user.role !== 'MOTORIZADO') {
      return res.status(403).json({
        success: false,
        message: 'Solo los motorizados pueden crear ofertas',
      });
    }

    // Validar datos requeridos
    if (!envioId || !precioOferta || !tiempoEstimado) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: envioId, precioOferta, tiempoEstimado',
      });
    }

    // Validar que precio y tiempo sean positivos
    if (precioOferta <= 0 || tiempoEstimado <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio y tiempo estimado deben ser mayores a 0',
      });
    }

    // Obtener el motorizadoId desde el usuario
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId: req.user.userId },
    });

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el perfil de motorizado',
      });
    }

    // Validar que el envío existe y está en estado PENDIENTE_PUJAS
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
    });

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado',
      });
    }

    if (envio.estado !== 'PENDIENTE_PUJAS') {
      return res.status(400).json({
        success: false,
        message: `No se pueden crear ofertas para envíos con estado ${envio.estado}`,
      });
    }

    // Verificar si ya existe una oferta de este motorizado para este envío
    const ofertaExistente = await prisma.oferta.findFirst({
      where: {
        envioId,
        motorizadoId: motorizado.id,
      },
    });

    if (ofertaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya has creado una oferta para este envío',
      });
    }

    // Crear la oferta
    const oferta = await prisma.oferta.create({
      data: {
        envioId,
        motorizadoId: motorizado.id,
        precioOferta: parseFloat(precioOferta),
        tiempoEstimado: parseInt(tiempoEstimado),
      },
      include: {
        motorizado: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        envio: {
          include: {
            tienda: {
              include: {
                user: {
                  select: {
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Notificar a la tienda sobre la nueva oferta
    console.log('\n[OFERTAS DEBUG] ======================');
    console.log('[OFERTAS DEBUG] Tienda user:', oferta.envio.tienda.user);
    console.log('[OFERTAS DEBUG] Phone:', oferta.envio.tienda.user?.phone);
    console.log('[OFERTAS DEBUG] ======================\n');
    
    const telefonoTienda = oferta.envio.tienda.user?.phone;
    console.log('[OFERTAS] Teléfono de tienda:', telefonoTienda || 'NO TIENE');
    
    if (telefonoTienda) {
      console.log('[OFERTAS] Enviando notificación de nueva oferta...');
      const resultado = await notificacionService.enviarWhatsApp(
        telefonoTienda,
        notificacionService.templates.nuevaOferta(envioId, precioOferta, tiempoEstimado),
        { envioId, ofertaId: oferta.id, tipo: 'nueva_oferta' }
      );
      console.log('[OFERTAS] Resultado:', resultado);
    } else {
      console.log('[OFERTAS] ⚠️ No se envió notificación - tienda no tiene teléfono');
    }

    return res.status(201).json({
      success: true,
      message: 'Oferta creada exitosamente',
      data: oferta,
    });
  } catch (error) {
    console.error('Error al crear oferta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear oferta',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las ofertas de un envío
 * Incluye datos del motorizado
 */
const getOfertasByEnvio = async (req, res) => {
  try {
    const { envioId } = req.params;

    // Validar que el envío existe
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
    });

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado',
      });
    }

    // Obtener todas las ofertas del envío
    const ofertas = await prisma.oferta.findMany({
      where: { envioId },
      include: {
        motorizado: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        precioOferta: 'asc', // Más barato primero
      },
    });

    return res.json({
      success: true,
      data: ofertas,
      count: ofertas.length,
    });
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas',
      error: error.message,
    });
  }
};

/**
 * Aceptar una oferta
 * Solo la tienda dueña del envío puede aceptar
 */
const aceptarOferta = async (req, res) => {
  try {
    const { id: ofertaId } = req.params;

    // Validar que el usuario sea TIENDA
    if (req.user.role !== 'TIENDA') {
      return res.status(403).json({
        success: false,
        message: 'Solo las tiendas pueden aceptar ofertas',
      });
    }

    // Obtener la tienda del usuario
    const tienda = await prisma.tienda.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tienda) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el perfil de tienda',
      });
    }

    // Obtener la oferta con su envío
    const oferta = await prisma.oferta.findUnique({
      where: { id: ofertaId },
      include: {
        envio: true,
        motorizado: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!oferta) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada',
      });
    }

    // Validar que la tienda sea dueña del envío
    if (oferta.envio.tiendaId !== tienda.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aceptar esta oferta',
      });
    }

    // Validar que el envío esté en estado correcto
    if (oferta.envio.estado !== 'PENDIENTE_PUJAS') {
      return res.status(400).json({
        success: false,
        message: `No se puede aceptar oferta para envío con estado ${oferta.envio.estado}`,
      });
    }

    // Validar que la oferta no haya sido aceptada ya
    if (oferta.aceptada) {
      return res.status(400).json({
        success: false,
        message: 'Esta oferta ya fue aceptada',
      });
    }

    // Usar transacción para actualizar oferta y envío
    const resultado = await prisma.$transaction(async (prisma) => {
      // Marcar la oferta como aceptada
      const ofertaActualizada = await prisma.oferta.update({
        where: { id: ofertaId },
        data: { aceptada: true },
        include: {
          motorizado: {
            include: {
              user: {
                select: {
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Actualizar el estado del envío a ASIGNADO
      const envioActualizado = await prisma.envio.update({
        where: { id: oferta.envioId },
        data: { estado: 'ASIGNADO' },
      });

      return { oferta: ofertaActualizada, envio: envioActualizado };
    });

    // Notificar al motorizado ganador
    console.log('\n[OFERTAS ACEPTAR DEBUG] ======================');
    console.log('[OFERTAS ACEPTAR DEBUG] Motorizado user:', resultado.oferta.motorizado.user);
    console.log('[OFERTAS ACEPTAR DEBUG] Phone:', resultado.oferta.motorizado.user?.phone);
    console.log('[OFERTAS ACEPTAR DEBUG] ======================\n');
    
    const telefonoMotorizado = resultado.oferta.motorizado.user?.phone;
    console.log('[OFERTAS ACEPTAR] Teléfono de motorizado:', telefonoMotorizado || 'NO TIENE');
    
    if (telefonoMotorizado) {
      console.log('[OFERTAS ACEPTAR] Enviando notificación de oferta ganada...');
      const resultadoNotif = await notificacionService.enviarWhatsApp(
        telefonoMotorizado,
        notificacionService.templates.ofertaGanada(oferta.envioId, oferta.envio.origen.direccion),
        { envioId: oferta.envioId, ofertaId, tipo: 'oferta_ganada' }
      );
      console.log('[OFERTAS ACEPTAR] Resultado:', resultadoNotif);
    } else {
      console.log('[OFERTAS ACEPTAR] ⚠️ No se envió notificación - motorizado no tiene teléfono');
    }

    return res.json({
      success: true,
      message: 'Oferta aceptada exitosamente',
      data: resultado,
    });
  } catch (error) {
    console.error('Error al aceptar oferta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aceptar oferta',
      error: error.message,
    });
  }
};

module.exports = {
  createOferta,
  getOfertasByEnvio,
  aceptarOferta,
};

