const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
require("dotenv").config(); 
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(express.json({ limit: '15mb' }));

const PORT = process.env.PORT;


const Image = require('./model/image.model.js');
const Gallery_folder = require('./model/gallery_folder.model.js');

app.get('/gallery', (req, res) => {
	const albumId = req.query.albumId;

	Image.find({ folder_id: albumId })
		.then(images => res.send(images))
		.catch(err => res.status(400).json('Error: ' + err));
});

app.get('/', (req, res) => {
	Gallery_folder.find()
		.then(folders => res.send(folders))
		.catch(err => res.status(400).json('Error: ' + err));
});

app.post('/gallery/uploads', async (req, res) => { 
	const body = req.body;

	try {
		const newImage = await Image.create(body);
		res.status(201).json({message : 'Image uploaded'});
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})





mongoose.connect(process.env.MONGO_CONNECTION_STRING)
	.then(() => {
		app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
});
		
})
	.catch(err => console.log(err));


