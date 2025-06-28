const express = require('express');
const router = express.Router();
const Order = require('../model/order.model.js');

// Отримати всі замовлення з БД
router.get('/get-orders', async(req, res) => {
	try {
		const orders = await Order.find();
		res.json(orders);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})

// Отримати конкретне замовлення з БД
router.get('/get-order', async(req, res) => {
	const order_id = req.query.order_id;
	try {
		const order = await Order.findById(order_id);
		res.json(order);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})

module.exports = router;
