const express = require('express');
const router = express.Router();
const { getOrders, getOrderLines } = require('../controllers/analyticsController');

router.get('/orders', getOrders);
router.get('/order-lines', getOrderLines);

module.exports = router;


