const express = require('express');
const router = express.Router();
const Image_album = require('../model/image_album.model.js');
const Image = require('../model/image.model.js');
const cloudinary = require('../cloudinaryConfig');
const verifyAdmin = require('../middlewares/verifyAdmin.cjs');

const { getPublicIdFromUrl } = require('../utils/getPublicIdFromUrl.js');
const { default: slugify } = require('slugify');


// Отримати всі альбоми
router.get('/', (req, res) => {
	const category = req.query.category;

	if (category) {
		Image_album.find({ category: category })
			.then(albums => res.send(albums))
			.catch(err => res.status(400).json('Error: ' + err));
		return;
	}
});

// Отримати конкретний альбом
router.get('/album', async (req, res) => {
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

// Створити новий альбом
router.post('/create-album', verifyAdmin, async (req, res) => {
	const body = req.body;
	const nameEn = body?.name?.en;

  if (!nameEn) {
    return res.status(400).json({ message: "Album name is required" });
  }

  let baseSlug = slugify(nameEn, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // Перевіряємо унікальність slug
  while (await Image_album.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  try {
    const newAlbum = await Image_album.create({...body, "slug": slug});
    res.status(201).json(newAlbum);
  } catch (error) {
    res.status(400).json({message : error.message});
  }
});

// Оновити альбом
router.put('/update-album', verifyAdmin, async (req, res) => {
	const { albumId, name, category, cover_img} = req.body;
	const nameEn = name?.en;
	if (!nameEn) return res.status(400).json({ message: "Album name is required" });
	let baseSlug = slugify(nameEn, { lower: true, strict: true });
	let slug = baseSlug;
	let counter = 1;

	while (await Image_album.findOne({ slug, _id: { $ne: albumId } })) {
  	slug = `${baseSlug}-${counter++}`;
	}

  try {
    if (!albumId) {
      return res.status(400).json({ message: "AlbumId is required" });
    }

    const album = await Image_album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    album.name = name ?? album.name;
		album.category = category ?? album.category;
		album.cover_img = cover_img ?? album.cover_img;
		album.slug = slug;

    await album.save();

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});


router.post('/delete-album', verifyAdmin, async (req, res) => {
  const albumId = req.query.albumId;

  try {
    if (!albumId) {
      return res.status(400).json({ message: "albumId is required" });
    }

    // Знайти всі зображення альбому
		const images = await Image.find({album_id: albumId });

    // Видалити з Cloudinary усі зображення альбому
    for (const img of images) {
			const publicId = getPublicIdFromUrl(img.img);
			
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Видалити всі зображення з MongoDB
    await Image.deleteMany({ album_id: albumId });

    // Видалити альбом
    const deletedAlbum = await Image_album.findByIdAndDelete(albumId);

    if (!deletedAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.status(200).json({ message: "Album and related images deleted", album: deletedAlbum });
  } catch (error) {
    console.error("Delete album error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
