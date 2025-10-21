const express = require('express');
const router = express.Router();

// TODO: Implementar controladores de usuarios
// router.get('/profile', userController.getProfile);
// router.put('/profile', userController.updateProfile);
// router.get('/tiendas', userController.getTiendas);
// router.get('/motorizados', userController.getMotorizados);

// Ruta temporal para testing
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

module.exports = router;
