const { supabase } = require('../utils/supabaseClient');

async function getOrders(req, res) {
	try {
		console.log("call aayi")
		const { data, error } = await supabase
			.from('orders')
			.select('*')
			.order('order_date', { ascending: false });
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		return res.json(data || []);
		
	} catch (err) {
		return res.status(500).json({ error: 'Unexpected server error' });
	}
}

async function getOrderLines(req, res) {
	try {
		const { orderId, orderIds } = req.query;
		if (!orderId && !orderIds) {
			return res.status(400).json({ error: 'orderId or orderIds is required' });
		}
		let query = supabase
			.from('order_details')
			.select('id, order_id, product_id, quantity, product:products(*)');
		if (orderId) {
			query = query.eq('order_id', orderId);
		}
		if (orderIds) {
			const orderIdArray = String(orderIds)
				.split(',')
				.map(v => v.trim())
				.filter(Boolean);
			query = query.in('order_id', orderIdArray);
		}
		const { data, error } = await query;
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		return res.json(data || []);
	} catch (err) {
		return res.status(500).json({ error: 'Unexpected server error' });
	}
}

module.exports = {
	getOrders,
	getOrderLines,
};


