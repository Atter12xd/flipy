const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const evidenciasController = require('../controllers/evidenciasController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Asegurar que existe el directorio de uploads
const uploadsDir = path.join(__dirname, '../../uploads/evidencias');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPG, PNG)'), false);
  }
};

// Configurar multer con límites
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

/**
 * @route   POST /api/evidencias/:envioId/foto
 * @desc    Subir foto de entrega
 * @access  Private (MOTORIZADO)
 */
router.post('/:envioId/foto',
  verifyToken,
  requireRole(['MOTORIZADO']),
  upload.single('foto'),
  evidenciasController.subirFotoEntrega
);

/**
 * @route   POST /api/evidencias/:envioId/firma
 * @desc    Guardar firma digital
 * @access  Private (MOTORIZADO)
 */
router.post('/:envioId/firma',
  verifyToken,
  requireRole(['MOTORIZADO']),
  evidenciasController.guardarFirma
);

/**
 * @route   POST /api/evidencias/:envioId/metodo-pago
 * @desc    Registrar método de pago usado
 * @access  Private (MOTORIZADO)
 */
router.post('/:envioId/metodo-pago',
  verifyToken,
  requireRole(['MOTORIZADO']),
  evidenciasController.registrarMetodoPago
);

/**
 * @route   GET /api/evidencias/:envioId
 * @desc    Obtener evidencias de un envío
 * @access  Private (TIENDA dueña o MOTORIZADO asignado)
 */
router.get('/:envioId',
  verifyToken,
  evidenciasController.getEvidencias
);

// Manejo de errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir archivo: ${error.message}`
    });
  }
  
  if (error.message.includes('Solo se permiten')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;




