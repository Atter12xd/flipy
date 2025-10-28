const prisma = require('../config/prisma');

/**
 * Función auxiliar para calcular distancia entre dos puntos (fórmula de Haversine)
 * Retorna distancia en kilómetros
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  return distancia;
}

/**
 * Función auxiliar para calcular ETA estimado
 */
function calcularETA(envio) {
  const estado = envio.estado;
  
  if (estado === 'ENTREGADO') {
    return {
      mensaje: 'Pedido entregado',
      minutos: 0,
      estado: 'entregado'
    };
  }
  
  if (estado === 'CANCELADO') {
    return {
      mensaje: 'Pedido cancelado',
      minutos: 0,
      estado: 'cancelado'
    };
  }
  
  if (estado === 'PENDIENTE_PUJAS' || estado === 'BORRADOR') {
    return {
      mensaje: 'Pedido en preparación',
      minutos: null,
      estado: 'preparacion'
    };
  }
  
  if (estado === 'ASIGNADO') {
    return {
      mensaje: 'El motorizado aún no ha iniciado la entrega',
      minutos: null,
      estado: 'asignado'
    };
  }
  
  // Si está EN_CURSO, calcular distancia y tiempo estimado
  if (estado === 'EN_CURSO') {
    if (!envio.ubicacionActual || !envio.destino) {
      return {
        mensaje: 'En camino',
        minutos: null,
        estado: 'en_curso'
      };
    }
    
    const destino = envio.destino;
    const ubicacionActual = envio.ubicacionActual;
    
    // Calcular distancia
    const distanciaKm = calcularDistancia(
      ubicacionActual.lat,
      ubicacionActual.lng,
      destino.lat,
      destino.lng
    );
    
    // Estimar tiempo (30 km/h promedio en ciudad)
    const velocidadPromedio = 30; // km/h
    const minutos = Math.ceil((distanciaKm / velocidadPromedio) * 60);
    
    let mensaje;
    if (minutos < 5) {
      mensaje = 'Llega en menos de 5 minutos';
    } else if (minutos < 15) {
      mensaje = `Llega en aproximadamente ${minutos} minutos`;
    } else if (minutos < 30) {
      mensaje = `Llega en aproximadamente ${minutos} minutos`;
    } else {
      mensaje = `Tiempo estimado: ${minutos} minutos`;
    }
    
    return {
      mensaje,
      minutos,
      distanciaKm: Math.round(distanciaKm * 10) / 10, // 1 decimal
      estado: 'en_curso'
    };
  }
  
  return {
    mensaje: 'Estado desconocido',
    minutos: null,
    estado: 'desconocido'
  };
}

/**
 * Obtener envío por token público
 * GET /api/public/rastreo/:token
 * NO requiere autenticación
 */
const getEnvioByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: 'Token no proporcionado'
      });
    }

    // Buscar envío por token
    const envio = await prisma.envio.findUnique({
      where: { trackingToken: token },
      include: {
        tienda: {
          select: {
            nombre: true,
            direccion: true
          }
        }
      }
    });

    if (!envio) {
      return res.status(404).json({
        message: 'No se encontró un envío con este código de rastreo'
      });
    }

    // Calcular ETA
    const eta = calcularETA(envio);

    // Preparar datos públicos (sin información sensible)
    const datosPublicos = {
      id: envio.id,
      estado: envio.estado,
      origen: {
        direccion: envio.origen.direccion || 'Origen no especificado',
        lat: envio.origen.lat,
        lng: envio.origen.lng
      },
      destino: {
        direccion: envio.destino.direccion || 'Destino no especificado',
        lat: envio.destino.lat,
        lng: envio.destino.lng
      },
      ubicacionActual: envio.ubicacionActual ? {
        lat: envio.ubicacionActual.lat,
        lng: envio.ubicacionActual.lng,
        timestamp: envio.ubicacionActual.timestamp
      } : null,
      tienda: {
        nombre: envio.tienda.nombre
      },
      eta,
      detalles: envio.detalles,
      createdAt: envio.createdAt,
      updatedAt: envio.updatedAt
    };

    res.json({
      envio: datosPublicos
    });

  } catch (error) {
    console.error('Error obteniendo envío por token:', error);
    res.status(500).json({
      message: 'Error al obtener información del envío'
    });
  }
};

module.exports = {
  getEnvioByToken
};



