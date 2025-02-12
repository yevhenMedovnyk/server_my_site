const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');

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




mongoose.connect(process.env.MONGO_CONNECTION_STRING)
	.then(() => {
		app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
});
		
})
	.catch(err => console.log(err));
