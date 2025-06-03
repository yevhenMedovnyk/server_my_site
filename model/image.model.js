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
	album_id: {
		type: String,
		required: true
	},
	width: {
		type: Number,
		required: true
	},
	height: {
		type: Number,
		required: true
	},
	description: {
		type: String,
	}
});

module.exports = mongoose.model('Image', imageSchema);