const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sendOrderEmail, sendOrderEmailtoCustomer } = require("../emailService");
const { createOrderWithDetails } = require("../handlers/orderHandler");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createOrder(req, res) {
  try {
    const options = req.body;
    const order = await razorpay.orders.create(options);
    if (!order) return res.status(404).send("Error");
    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).send("err");
  }
}

// ✅ Validate order
async function validateOrder(req, res) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      customerName,
      email,
      address,
      contact,
      items,
      amount,
    } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(404).json({ msg: "Transaction is not Legit" });
    }
    // ✅ Here you can populate DB with order details before sending emails
    // Example: await db.orders.insert({ ... })
        const orderData = await createOrderWithDetails({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      totalAmount: amount,
      items, // array of { product_id, quantity }
    });
    console.log("Returned from createOrderWithDetails", orderData);

    // Send emails
    await sendOrderEmail({
      customerName,
      email,
      address,
      items,
      amount,
      razorpay_payment_id,
      razorpay_order_id,
    });

    const orderDetails = {
      customerName,
      email,
      items,
      amount,
      address,
      orderId: razorpay_order_id,
      razorpay_payment_id,
    };
    await sendOrderEmailtoCustomer(orderDetails);

    res.json({
      msg: "success",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Error validating payment:", err);
    res.status(500).json({ msg: err.message });
  }
}

module.exports = { createOrder, validateOrder };
