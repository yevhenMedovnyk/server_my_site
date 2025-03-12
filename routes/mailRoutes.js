
const express = require('express');
const sendMail = require('../utils/sendMail');

const router = express.Router();

router.post('/send-mail', async (req, res) => {
	try {
		const response = await sendMail(req.body);
		res.status(200).json({ message: 'Message sent successfully!', messageId: response.messageId });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
