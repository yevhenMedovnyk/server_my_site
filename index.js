const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
require("dotenv").config(); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json({ limit: '100mb' }));

const PORT = process.env.PORT;


const Image = require('./model/image.model.js');
const Gallery_folder = require('./model/gallery_folder.model.js');


app.get('/', (req, res) => {
	Gallery_folder.find()
		.then(folders => res.send(folders))
		.catch(err => res.status(400).json('Error: ' + err));
});

app.get('/folder', async (req, res) => {
    const folderId = req.query.folderId;

    try {
        if (!folderId) {
            return res.status(400).json({ message: "folderId is required" });
        }

        const folder = await Gallery_folder.findById(folderId);

        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }

        res.json(folder);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

app.post('/create-folder', async (req, res) => { 
	const body = req.body;

	try {
		const newFolder = await Gallery_folder.create(body);
		res.status(201).json(newFolder);
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})

app.put('/update-folder', async (req, res) => {
    const { folderId, name, link, cover_img } = req.body;

    try {
        if (!folderId) {
            return res.status(400).json({ message: "folderId is required" });
        }

        const folder = await Gallery_folder.findById(folderId);

        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }

        // Оновлення даних альбому
        folder.name = name || folder.name;
        folder.link = link || folder.link;
        folder.cover_img = cover_img || folder.cover_img;

        await folder.save();

        res.json(folder);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
});



app.post('/delete-folder', async (req, res) => {
	const folderId = req.query.folderId;
	try {
		const deletedFolder = await Gallery_folder.findByIdAndDelete(folderId );
		res.status(200).json(deletedFolder);
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})

app.get('/gallery', (req, res) => {
	const albumId = req.query.albumId;

	Image.find({ folder_id: albumId })
		.then(images => res.send(images))
		.catch(err => res.status(400).json('Error: ' + err));
});

app.post('/gallery/upload-image', async (req, res) => { 
	const body = req.body;

	try {
		const newImage = await Image.create(body);
		res.status(201).json({message : 'Image uploaded'});
	} catch (error) {
		res.status(400).json({message : error.message});
	}
})

app.delete('/gallery/delete-image', async (req, res) => {
	const imageId = req.query.imageId;
	try {
		const deletedImage = await Image.findByIdAndDelete(imageId );
		res.status(200).json({message : 'Image deleted'});
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


