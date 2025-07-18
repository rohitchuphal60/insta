const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Setup file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save in uploads/
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // unique file name
  }
});
const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'halt',
  database: 'insta'
});

// Get all posts
app.get('/posts', (req, res) => {
  db.query('SELECT * FROM posts ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Add a new post with file upload
app.post('/posts', upload.single('media'), (req, res) => {
  const caption = req.body.caption;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const media_url = `/uploads/${file.filename}`;
  db.query('INSERT INTO posts (image_url, caption) VALUES (?, ?)', [media_url, caption],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, image_url: media_url, caption, likes: 0 });
    });
});

// Like a post
app.post('/posts/:id/like', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT likes FROM posts WHERE id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ likes: rows[0].likes });
    });
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));