const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'halt', 
  database: 'insta'
});

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('media'), (req, res) => {
  const file = req.file;
  if (!file) return res.json({ success: false, error: "No file" });
  const type = file.mimetype;
  db.query(
    'INSERT INTO media (filename, type) VALUES (?,?)',
    [file.filename, type],
    err => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    });
});

app.get('/api/gallery', (req, res) => {
  db.query('SELECT * FROM media ORDER BY id DESC', (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

app.post('/api/like/:id', (req, res) => {
  const id = req.params.id;
  db.query('UPDATE media SET likes = likes + 1 WHERE id=?', [id], err => {
    if (err) return res.json({ success: false });
    db.query('SELECT likes FROM media WHERE id=?', [id], (err, rows) => {
      res.json({ success: true, likes: rows[0].likes });
    });
  });
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));