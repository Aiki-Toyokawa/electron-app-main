// src/js/playerPage.js
import { loadPage } from './navigation.js';

export function initPlayerPage() {
  console.log("initPlayerPage");
  const playerContainer = document.getElementById('playerContainer');
  const backBtn = document.getElementById('backToList');
  if (!playerContainer || !backBtn) return;

  if (window.globalVideo && window.currentIndex >= 0) {
    playerContainer.appendChild(window.globalVideo);
    window.globalVideo.style.display = 'block';
    window.globalVideo.controls = true;
  }
  backBtn.addEventListener('click', () => {
    loadPage('list');
  });
}
