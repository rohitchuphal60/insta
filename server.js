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
// Get comments for a media item
app.get('/api/comments/:mediaId', (req, res) => {
  db.query('SELECT * FROM comments WHERE media_id=? ORDER BY created_at DESC', [req.params.mediaId], (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

// Add a comment to a media item
app.post('/api/comments/:mediaId', express.json(), (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ success: false, error: 'No text provided' });
  db.query('INSERT INTO comments (media_id, text) VALUES (?, ?)', [req.params.mediaId, text], err => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true });
  });
});
// Delete a comment by its ID
app.delete('/api/comments/:commentId', (req, res) => {
  db.query('DELETE FROM comments WHERE id=?', [req.params.commentId], err => {
    if (err) return res.json({ success: false });
    res.json({ success: true });
  });
});

// Delete a post (media) by its ID
app.delete('/api/media/:mediaId', (req, res) => {
  // Get filename first to delete the file from disk
  db.query('SELECT filename FROM media WHERE id=?', [req.params.mediaId], (err, rows) => {
    if (err || rows.length === 0) return res.json({ success: false, error: 'Not found' });
    const filename = rows[0].filename;
    // Delete media record
    db.query('DELETE FROM media WHERE id=?', [req.params.mediaId], err2 => {
      if (err2) return res.json({ success: false });
      // Remove file from filesystem
      const filePath = path.join(__dirname, 'uploads', filename);
      fs.unlink(filePath, err3 => {
        // Ignore errors if file not found
        res.json({ success: true });
      });
    });
  });
});
app.listen(3000, () => console.log('Server running on http://localhost:3000'));