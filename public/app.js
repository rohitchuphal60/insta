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
            <button class="delete-btn" onclick="deleteMedia(${item.id})">🗑️ Delete post</button>
          </div>
          <div class="comments" id="comments-${item.id}"></div>
          <form class="comment-form" data-id="${item.id}">
            <input type="text" placeholder="Add a comment..." required>
            <button type="submit">Send</button>
          </form>
        `;
        gallery.appendChild(card);
        fetchComments(item.id);
      });

      // Attach comment event listeners
      document.querySelectorAll('.comment-form').forEach(form => {
        form.onsubmit = function(e) {
          e.preventDefault();
          const mediaId = form.getAttribute('data-id');
          const input = form.querySelector('input');
          const text = input.value.trim();
          if (!text) return;
          fetch(`/api/comments/${mediaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                fetchComments(mediaId);
                input.value = '';
              }
            });
        };
      });
    });
}

function fetchComments(mediaId) {
  fetch(`/api/comments/${mediaId}`)
    .then(res => res.json())
    .then(data => {
      const commentsDiv = document.getElementById(`comments-${mediaId}`);
      if (!commentsDiv) return;
      commentsDiv.innerHTML = '<b>Comments:</b>';
      data.forEach(comment => {
        const p = document.createElement('p');
        p.innerHTML = `${comment.text} <button class="delete-comment-btn" onclick="deleteComment(${comment.id}, ${mediaId})">🗑️</button>`;
        commentsDiv.appendChild(p);
      });
    });
}

function deleteComment(commentId, mediaId) {
  if (!confirm('Delete this comment?')) return;
  fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.success) fetchComments(mediaId);
    });
}

function deleteMedia(mediaId) {
  if (!confirm('Delete this post?')) return;
  fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.success) fetchGallery();
    });
}

// ... rest remains unchanged
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