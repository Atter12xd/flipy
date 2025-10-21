const express = require('express');
const router = express.Router();

// TODO: Implementar controladores de envíos
// router.get('/', envioController.getEnvios);
// router.post('/', envioController.createEnvio);
// router.get('/:id', envioController.getEnvio);
// router.put('/:id', envioController.updateEnvio);
// router.delete('/:id', envioController.cancelEnvio);

// Ruta temporal para testing
router.get('/test', (req, res) => {
  res.json({ message: 'Envio routes working' });
});

module.exports = router;
