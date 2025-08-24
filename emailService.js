// emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Setup transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.OWNER_EMAIL,
    pass: process.env.OWNER_APP_PASSWORD, 
  },
});


async function sendOrderEmail({ customerName, email, address, items, amount, razorpay_payment_id, razorpay_order_id }) {
  return transporter.sendMail({
    from: process.env.OWNER_EMAIL,
    to: process.env.OWNER_EMAIL,
    subject: `🛒 New Order from ${customerName}`,
    html: `
      <h2>✅ New Order Received</h2>
      <p><b>Customer:</b> ${customerName}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Address:</b> ${address}</p>
      <p><b>Amount Paid:</b> ₹${amount}</p>
      <p><b>Items:</b></p>
      <ul>
        ${items.map((i) => `<li>${i.name} x ${i.qty}</li>`).join("")}
      </ul>
      <p><b>Payment ID:</b> ${razorpay_payment_id}</p>
      <p><b>Order ID:</b> ${razorpay_order_id}</p>
    `,
  });
}

module.exports = { sendOrderEmail };
