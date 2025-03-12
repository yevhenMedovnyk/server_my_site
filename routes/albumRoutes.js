const express = require('express');
const router = express.Router();
const Image_album = require('../model/image_album.model.js');


// Отримати всі альбоми
router.get('/', (req, res) => {
  Image_album.find()
    .then(albums => res.send(albums))
    .catch(err => res.status(400).json('Error: ' + err));
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
router.post('/create-album', async (req, res) => {
  const body = req.body;

  try {
    const newAlbum = await Image_album.create(body);
    res.status(201).json(newAlbum);
  } catch (error) {
    res.status(400).json({message : error.message});
  }
});

// Оновити альбом
router.put('/update-album', async (req, res) => {
  const { albumId, name, link, cover_img } = req.body;

  try {
    if (!albumId) {
      return res.status(400).json({ message: "AlbumId is required" });
    }

    const album = await Image_album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    album.name = name || album.name;
    album.link = link || album.link;
    album.cover_img = cover_img || album.cover_img;

    await album.save();

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// Видалити альбом
router.post('/delete-album', async (req, res) => {
  const albumId = req.query.albumId;
  try {
    const deletedAlbum = await Image_album.findByIdAndDelete(albumId );
    res.status(200).json(deletedAlbum);
  } catch (error) {
    res.status(400).json({message : error.message});
  }
});

module.exports = router;
