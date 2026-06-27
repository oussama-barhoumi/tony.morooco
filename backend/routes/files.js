const router = require('express').Router();
const File = require('../models/File');

// GET /api/files/:id
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      // Fallback SVG placeholder
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#2a2a2a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#666">Image Not Found</text></svg>`;
      res.set('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }
    
    res.set('Content-Type', file.contentType);
    res.send(file.data);
  } catch (err) {
    res.status(500).send('Error retrieving file');
  }
});

module.exports = router;
