const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs');

/**
 * Subir foto de entrega
 * POST /api/evidencias/:envioId/foto
 * Requiere: MOTORIZADO asignado al envío
 */
const subirFotoEntrega = async (req, res) => {
  try {
    const { envioId } = req.params;

    // BUG FIX 1: Debug logging en el controlador
    console.log('[DEBUG EVIDENCIAS] === SUBIR FOTO ===');
    console.log('[DEBUG EVIDENCIAS] Usuario autenticado:', req.user?.email, `(${req.user?.role})`);
    console.log('[DEBUG EVIDENCIAS] Envio ID:', envioId);
    console.log('[DEBUG EVIDENCIAS] Archivo recibido:', req.file ? req.file.filename : 'NO FILE');

    // Validar que el usuario sea MOTORIZADO
    if (req.user.role !== 'MOTORIZADO') {
      console.error('[DEBUG EVIDENCIAS] ❌ Usuario no es motorizado');
      return res.status(403).json({
        success: false,
        message: 'Solo los motorizados pueden subir fotos de entrega'
      });
    }

    // Validar que se haya subido un archivo
    if (!req.file) {
      console.error('[DEBUG EVIDENCIAS] ❌ No se recibió archivo');
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
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

    // Buscar envío y validar que el motorizado esté asignado
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
      // Eliminar archivo si el envío no existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    // Validar que el motorizado esté asignado a este envío
    if (envio.ofertas.length === 0) {
      // Eliminar archivo si no está asignado
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'No estás asignado a este envío'
      });
    }

    // Validar que el estado sea EN_CURSO o ENTREGADO
    if (envio.estado !== 'EN_CURSO' && envio.estado !== 'ENTREGADO') {
      // Eliminar archivo si el estado no es válido
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden subir fotos cuando el envío está EN_CURSO o ENTREGADO'
      });
    }

    // Si ya existía una foto anterior, eliminarla
    if (envio.fotoEntrega) {
      const oldFilePath = path.join(__dirname, '../../', envio.fotoEntrega);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Construir la URL de la foto (ruta relativa)
    const fotoUrl = `/uploads/evidencias/${req.file.filename}`;

    // Actualizar envío con la URL de la foto
    const envioActualizado = await prisma.envio.update({
      where: { id: envioId },
      data: {
        fotoEntrega: fotoUrl,
        evidencias: envio.evidencias ? {
          ...envio.evidencias,
          fotoMetadata: {
            uploadedAt: new Date().toISOString(),
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        } : {
          fotoMetadata: {
            uploadedAt: new Date().toISOString(),
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Foto de entrega subida exitosamente',
      data: {
        fotoUrl,
        envioId: envioActualizado.id
      }
    });

  } catch (error) {
    // Si hay error, intentar eliminar el archivo subido
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Error en subirFotoEntrega:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error al subir foto de entrega',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Guardar firma digital
 * POST /api/evidencias/:envioId/firma
 * Requiere: MOTORIZADO asignado al envío
 */
const guardarFirma = async (req, res) => {
  try {
    const { envioId } = req.params;
    const { firmaBase64 } = req.body;

    // Validar que el usuario sea MOTORIZADO
    if (req.user.role !== 'MOTORIZADO') {
      return res.status(403).json({
        success: false,
        message: 'Solo los motorizados pueden guardar firmas'
      });
    }

    // Validar que se haya proporcionado la firma
    if (!firmaBase64) {
      return res.status(400).json({
        success: false,
        message: 'La firma digital es requerida'
      });
    }

    // Validar formato base64
    if (!firmaBase64.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'La firma debe estar en formato base64 de imagen'
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

    // Buscar envío y validar que el motorizado esté asignado
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

    // Validar que el motorizado esté asignado a este envío
    if (envio.ofertas.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No estás asignado a este envío'
      });
    }

    // Validar que el estado sea EN_CURSO o ENTREGADO
    if (envio.estado !== 'EN_CURSO' && envio.estado !== 'ENTREGADO') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede guardar la firma cuando el envío está EN_CURSO o ENTREGADO'
      });
    }

    // Actualizar envío con la firma digital
    const envioActualizado = await prisma.envio.update({
      where: { id: envioId },
      data: {
        firmaDigital: firmaBase64,
        evidencias: envio.evidencias ? {
          ...envio.evidencias,
          firmaMetadata: {
            uploadedAt: new Date().toISOString()
          }
        } : {
          firmaMetadata: {
            uploadedAt: new Date().toISOString()
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Firma digital guardada exitosamente',
      data: {
        envioId: envioActualizado.id
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en guardarFirma:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error al guardar firma digital',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Registrar método de pago
 * POST /api/evidencias/:envioId/metodo-pago
 * Requiere: MOTORIZADO asignado al envío
 */
const registrarMetodoPago = async (req, res) => {
  try {
    const { envioId } = req.params;
    const { metodoPago } = req.body;

    // Validar que el usuario sea MOTORIZADO
    if (req.user.role !== 'MOTORIZADO') {
      return res.status(403).json({
        success: false,
        message: 'Solo los motorizados pueden registrar el método de pago'
      });
    }

    // Validar que se haya proporcionado el método de pago
    if (!metodoPago) {
      return res.status(400).json({
        success: false,
        message: 'El método de pago es requerido'
      });
    }

    // Validar método de pago
    const metodosValidos = ['efectivo', 'tarjeta', 'yape', 'plin', 'transferencia'];
    if (!metodosValidos.includes(metodoPago.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Método de pago inválido. Opciones: ${metodosValidos.join(', ')}`
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

    // Buscar envío y validar que el motorizado esté asignado
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

    // Validar que el motorizado esté asignado a este envío
    if (envio.ofertas.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No estás asignado a este envío'
      });
    }

    // Preparar datos de actualización
    const updateData = {
      metodoPago: metodoPago.toLowerCase(),
      evidencias: envio.evidencias ? {
        ...envio.evidencias,
        metodoPagoMetadata: {
          registeredAt: new Date().toISOString()
        }
      } : {
        metodoPagoMetadata: {
          registeredAt: new Date().toISOString()
        }
      }
    };

    // Si el envío no está ENTREGADO, cambiar estado y registrar fecha de entrega
    if (envio.estado !== 'ENTREGADO') {
      updateData.estado = 'ENTREGADO';
      updateData.fechaEntrega = new Date();
    }

    // Actualizar envío
    const envioActualizado = await prisma.envio.update({
      where: { id: envioId },
      data: updateData,
      include: {
        tienda: {
          select: {
            id: true,
            nombre: true,
            direccion: true
          }
        },
        ofertas: {
          where: {
            motorizadoId: motorizado.id,
            aceptada: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Método de pago registrado exitosamente',
      data: envioActualizado
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en registrarMetodoPago:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error al registrar método de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener evidencias de un envío
 * GET /api/evidencias/:envioId
 * Requiere: TIENDA dueña o MOTORIZADO asignado
 */
const getEvidencias = async (req, res) => {
  try {
    const { envioId } = req.params;

    // Buscar envío
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
      include: {
        tienda: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
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
                licencia: true,
                vehiculo: true
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
      // Validar que sea la tienda dueña
      tienePermiso = envio.tienda.userId === req.user.userId;
    } else if (req.user.role === 'MOTORIZADO') {
      // Validar que sea el motorizado asignado
      const motorizado = await prisma.motorizado.findUnique({
        where: { userId: req.user.userId }
      });
      
      if (motorizado) {
        tienePermiso = envio.ofertas.some(oferta => 
          oferta.motorizado.id === motorizado.id
        );
      }
    }

    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver las evidencias de este envío'
      });
    }

    // Construir objeto de evidencias
    const evidencias = {
      envioId: envio.id,
      estado: envio.estado,
      fotoEntrega: envio.fotoEntrega,
      firmaDigital: envio.firmaDigital,
      metodoPago: envio.metodoPago,
      fechaEntrega: envio.fechaEntrega,
      evidencias: envio.evidencias,
      tienda: {
        nombre: envio.tienda.nombre,
        direccion: envio.tienda.direccion
      },
      origen: envio.origen,
      destino: envio.destino
    };

    res.status(200).json({
      success: true,
      data: evidencias
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error en getEvidencias:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error al obtener evidencias',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  subirFotoEntrega,
  guardarFirma,
  registrarMetodoPago,
  getEvidencias
};



