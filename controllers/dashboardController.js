const { supabase } = require('../utils/supabaseClient');

async function getProducts(req, res) {
	try {
		const { id } = req.query;
		let query = supabase.from('Products').select('*');
		if (id != null) {
			query = query.eq('id', id);
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

async function createProduct(req, res) {
	try {
		const formData = req.body;
		const payload = {
			Name: formData.Name,
			created_at: new Date().toISOString(),
			image: formData.image,
			description: formData.description,
			price: formData.price,
			category: formData.category,
			shipping: formData.shipping,
			featured: formData.featured
		};
		const { data, error } = await supabase.from('Products').insert([payload]);
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(201).json(data || []);
	} catch (err) {
		return res.status(500).json({ error: 'Unexpected server error' });
	}
}

async function updateProduct(req, res) {
	try {
		const { id } = req.params;
		const formData = req.body;
		const payload = {
			Name: formData.Name,
			created_at: new Date().toISOString(),
			image: formData.image,
			description: formData.description,
			price: formData.price,
			category: formData.category,
			shipping: formData.shipping,
			featured: formData.featured
		};
		const { data, error } = await supabase
			.from('Products')
			.update([payload])
			.eq('id', id);
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		return res.json(data || []);
	} catch (err) {
		return res.status(500).json({ error: 'Unexpected server error' });
	}
}

async function deleteProduct(req, res) {
	try {
		const { id } = req.params;
		const { error } = await supabase
			.from('Products')
			.delete()
			.eq('id', id);
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(204).send();
	} catch (err) {
		return res.status(500).json({ error: 'Unexpected server error' });
	}
}

module.exports = {
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct,
};


