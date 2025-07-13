const express = require('express');
const router = express.Router();
const Order = require('../model/order.model.js');
const verifyAdmin = require('../middlewares/verifyAdmin.cjs');
const sendMail = require('../utils/sendMail.js');

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

// Додати/редагувати ТТН до замовлення
router.put('/update-order', verifyAdmin, async(req, res) => {
	const order_id = req.body.order_id;
	const tracking_number = req.body.tracking_number;
	try {
		const order = await Order.findById(order_id);
		order.tracking_number = tracking_number;
		await order.save();
		res.json(order);
		sendMail({
			emailTo: order.mainClientInfo.email,
			name: order.mainClientInfo.first_name,
			subject: 'Ваше замовлення відправлено',
			templateName: 'addTrackingNumberMessage',
			context: {
				order
			}
		})
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})

module.exports = router;
