const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('nodemailer-express-handlebars').default;

dotenv.config(); // Завантаження змінних середовища

// 🔹 Налаштування транспорту для Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

// 🔹 Налаштування шаблонів Handlebars
transporter.use(
    'compile',
    hbs({
        viewEngine: {
            extname: '.hbs',
            partialsDir: path.join(__dirname, '../views/partials'),
            defaultLayout: false,
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
				},
						helpers: {
							multiply: (a, b) => a * b
						},
        },
       		 viewPath: path.join(__dirname, '../views'),
        	extName: '.hbs',
		})
);

/**
 * Відправлення email
 * @param {Object} options - Опції для відправки
 * @param {string} options.email - Email відправника
 * @param {string} options.name - Ім'я відправника
 * @param {string} [options.message=''] - Повідомлення
 * @param {string} [options.subject='YM | Contact Form Message'] - Тема листа
 * @param {string} [options.templateName='contactFormMessage'] - Назва шаблону
 * @param {Object} [options.context={}] - Контекст для шаблону
 * @param {string} [options.emailTo] - Email отримувача
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
const sendMail = async ({ email, name, message , subject = 'YM | Contact Form Message', templateName = 'contactFormMessage', context = {}, emailTo }) => {
    try {
        //if (!email || !name) {
        //    throw new Error('Email і Name є обов’язковими полями');
        //}

        // 🔹 Очищення вхідних даних
        const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
        const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
        const cleanMessage = sanitizeHtml(message || '', { allowedTags: [], allowedAttributes: {} });

        // 🔹 Налаштування email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            replyTo: emailTo ? process.env.GMAIL_USER : cleanEmail,
            to: emailTo || process.env.GMAIL_USER,
            subject,
            template: templateName,
						context: {
								...(templateName === 'contactFormMessage'
								? { name: cleanName, email: cleanEmail, message: cleanMessage }
								: context),
},
				};

        // 🔹 Відправлення email
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = sendMail;
