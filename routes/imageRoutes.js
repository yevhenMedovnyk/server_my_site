const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../cloudinaryConfig');
const Image = require('../model/image.model.js');
const { getPublicIdFromUrl } = require('../utils/getPublicIdFromUrl.js');
const verifyAdmin = require('../middlewares/verifyAdmin.cjs');


const storage = multer.memoryStorage();
const upload = multer({ storage });

//Завантажити зображення

router.post('/upload-image', verifyAdmin, upload.array('images'), async (req, res) => {
  const files = req.files;
	const albumId = req.body.album_id;

  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploaded = await cloudinary.uploader.upload(base64String, {
          folder: 'albums',
        });

        const image = new Image({
          name: file.originalname,
          img: uploaded.secure_url,
          album_id: albumId,
          width: uploaded.width,
          height: uploaded.height,
        });

        return await image.save();
      })
    );

    res.status(201).json({ message: 'Images uploaded', images: uploads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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

//// Завантажити нове зображення
//router.post('/upload-image', async (req, res) => { 
//  const body = req.body;

//  try {
//    const newImage = await Image.create(body);
//    res.status(201).json({message : 'Image uploaded'});
//  } catch (error) {
//    res.status(400).json({message : error.message});
//  }
//});

router.delete('/delete-image', verifyAdmin, async (req, res) => {
  const imageId = req.query.imageId;

  try {
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const publicId = getPublicIdFromUrl(image.img);
    if (!publicId) {
      return res.status(400).json({ message: 'Could not extract public_id from URL' });
    }

    await cloudinary.uploader.destroy(publicId);
    await Image.findByIdAndDelete(imageId);

    res.status(200).json({ message: 'Image deleted from MongoDB and Cloudinary' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//Додати опис зображення
router.post('/add-image-description', verifyAdmin, async (req, res) => {
	const imageId = req.body.imageId;
	const description = req.body.description;
	try {
		const image = await Image.findById(imageId);
		if (!image) {
			return res.status(404).json({ message: "Image not found" });
		}
		image.description = description;
		await image.save();
		res.status(200).json({message : 'Image description added'});
	} catch (error) {
		res.status(400).json({message : error.message});
	}
});

module.exports = router;
