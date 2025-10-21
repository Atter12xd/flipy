const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   POST /api/auth/register/motorizado
 * @desc    Registrar un nuevo motorizado
 * @access  Public
 */
router.post('/register/motorizado', authController.registerMotorizado);

/**
 * @route   POST /api/auth/register/tienda
 * @desc    Registrar una nueva tienda
 * @access  Public
 */
router.post('/register/tienda', authController.registerTienda);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión (motorizado o tienda)
 * @access  Public
 */
router.post('/login', authController.login);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes working',
    routes: [
      'POST /api/auth/register/motorizado',
      'POST /api/auth/register/tienda',
      'POST /api/auth/login'
    ]
  });
});

module.exports = router;
