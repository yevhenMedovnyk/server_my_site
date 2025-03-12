const express = require('express');
const router = express.Router();
const Image = require('../model/image.model.js');

// Отримати всі зображення в альбомі
router.get('/all-images-in-album', (req, res) => {
  const albumId = req.query.albumId;

  Image.find({ album_id: albumId })
    .then(images => res.send(images))
    .catch(err => res.status(400).json('Error: ' + err));
});

//Отримати ID зображення в альбомі
router.get('/image-id-in-album', async (req, res) => {
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

// Отримати зображення за ID
router.get('/image-by-id', async (req, res) => {
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

// Завантажити нове зображення
router.post('/upload-image', async (req, res) => { 
  const body = req.body;

  try {
    const newImage = await Image.create(body);
    res.status(201).json({message : 'Image uploaded'});
  } catch (error) {
    res.status(400).json({message : error.message});
  }
});

// Видалити зображення
router.delete('/delete-image', async (req, res) => {
  const imageId = req.query.imageId;
  try {
    const deletedImage = await Image.findByIdAndDelete(imageId );
    res.status(200).json({message : 'Image deleted'});
  } catch (error) {
    res.status(400).json({message : error.message});
  }
});

module.exports = router;
