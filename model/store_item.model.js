const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeItemSchema = new Schema({
	code_product: { type: Number, required: true },
	name: { type: String, required: true },
	imgs: [{ img: String, name: String, width: Number, height: Number }],
	price: { type: Number, required: true },
	quantity: { type: Number, required: false },
	isLimited: { type: Boolean, required: true },
	paper_info: { type: String, required: true },
	size_with_borders: { type: String, required: true },
	size_without_borders: { type: String, required: true },
	captured_info: { type: String, required: true },
	note: { type: String, required: true },
});

module.exports = mongoose.model('store_item', storeItemSchema);