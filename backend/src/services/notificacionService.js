/**
 * FLIPY - Servicio de Notificaciones
 * Sistema SIMULADO de notificaciones WhatsApp
 * 
 * ===========================================
 * INTEGRACIÓN TWILIO/360DIALOG (FUTURO)
 * ===========================================
 * 
 * Para activar envío real de WhatsApp:
 * 
 * 1. Instalar: npm install twilio
 * 
 * 2. Agregar a .env:
 *    TWILIO_ACCOUNT_SID=xxx
 *    TWILIO_AUTH_TOKEN=xxx
 *    TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
 * 
 * 3. Reemplazar función enviarWhatsApp con:
 *    const twilio = require('twilio');
 *    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 *    
 *    const message = await client.messages.create({
 *      from: process.env.TWILIO_WHATSAPP_NUMBER,
 *      to: `whatsapp:${telefono}`,
 *      body: mensaje
 *    });
 * 
 * ===========================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Validar formato de teléfono
 * Debe ser: +51XXXXXXXXX (Perú)
 */
const validarTelefono = (telefono) => {
  if (!telefono) return false;
  const regex = /^\+51\d{9}$/;
  return regex.test(telefono);
};

/**
 * Verificar si hay notificación duplicada reciente (< 1 minuto)
 */
const existeNotificacionReciente = async (destinatario, mensaje) => {
  const unMinutoAtras = new Date(Date.now() - 60 * 1000);
  
  const notificacionReciente = await prisma.notificacion.findFirst({
    where: {
      destinatario,
      mensaje,
      createdAt: {
        gte: unMinutoAtras
      }
    }
  });

  return !!notificacionReciente;
};

/**
 * Enviar notificación por WhatsApp (SIMULADO)
 * 
 * @param {string} telefono - Formato: +51XXXXXXXXX
 * @param {string} mensaje - Texto del mensaje (máx 1600 chars)
 * @param {object} metadata - Info adicional (envioId, userId, etc)
 * @returns {Promise<{success: boolean, notificacionId?: string, error?: string}>}
 */
const enviarWhatsApp = async (telefono, mensaje, metadata = {}) => {
  try {
    console.log('===========================================');
    console.log('🔔 INICIO - Enviar WhatsApp');
    console.log('===========================================');
    console.log('Teléfono:', telefono);
    console.log('Mensaje (primeros 100 chars):', mensaje.substring(0, 100));
    console.log('Metadata:', JSON.stringify(metadata));

    // Validar teléfono
    if (!validarTelefono(telefono)) {
      console.warn(`⚠️  Teléfono inválido: ${telefono}`);
      console.log('❌ Validación falló - retornando error');
      return { success: false, error: 'Teléfono inválido. Formato: +51XXXXXXXXX' };
    }
    console.log('✅ Teléfono válido');

    // Validar longitud del mensaje
    if (mensaje.length > 1600) {
      console.warn(`⚠️  Mensaje muy largo: ${mensaje.length} caracteres - truncando`);
      mensaje = mensaje.substring(0, 1600);
    }
    console.log('✅ Longitud de mensaje OK:', mensaje.length, 'caracteres');

    // Verificar duplicados
    console.log('🔍 Verificando duplicados...');
    const esDuplicado = await existeNotificacionReciente(telefono, mensaje);
    if (esDuplicado) {
      console.log(`⏭️  Notificación duplicada ignorada a ${telefono}`);
      return { success: true, duplicado: true };
    }
    console.log('✅ No es duplicado');

    // SIMULADO: Guardar en base de datos
    console.log('💾 Guardando en base de datos...');
    const notificacion = await prisma.notificacion.create({
      data: {
        tipo: 'whatsapp',
        destinatario: telefono,
        mensaje,
        estado: 'enviada',
        enviadaEn: new Date(),
        metadata
      }
    });

    console.log('===========================================');
    console.log('✅ NOTIFICACIÓN GUARDADA EXITOSAMENTE');
    console.log('===========================================');
    console.log(`📱 WhatsApp SIMULADO enviado a ${telefono}`);
    console.log(`   Mensaje: ${mensaje.substring(0, 50)}${mensaje.length > 50 ? '...' : ''}`);
    console.log(`   ID: ${notificacion.id}`);
    console.log(`   Estado: ${notificacion.estado}`);
    console.log(`   Creado: ${notificacion.createdAt}`);
    console.log('===========================================\n');

    return {
      success: true,
      notificacionId: notificacion.id
    };

  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error);
    
    // Guardar notificación fallida
    try {
      await prisma.notificacion.create({
        data: {
          tipo: 'whatsapp',
          destinatario: telefono,
          mensaje,
          estado: 'fallida',
          error: error.message,
          metadata
        }
      });
    } catch (dbError) {
      console.error('❌ Error al guardar notificación fallida:', dbError);
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * TEMPLATES DE MENSAJES
 */
const templates = {
  /**
   * Pedido creado (para cliente)
   */
  pedidoCreado: (nombreTienda, linkRastreo) => {
    return `🎉 *¡Tu pedido ha sido creado!*

📦 Tienda: ${nombreTienda}

Estamos buscando un motorizado para tu entrega.

🔗 Rastrea tu pedido aquí:
${linkRastreo}

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Pedido asignado (para cliente)
   */
  pedidoAsignado: (nombreMotorizado, tiempoEstimado) => {
    return `✅ *¡Tu pedido ha sido asignado!*

🏍️ Motorizado: ${nombreMotorizado}
⏱️ Tiempo estimado: ${tiempoEstimado} minutos

Tu pedido está siendo preparado.

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Pedido en camino (para cliente)
   */
  pedidoEnCamino: (linkRastreo) => {
    return `🚀 *¡Tu pedido está en camino!*

El motorizado ha iniciado la entrega.

📍 Sigue la ubicación en tiempo real:
${linkRastreo}

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Pedido cerca (para cliente)
   */
  pedidoCerca: () => {
    return `📍 *¡Tu motorizado está cerca!*

Prepárate para recibir tu pedido.
Llegará en los próximos minutos.

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Pedido entregado (para cliente)
   */
  pedidoEntregado: (nombreTienda) => {
    return `✅ *¡Pedido entregado con éxito!*

📦 Tienda: ${nombreTienda}

Gracias por usar FLIPY.
¡Esperamos verte pronto! 🎉

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Nueva oferta (para tienda)
   */
  nuevaOferta: (envioId, precio, tiempo) => {
    return `💰 *¡Nueva oferta recibida!*

📦 Envío ID: ${envioId.substring(0, 8)}...
💵 Precio: S/ ${precio.toFixed(2)}
⏱️ Tiempo estimado: ${tiempo} min

Revisa tu dashboard para aceptar la oferta.

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Oferta ganada (para motorizado)
   */
  ofertaGanada: (envioId, direccionRecogida) => {
    return `🎉 *¡Tu oferta fue aceptada!*

📦 Envío ID: ${envioId.substring(0, 8)}...
📍 Dirección de recogida:
${direccionRecogida}

Ve al dashboard para iniciar el envío.

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Bienvenida tienda
   */
  bienvenidaTienda: (nombreTienda) => {
    return `🎉 *¡Bienvenido a FLIPY!*

Hola ${nombreTienda},

Tu cuenta ha sido creada exitosamente.
Ya puedes crear tus primeros envíos.

📱 Dashboard: https://flipy.app/dashboard

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Bienvenida motorizado
   */
  bienvenidaMotorizado: (nombreMotorizado) => {
    return `🏍️ *¡Bienvenido a FLIPY!*

Hola ${nombreMotorizado},

Tu cuenta ha sido activada.
Comienza a recibir ofertas de entrega.

⚡ 7 días de prueba gratis incluidos

📱 Dashboard: https://flipy.app/motorizado/dashboard

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Trial expirando
   */
  trialExpirando: (diasRestantes) => {
    return `⏰ *Tu trial está por expirar*

Te quedan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} de prueba gratis.

💳 Activa tu suscripción para continuar:
https://flipy.app/motorizado/suscripcion

_FLIPY - Delivery con pujas_`;
  },

  /**
   * Suscripción activada
   */
  suscripcionActivada: () => {
    return `✅ *¡Suscripción activada!*

Tu pago fue procesado exitosamente.
Ya puedes seguir recibiendo ofertas.

💰 Próximo pago en 30 días

_FLIPY - Delivery con pujas_`;
  }
};

module.exports = {
  enviarWhatsApp,
  templates,
  validarTelefono
};




