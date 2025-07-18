function fetchGallery() {
  fetch('/api/gallery')
    .then(res => res.json())
    .then(data => {
      const gallery = document.getElementById('gallery');
      gallery.innerHTML = '';
      data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'media-card';
        if (item.type.startsWith('image')) {
          card.innerHTML = `<img src="/uploads/${item.filename}" alt="media">`;
        } else {
          card.innerHTML = `<video controls src="/uploads/${item.filename}"></video>`;
        }
        card.innerHTML += `
          <div>
            <button class="like-btn" onclick="likeMedia(${item.id}, this)">❤️ ${item.likes}</button>
          </div>
        `;
        gallery.appendChild(card);
      });
    });
}
function likeMedia(id, btn) {
  fetch('/api/like/' + id, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.success) btn.innerHTML = `❤️ ${data.likes}`;
    });
}
document.getElementById('uploadForm').onsubmit = function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  fetch('/api/upload', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        fetchGallery();
        this.reset();
      } else {
        alert(data.error || 'Upload failed');
      }
    });
};
fetchGallery();