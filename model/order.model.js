const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    code_product: { type: String, required: true },
    name: { type: String, required: true },
    cnt: { type: Number, required: true },
    price: { type: Number, required: true }
});

const clientInfoSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true }
});

const deliveryRecipientInfo = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: false }
});

const orderSchema = new Schema({
	orderId: { type: String, required: true },
	generalStatus: { type: String, required: true },
	dateCreate: { type: String, required: true },
	delivery_method_desc: { type: String, required: true },
	deliveryRecipientInfo: { type: deliveryRecipientInfo, required: true },
	delivery_branch_address: { type: String, required: true },
	mainClientInfo: { type: clientInfoSchema, required: true },
	products: [productSchema],
	amount: { type: Number, required: true },
	clientCallback: { type: Boolean, required: false },
	comment: { type: String, required: false },
	tracking_number: {type: Number, required: false}
});

module.exports = mongoose.model('Order', orderSchema);