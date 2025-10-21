const express = require('express');
const router = express.Router();

// TODO: Implementar controladores de transacciones
// router.get('/', transaccionController.getTransacciones);
// router.post('/', transaccionController.createTransaccion);
// router.get('/:id', transaccionController.getTransaccion);

// Ruta temporal para testing
router.get('/test', (req, res) => {
  res.json({ message: 'Transaccion routes working' });
});

module.exports = router;
