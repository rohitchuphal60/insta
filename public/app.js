const API_URL = 'http://localhost:3000/posts';

// Load posts
function loadPosts() {
  fetch(API_URL)
    .then(res => res.json())
    .then(posts => {
      const postsDiv = document.getElementById('posts');
      postsDiv.innerHTML = '';
      posts.forEach(post => {
        let mediaTag = '';
        if (post.image_url.match(/\.(mp4|webm|ogg)$/)) {
          mediaTag = `<video width="100%" controls src="${post.image_url}"></video>`;
        } else {
          mediaTag = `<img src="${post.image_url}" alt="Post Image" />`;
        }
        postsDiv.innerHTML += `
          <div class="post">
            ${mediaTag}
            <p>${post.caption}</p>
            <button class="like-btn" onclick="likePost(${post.id}, this)">❤️ ${post.likes}</button>
          </div>
        `;
      });
    });
}
loadPosts();

// Add post
document.getElementById('postForm').onsubmit = function(e) {
  e.preventDefault();
  const formData = new FormData();
  const media = document.getElementById('media').files[0];
  const caption = document.getElementById('caption').value;
  formData.append('media', media);
  formData.append('caption', caption);

  fetch(API_URL, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(() => {
    loadPosts();
    document.getElementById('postForm').reset();
  });
};

// Like post
function likePost(id, btn) {
  fetch(`${API_URL}/${id}/like`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      btn.innerHTML = `❤️ ${data.likes}`;
    });
}const API_URL = 'http://localhost:3000/posts';

// Load posts
function loadPosts() {
  fetch(API_URL)
    .then(res => res.json())
    .then(posts => {
      const postsDiv = document.getElementById('posts');
      postsDiv.innerHTML = '';
      posts.forEach(post => {
        let mediaTag = '';
        if (post.image_url.match(/\.(mp4|webm|ogg)$/)) {
          mediaTag = `<video width="100%" controls src="${post.image_url}"></video>`;
        } else {
          mediaTag = `<img src="${post.image_url}" alt="Post Image" />`;
        }
        postsDiv.innerHTML += `
          <div class="post">
            ${mediaTag}
            <p>${post.caption}</p>
            <button class="like-btn" onclick="likePost(${post.id}, this)">❤️ ${post.likes}</button>
          </div>
        `;
      });
    });
}
loadPosts();

// Add post
document.getElementById('postForm').onsubmit = function(e) {
  e.preventDefault();
  const formData = new FormData();
  const media = document.getElementById('media').files[0];
  const caption = document.getElementById('caption').value;
  formData.append('media', media);
  formData.append('caption', caption);

  fetch(API_URL, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(() => {
    loadPosts();
    document.getElementById('postForm').reset();
  });
};

// Like post
function likePost(id, btn) {
  fetch(`${API_URL}/${id}/like`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      btn.innerHTML = `❤️ ${data.likes}`;
    });
}