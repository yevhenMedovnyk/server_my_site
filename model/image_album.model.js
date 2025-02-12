const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const image_albumSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	cover_img: {
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true
	}
});
module.exports = mongoose.model('image_album', image_albumSchema);