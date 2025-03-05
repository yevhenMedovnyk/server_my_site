const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');


const crypto = require('crypto');
const cors = require('cors');
const app = express();


app.use(cors());

require("dotenv").config(); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json({ limit: '100mb' }));

const PORT = process.env.PORT;


const Image = require('./model/image.model.js');
const Image_album = require('./model/image_album.model.js');
const User = require('./model/user.model.js');
const StoreItem = require('./model/store_item.model.js');
const { default: axios } = require('axios');

const updateOrderStatus = require('./utils/updateOrderStatus.js');


app.get('/', (req, res) => {
	Image_album.find()
		.then(albums => res.send(albums))
		.catch(err => res.status(400).json('Error: ' + err));
});

app.get('/album', async (req, res) => {
    const albumId = req.query.albumId;

    try {
        if (!albumId) {
            return res.status(400).json({ message: "albumId is required" });
        }

        const album = await Image_album.findById(albumId);

        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        res.json(album);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

app.post('/create-album', async (req, res) => { 
	const body = req.body;

	try {
		const newAlbum = await Image_album.create(body);
		res.status(201).json(newAlbum);
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})

app.put('/update-album', async (req, res) => {
    const { albumId, name, link, cover_img } = req.body;

    try {
        if (!albumId) {
            return res.status(400).json({ message: "AlbumId is required" });
        }

        const album = await Image_album.findById(albumId);

        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        // Оновлення даних альбому
        album.name = name || album.name;
        album.link = link || album.link;
        album.cover_img = cover_img || album.cover_img;

        await album.save();

        res.json(album);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});



app.post('/delete-album', async (req, res) => {
	const albumId = req.query.albumId;
	try {
		const deletedAlbum = await Image_album.findByIdAndDelete(albumId );
		res.status(200).json(deletedAlbum);
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})

app.get('/album-gallery', (req, res) => {
	const albumId = req.query.albumId;

	Image.find({ album_id: albumId })
		.then(images => res.send(images))
		.catch(err => res.status(400).json('Error: ' + err));
});

app.get('/album-gallery/image-ids', async (req, res) => {
    const albumId = req.query.albumId;

    try {
        if (!albumId) {
            return res.status(400).json({ message: "albumId is required" });
        }

        const images = await Image.find({ album_id: albumId }).select('_id width height'); // ❗ Отримуємо тільки `imageId`
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

app.get('/album-gallery/image', async (req, res) => {
	const imageId = req.query.imageId;

	try {
		const image = await Image.findById(imageId);
		if (!image) {
			return res.status(404).json({ message: "Image not found" });
		}
		res.json(image);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
});


app.post('/album-gallery/upload-image', async (req, res) => { 
	const body = req.body;

	try {
		const newImage = await Image.create(body);
		res.status(201).json({message : 'Image uploaded'});
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})

app.delete('/album-gallery/delete-image', async (req, res) => {
	const imageId = req.query.imageId;
	try {
		const deletedImage = await Image.findByIdAndDelete(imageId );
		res.status(200).json({message : 'Image deleted'});
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})

app.get('/user', async(req, res) => {
	const uid = req.query.uid;

	try {
		const user = await User.findOne({ uid: uid });
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})

app.post('/user-create', async(req, res) => {
	const body = req.body;
	try {
		const user = await User.create(body);
		res.status(201).json(user);
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})


//Send mail
app.post('/send-mail', async (req, res) => {
	try {
		const { email, name, message } = req.body;

		// 🔹 Перевірка, чи всі поля заповнені
		if (!email || !name || !message) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// 🔹 Очищення вхідних даних від XSS (безпечна альтернатива escape)
		const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
		const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
		const cleanMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

		// 🔹 Налаштування транспорту для відправки пошти
		const transporter = nodemailer.createTransport({
			host: 'smtp.hostinger.com',
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL,
				pass: process.env.NODEMAILER_PASSWORD,
			}
		});

		const mailOptions = {
			from: process.env.EMAIL,
			replyTo: cleanEmail,
			to: process.env.EMAIL,
			subject: `YM | Contact Form Message`,
			text: 'Name: ' + cleanName + '\nEmail: ' + cleanEmail + '\nMessage: ' + cleanMessage,
		};

		// 🔹 Відправлення email
		const info = await transporter.sendMail(mailOptions);
		console.log('✅ Email sent:', info.messageId);

		res.status(200).json({
			message: 'Message sent successfully!',
			messageId: info.messageId,
		});
	} catch (error) {
		console.error('❌ Email send error:', error);
		res.status(500).json({ message: 'Failed to send email' });
	}
});


app.get('/store', async (req, res) => {
		try {
				const storeItems = await StoreItem.find();
				res.json(storeItems);
		} catch (error) {
				res.status(500).json({ message: "Server error: " + error.message });
		}
})

app.get('/store-item-ids', async (req, res) => { 
	try { 
		const storeItemsIds = await StoreItem.find().select('_id imgs.width imgs.height');
		res.json(storeItemsIds);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})
 
app.get('/store-item', async (req, res) => { 
	const product_id = req.query.product_id;

	try {
		const storeItem = await StoreItem.findById(product_id);
		res.json(storeItem);
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})


//Mono checkout
app.post('/checkout', async (req, res) => {
	try { 
		const body = req.body;
		const checkoutOrderBody = {
  "order_ref": "NhSI1WhoFTKn" + Date.now(),
  "amount": body.amount,
  "ccy": 980,
  "count": 1,
  "products": [
    {
      "name": body.name,
      "cnt": 1,
      "price": body.price,
      "code_product": body.code_product,
      //"code_checkbox": "3315974",
      "product_img_src": body.img
    }
  ],
  "dlv_method_list": [
    "np_brnm"
  ],
  "payment_method_list": [
    "card"
  ],
  "dlv_pay_merchant": false,
  "callback_url": "https://8c02-2a02-2378-1018-ef74-555c-ff60-bd3d-f64e.ngrok-free.app/callback",
  "return_url": "http://localhost:5173",
	"hold": true,
	"fl_recall": true
		}
		
		
		const newOrder = await axios.post(process.env.MONO_CHECKOUT_URL, checkoutOrderBody , {
			headers: {
				'Content-Type': 'application/json',
				'X-Token': process.env.MONO_CHECKOUT_TOKEN
			}
		});
		res.json(newOrder.data);
		console.log(newOrder.data);
		
	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})

 





const MONO_SECRET = process.env.MONO_CHECKOUT_TOKEN;

if (!MONO_SECRET) {
    console.error("❌ Помилка: MONO_SECRET не встановлено!");
    process.exit(1);
}

app.post('/callback', async (req, res) => {
    try {
        const signatureBase64 = req.headers['x-sign']; // Отримуємо підпис від MonoBank
        if (!signatureBase64) {
            return res.status(400).json({ message: "Missing X-Sign header" });
        }

        const body = JSON.stringify(req.body);
        console.log("🟡 Отриманий body:", body);

        // 🔹 Отримуємо відкритий ключ від MonoBank
        const response = await axios.get('https://api.monobank.ua/personal/checkout/signature/public/key', {
            headers: { 'X-Token': MONO_SECRET }
        });

        const publicKeyBase64 = response.data.key;
        if (!publicKeyBase64) {
            console.error("❌ Помилка: Не вдалося отримати публічний ключ!");
            return res.status(500).json({ message: "Failed to retrieve public key" });
        }

        console.log("🟢 Публічний ключ (Base64):", publicKeyBase64);

        // 🔹 Перетворюємо підпис і ключ у Buffer
        const signatureBuf = Buffer.from(signatureBase64, 'base64');
        const publicKeyBuf = Buffer.from(publicKeyBase64, 'base64');

        // 🔹 Перевіряємо підпис через ECDSA
        const verify = crypto.createVerify('sha256');
        verify.write(body);
        verify.end();

        const isValid = verify.verify(publicKeyBuf, signatureBuf);

        if (!isValid) {
            console.error("❌ Помилка: Недійсний підпис!");
            return res.status(401).json({ message: "Invalid signature" });
        }

        console.log("✅ Підпис валідний! Callback отримано:", req.body);

        const { orderId, generalStatus } = req.body;
        console.log(`🟡 order_ref: ${orderId}, status: ${generalStatus}`);

        // 🔹 Оновлення статусу замовлення
        try {
            switch (generalStatus) {
                case "success":
                    console.log(`✅ Замовлення ${orderId} успішно оплачене!`);
                    await updateOrderStatus(orderId, 'paid');
                    break;
                case "fail":
                    console.log(`❌ Замовлення ${orderId} НЕ оплачене.`);
                    await updateOrderStatus(orderId, 'failed');
                    break;
                case "hold":
                    console.log(`🔸 Замовлення ${orderId} на холді (очікування оплати).`);
                    await updateOrderStatus(orderId, 'on_hold');
                    break;
                case "refund":
                    console.log(`🔹 Замовлення ${orderId} повернене.`);
                    await updateOrderStatus(orderId, 'refunded');
                    break;
                default:
                    console.log(`ℹ️ Отримано статус ${generalStatus} для замовлення ${orderId}.`);
                    await updateOrderStatus(orderId, generalStatus);
                    break;
            }
        } catch (error) {
            console.error(`❌ Помилка при оновленні статусу замовлення ${orderId}:`, error.message);
        }

        res.status(200).json({ message: "Callback processed" });

    } catch (error) {
        console.error("❌ Помилка в обробці callback:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});










mongoose.connect(process.env.MONGO_CONNECTION_STRING)
	.then(() => {
		app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
});
		
})
	.catch(err => console.log(err));
