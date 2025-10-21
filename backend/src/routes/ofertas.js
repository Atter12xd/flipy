const express = require('express');
const router = express.Router();

// TODO: Implementar controladores de ofertas
// router.get('/envio/:envioId', ofertaController.getOfertasByEnvio);
// router.post('/', ofertaController.createOferta);
// router.put('/:id/aceptar', ofertaController.aceptarOferta);
// router.delete('/:id', ofertaController.cancelarOferta);

// Ruta temporal para testing
router.get('/test', (req, res) => {
  res.json({ message: 'Oferta routes working' });
});

module.exports = router;
