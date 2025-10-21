const express = require('express');
const router = express.Router();

// TODO: Implementar controladores de autenticación
// router.post('/login', authController.login);
// router.post('/register', authController.register);
// router.post('/refresh', authController.refresh);
// router.post('/logout', authController.logout);

// Ruta temporal para testing
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

module.exports = router;
