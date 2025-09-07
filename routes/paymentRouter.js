const express = require("express");
const { createOrder, validateOrder } = require("../controllers/paymentController");

const router = express.Router();

router.post("/order", createOrder);
router.post("/order/validate", validateOrder);

module.exports = router;
