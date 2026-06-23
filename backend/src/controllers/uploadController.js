const { supabaseAdmin } = require('../config/supabase');

// This works with the `upload` middleware we already set up in config/multer.js
// The actual file is saved by Multer, and the URL is stored in the winner record.

// The controller is essentially the same as winnerController.uploadProof,
// but you can use this as a standalone generic upload.

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return file info
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};