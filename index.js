const express=require("express");
const cors=require("cors");
const crypto=require("crypto");
const Razorpay=require("razorpay");

require("dotenv").config()
const app=express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:false}))
const { sendOrderEmail , sendOrderEmailtoCustomer} = require("./emailService");
const dashboardRouter = require('./routes/dashboardRouter');
const analyticsRouter = require('./routes/analyticsRouter');
const paymentRouter = require("./routes/paymentRouter");
const PORT= process.env.PORT || 3000;
console.log(PORT);
app.get('/',(req,res)=>{
    res.send("HI FROM SERVER")  //;

})

// New API routes (proxy to Supabase)
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use("/", paymentRouter);




// //PAYMENT LOGIC BELOW THIS HANDLE WITH CARE

// app.post('/order',async(req,res)=>{
//     try{
//     const razorpay=new Razorpay({
//         key_id:process.env.RAZORPAY_KEY_ID,
//         key_secret:process.env.RAZORPAY_KEY_SECRET,

//     })
//  const options=req.body;
//  const order=await razorpay.orders.create(options);
//  if(!order){

//     return res.status(404).send("Error");
//  }

//  res.json(order);
// }
// catch(err){
//     res.send("err");
//     console.log(err);
// }
 
    
// })
// app.post('/order/validate',async(req,res)=>{
// const {
//   razorpay_payment_id,
//   razorpay_order_id,
//   razorpay_signature,
//   customerName,
//   email,
//   address,
//   contact,
//   items,
//   amount
// } = req.body;
//     const sha=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET);
//     sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//     const digest=sha.digest("hex");
//     console.log(digest);
//     console.log(razorpay_signature);
//     if(digest!==razorpay_signature){
//         return res.status(404).json({msg:"Transaction is not Legit"});
//     }
//         await sendOrderEmail({
//       customerName,
//       email,
//       address,
//       items,
//       amount,
//       razorpay_payment_id,
//       razorpay_order_id,
//     });
//     const orderDetails = {
//       customerName,
//       email,
//       items, 
//       amount,
//       address,
//       orderId: razorpay_order_id,
//       razorpay_payment_id
//     };
// await sendOrderEmailtoCustomer(orderDetails)

//     res.json({
//         msg:"success",
//         orderId:razorpay_order_id,
//         paymentId:razorpay_payment_id,
//     })
    
// })
app.listen(PORT,()=>{
    console.log("hi");
})