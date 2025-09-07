const { supabase } = require('../utils/supabaseClient');

async function createOrderWithDetails({ orderId, paymentId, totalAmount, items }) {
  const orderDate = new Date();

  // 1️⃣ Insert into 'orders'
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        order_id: orderId,
        payment_id: paymentId,
        total_amount: totalAmount,
        delivery_status: 'pending',
        order_date: orderDate,
        estimated_delivery_date: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 days
        delivery_date: null, // will be updated when delivered
      },
    ])
    .select()
    .single();
    console.log(orderError);

  if (orderError) throw new Error(orderError.message);

  // 2️⃣ Prepare order_details
  const orderDetailsArray = items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.qty,
  }));

  // 3️⃣ Insert into 'order_details'
  const { data: detailsData, error: detailsError } = await supabase
    .from('order_details')
    .insert(orderDetailsArray);
    console.log("d");
    console.log(detailsError);

  if (detailsError) throw new Error(detailsError.message);

  return { order: orderData, orderDetails: detailsData };
}

// 4️⃣ Optional: function to mark order as delivered
async function markOrderAsDelivered(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      delivery_status: 'delivered',
      delivery_date: new Date(),
    })
    .eq('order_id', orderId);

  if (error) throw new Error(error.message);
  return data;
}

module.exports = { createOrderWithDetails, markOrderAsDelivered };
