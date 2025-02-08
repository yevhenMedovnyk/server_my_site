const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	displayName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	uid: {
		type: String,
		required: true
	},
	isAdmin: {
		type: Boolean,
		required: true
	}
});
module.exports = mongoose.model('user', userSchema);