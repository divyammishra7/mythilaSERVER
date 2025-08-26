// emailService.js
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
require("dotenv").config();
 sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
async function sendOrderEmailtoCustomer(orderDetails) {
  try {
     const { customerName, email, items, amount, address, orderId, razorpay_payment_id } = orderDetails;
     const itemList = items.map(i => `<li>${i.name} x ${i.qty} - ₹${i.price}</li>`).join('');
    const msg = {
      to: email,
      from: 'mythila2021@gmail.com', // your verified single sender
      subject: `✅ Order Confirmation - Mythila`,
      html: `
        <h2>Hi ${customerName},</h2>
        <p>Thank you for your order! Here are the details:</p>
        <ul>${itemList}</ul>
        <p><strong>Total Paid:</strong> ₹${amount}</p>
        <p><strong>Delivery Address:</strong> ${address}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p>We’ll notify you once your order is shipped 🚀</p>
      `
    };

    await sgMail.send(msg);
    console.log("✅ Order confirmation email sent!");
  } catch (err) {
    console.error("❌ Error sending order email:", err.response?.body || err);
  }
}



module.exports = { sendOrderEmail, sendOrderEmailtoCustomer };
