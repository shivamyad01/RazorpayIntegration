// paymentRoutes.js

const express = require('express');
const router = express.Router();
const { autoPay, verifyPayment } = require('../controllers/paymentController');

router.post('/auto-pay', autoPay);
router.post('/verify', verifyPayment);

module.exports = router;
