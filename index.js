const express=require("express");
const cors=require("cors");
const crypto=require("crypto");
const Razorpay=require("razorpay");
const { sendEmail } = require('./utils/mailer');

require("dotenv").config()
const app=express();

// Raw body for webhook signature verification must run BEFORE express.json
app.use('/webhook/razorpay', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:false}))
const PORT=process.env.REACT_APP_PORT_NUMBER;
console.log(PORT);
app.get('/',(req,res)=>{
    res.send("HI FROM SERVER")  //;

})

app.post('/order',async(req,res)=>{
    try{
    const razorpay=new Razorpay({
        key_id:process.env.RAZORPAY_KEY_ID,
        key_secret:process.env.RAZORPAY_KEY_SECRET,

    })
 const options=req.body;
 const order=await razorpay.orders.create(options);
 if(!order){

    return res.status(404).send("Error");
 }

 res.json(order);
}
catch(err){
    res.send("err");
    console.log(err);
}
 
    
})
app.post('/order/validate',async(req,res)=>{
    const {razorpay_payment_id,razorpay_order_id, razorpay_signature, customerEmail, customerName, orderDescription} = req.body;
    const sha=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest=sha.digest("hex");
    console.log(digest);
    console.log(razorpay_signature);
    if(digest!==razorpay_signature){
        return res.status(404).json({msg:"Transaction is not Legit"});
    }

    // Fetch payment details if customer info not provided
    let resolvedCustomerEmail = customerEmail;
    let resolvedCustomerName = customerName;
    try {
        if (!resolvedCustomerEmail || !resolvedCustomerName) {
            const rzp = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            const payment = await rzp.payments.fetch(razorpay_payment_id);
            resolvedCustomerEmail = resolvedCustomerEmail || payment.email || undefined;
            resolvedCustomerName = resolvedCustomerName || payment.notes?.name || payment.description || 'Customer';
        }
    } catch (e) {
        console.warn('Could not fetch payment for email/name enrichment', e?.message || e);
    }

    // Send emails (best-effort; do not block response on failures)
    const ownerEmail = process.env.OWNER_EMAIL;
    const appName = process.env.APP_NAME || 'Your Store';

    const ownerSubject = `${appName}: Payment received - ${razorpay_payment_id}`;
    const ownerHtml = `
        <h2>New Payment Received</h2>
        <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <p><strong>Customer:</strong> ${resolvedCustomerName || 'N/A'} (${resolvedCustomerEmail || 'N/A'})</p>
        <p><strong>Description:</strong> ${orderDescription || 'N/A'}</p>
    `;

    const customerSubject = `${appName}: Payment successful`;
    const customerHtml = `
        <h2>Thank you for your purchase!</h2>
        <p>Your payment was successful.</p>
        <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <p>${orderDescription || ''}</p>
    `;

    (async () => {
        try {
            if (ownerEmail) await sendEmail({ to: ownerEmail, subject: ownerSubject, html: ownerHtml, text: ownerHtml.replace(/<[^>]+>/g, '') });
        } catch (e) { console.warn('Owner email failed', e?.message || e); }
        try {
            if (resolvedCustomerEmail) await sendEmail({ to: resolvedCustomerEmail, subject: customerSubject, html: customerHtml, text: customerHtml.replace(/<[^>]+>/g, '') });
        } catch (e) { console.warn('Customer email failed', e?.message || e); }
    })();

    res.json({
        msg:"success",
        orderId:razorpay_order_id,
        paymentId:razorpay_payment_id,
    })
    
})

// Razorpay webhook for payment events
app.post('/webhook/razorpay', (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const expectedSignature = req.headers['x-razorpay-signature'];
        const payload = req.body; // Buffer due to express.raw from the app.use above

        const digest = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex');

        if (digest !== expectedSignature) {
            return res.status(400).send('Invalid signature');
        }

        // Parse JSON after signature validation
        const event = JSON.parse(payload.toString());
        console.log('Webhook event:', event.event);

        // Handle key events
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;
            const email = payment.email;
            const name = payment.notes?.name || payment.description || 'Customer';

            const ownerEmail = process.env.OWNER_EMAIL;
            const appName = process.env.APP_NAME || 'Your Store';

            const ownerSubject = `${appName}: Payment captured - ${paymentId}`;
            const ownerHtml = `
                <h2>Payment Captured (Webhook)</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
                <p><strong>Customer:</strong> ${name} (${email || 'N/A'})</p>
            `;

            const customerSubject = `${appName}: Payment receipt`;
            const customerHtml = `
                <h2>Payment received</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
                <p>Thank you for shopping with us.</p>
            `;

            (async () => {
                try { if (ownerEmail) await sendEmail({ to: ownerEmail, subject: ownerSubject, html: ownerHtml, text: ownerHtml.replace(/<[^>]+>/g, '') }); } catch (e) { console.warn('Owner email failed', e?.message || e); }
                try { if (email) await sendEmail({ to: email, subject: customerSubject, html: customerHtml, text: customerHtml.replace(/<[^>]+>/g, '') }); } catch (e) { console.warn('Customer email failed', e?.message || e); }
            })();
        }

        res.status(200).send('ok');
    } catch (err) {
        console.error('Webhook error', err);
        res.status(500).send('server error');
    }
});

app.listen(PORT,()=>{
    console.log("hi");
})