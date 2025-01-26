const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
	img: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	folder_id: {
		type: String,
		required: true
	},
	description: {
		type: String,
	},
});

module.exports = mongoose.model('Image', imageSchema);