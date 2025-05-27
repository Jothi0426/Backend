const multer = require('multer');
const pool = require('../db');

// Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const createProfile = async (req, res) => {
  const { firstName, lastName, gender, birthday, goal } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Photo is required. Please upload a profile image.',
    });
  }

  const photo = req.file.filename;

  try {
    const result = await pool.query(
      `INSERT INTO profiles 
      (first_name, last_name, gender, birthday, goal, photo, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [firstName, lastName, gender, birthday, goal, photo]
    );

    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error('❌ DB Insert Error:', err);
    res.status(500).json({ success: false, error: 'Error saving profile' });
  }
};

module.exports = { upload, createProfile };
