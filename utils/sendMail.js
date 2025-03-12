
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');
const dotenv = require('dotenv');

dotenv.config(); // Завантаження змінних середовища з .env

const sendMail = async ({ email, name, message }) => {
	try {
		if (!email || !name || !message) {
			throw new Error('All fields are required');
		}

		// 🔹 Очищення вхідних даних
		const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
		const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
		const cleanMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

		// 🔹 Налаштування транспорту для Gmail
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.GMAIL_USER, // Email акаунту
				pass: process.env.GMAIL_PASSWORD, // Пароль (App Password)
			},
		});

		const mailOptions = {
			from: process.env.GMAIL_USER,
			replyTo: cleanEmail,
			to: process.env.GMAIL_USER, // Отримувач (твій email)
			subject: `YM | Contact Form Message`,
			text: `Name: ${cleanName}\nEmail: ${cleanEmail}\nMessage: ${cleanMessage}`,
		};

		// 🔹 Відправлення email
		const info = await transporter.sendMail(mailOptions);
		console.log('✅ Email sent:', info.messageId);

		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error('❌ Email send error:', error);
		throw new Error('Failed to send email');
	}
};

module.exports = sendMail;
