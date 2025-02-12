const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeItemSchema = new Schema({
	id: { type: Number, required: true },
	name: { type: String, required: true },
	img: [{ type: Schema.Types.ObjectId, ref: 'ImageModel', required: true }],
	price: { type: Number, required: true },
	isLimited: { type: Boolean, required: true },
	paper_info: { type: String, required: true },
	size_with_borders: { type: String, required: true },
	size_without_borders: { type: String, required: true },
	captured_info: { type: String, required: true },
	note: { type: String, required: true },
});

module.exports = mongoose.model('StoreItem', storeItemSchema);