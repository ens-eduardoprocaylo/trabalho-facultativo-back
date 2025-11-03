const express = require('express');
const { criarCorrida } = require('../controllers/corridaController');

const router = express.Router();

router.post('/corrida', criarCorrida);

module.exports = router;
