// src/js/listPage.js
import { loadPage } from './navigation.js';
import { playVideo } from './videoPlayer.js';

export function initListPage() {
  console.log("initListPage");
  const videoListEl = document.getElementById('videoList');
  if (!videoListEl) return;

  // window.videoAPI は preload.js で公開済み
  if (window.videoAPI && typeof window.videoAPI.getVideoData === 'function') {
    window.videos = window.videoAPI.getVideoData() || [];
  } else {
    window.videos = [];
  }

  videoListEl.innerHTML = ''; // 既存のリストをクリア

  window.videos.forEach((vid, idx) => {
    const item = document.createElement('div');
    item.classList.add('video-item');

    const thumb = document.createElement('img');
    thumb.src = vid.thumbnail || '';
    thumb.alt = vid.title || '';

    const title = document.createElement('p');
    title.classList.add('video-title');
    title.textContent = vid.title || '(No Title)';

    item.appendChild(thumb);
    item.appendChild(title);

    item.addEventListener('click', () => {
      playVideo(idx);
      loadPage('player');
    });
    videoListEl.appendChild(item);
  });
}
