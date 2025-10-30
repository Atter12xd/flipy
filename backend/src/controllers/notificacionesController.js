// FLIPY - Controlador de Notificaciones
// Gestión y consulta de notificaciones enviadas

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtener notificaciones del usuario autenticado
 * GET /api/notificaciones?tipo=whatsapp&limite=50
 */
const getNotificaciones = async (req, res) => {
  try {
    const { tipo, limite = 50 } = req.query;
    const userId = req.user.userId;

    // Obtener teléfono/email del usuario según su rol
    let destinatario;
    
    if (req.user.role === 'TIENDA') {
      const tienda = await prisma.tienda.findUnique({
        where: { userId },
        include: { user: { select: { phone: true, email: true } } }
      });
      destinatario = tienda?.user.phone || tienda?.user.email;
    } else if (req.user.role === 'MOTORIZADO') {
      const motorizado = await prisma.motorizado.findUnique({
        where: { userId },
        include: { user: { select: { phone: true, email: true } } }
      });
      destinatario = motorizado?.user.phone || motorizado?.user.email;
    }

    // Si no tiene teléfono/email, retornar vacío
    if (!destinatario) {
      return res.json({
        success: true,
        notificaciones: [],
        total: 0
      });
    }

    // Construir where clause
    const whereClause = {
      destinatario
    };

    if (tipo) {
      whereClause.tipo = tipo;
    }

    // Obtener notificaciones
    const notificaciones = await prisma.notificacion.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limite)
    });

    return res.json({
      success: true,
      notificaciones,
      total: notificaciones.length
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de notificaciones
 * GET /api/notificaciones/estadisticas
 */
const getEstadisticas = async (req, res) => {
  try {
    const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Total enviadas últimas 24 horas
    const totalEnviadas = await prisma.notificacion.count({
      where: {
        estado: 'enviada',
        createdAt: {
          gte: hace24Horas
        }
      }
    });

    // Total fallidas últimas 24 horas
    const totalFallidas = await prisma.notificacion.count({
      where: {
        estado: 'fallida',
        createdAt: {
          gte: hace24Horas
        }
      }
    });

    // Por tipo
    const porTipo = await prisma.notificacion.groupBy({
      by: ['tipo'],
      where: {
        createdAt: {
          gte: hace24Horas
        }
      },
      _count: true
    });

    // Por estado
    const porEstado = await prisma.notificacion.groupBy({
      by: ['estado'],
      where: {
        createdAt: {
          gte: hace24Horas
        }
      },
      _count: true
    });

    // Calcular tasa de éxito
    const total = totalEnviadas + totalFallidas;
    const tasaExito = total > 0 ? ((totalEnviadas / total) * 100).toFixed(2) : 0;

    return res.json({
      success: true,
      estadisticas: {
        ultimas24Horas: {
          totalEnviadas,
          totalFallidas,
          total,
          tasaExito: `${tasaExito}%`
        },
        porTipo: porTipo.map(t => ({
          tipo: t.tipo,
          count: t._count
        })),
        porEstado: porEstado.map(e => ({
          estado: e.estado,
          count: e._count
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * Obtener todas las notificaciones (solo admin)
 * GET /api/notificaciones/all
 */
const getAllNotificaciones = async (req, res) => {
  try {
    const { limite = 50 } = req.query;

    const notificaciones = await prisma.notificacion.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limite)
    });

    return res.json({
      success: true,
      notificaciones,
      total: notificaciones.length
    });

  } catch (error) {
    console.error('Error al obtener todas las notificaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

module.exports = {
  getNotificaciones,
  getEstadisticas,
  getAllNotificaciones
};




