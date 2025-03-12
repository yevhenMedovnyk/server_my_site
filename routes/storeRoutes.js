const express = require('express');
const router = express.Router();
const StoreItem = require('../model/store_item.model.js');

router.get('/store-items', async (req, res) => {
		try {
				const storeItems = await StoreItem.find();
				res.json(storeItems);
		} catch (error) {
				res.status(500).json({ message: "Server error: " + error.message });
		}
})

router.get('/store-item-id', async (req, res) => { 
	try { 
		const storeItemsId = await StoreItem.find().select('_id imgs.width imgs.height');
		res.json(storeItemsId);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})
 
router.get('/store-item', async (req, res) => { 
	const product_id = req.query.product_id;

	try {
		const storeItem = await StoreItem.findById(product_id);
		res.json(storeItem);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})

module.exports = router;