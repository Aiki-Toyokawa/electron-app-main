// src/js/footer-player.js
import { updateProgress } from './common.js';
import { loadPage } from './navigation.js';

export function playVideo(index) {
  // window.selectedMedia が設定されている場合、その動画を再生
  if (window.selectedMedia) {
    const media = window.selectedMedia;
    delete window.selectedMedia;  // 一度使用したら削除
    if (!window.globalVideo) {
      window.globalVideo = document.createElement('video');
      window.globalVideo.id = 'globalVideo';
      window.globalVideo.preload = 'auto';
      window.globalVideo.playsInline = true;
      window.globalVideo.controls = false;
      window.globalVideo.style.display = 'none';
      document.getElementById('hiddenHolder').appendChild(window.globalVideo);
      initVideoEvents();
    }
    if (window.globalVideo.src !== media.mediaPath) {
      window.globalVideo.src = media.mediaPath;
      window.globalVideo.load();
    }
    document.getElementById('footerThumbnail').src = media.mediaThumbnail || '';
    document.getElementById('footerTitle').textContent = media.mediaName || '(No Title)';
    document.getElementById('footer').style.display = 'flex';
    window.globalVideo.play().catch(err => console.warn("play error:", err));
    return;
  }
  
  // 既存の処理（window.videos からの再生）
  if (!window.videos[index]) return;
  if (index === window.currentIndex) return;
  window.currentIndex = index;
  const vid = window.videos[index];
  
  if (!window.globalVideo) {
    window.globalVideo = document.createElement('video');
    window.globalVideo.id = 'globalVideo';
    window.globalVideo.preload = 'auto';
    window.globalVideo.playsInline = true;
    window.globalVideo.controls = false;
    window.globalVideo.style.display = 'none';
    document.getElementById('hiddenHolder').appendChild(window.globalVideo);
    initVideoEvents();
  }
  
  if (window.globalVideo.src !== vid.src) {
    window.globalVideo.src = vid.src;
    window.globalVideo.load();
  }
  document.getElementById('footerThumbnail').src = vid.thumbnail || '';
  document.getElementById('footerTitle').textContent = vid.title || '(No Title)';
  document.getElementById('footer').style.display = 'flex';
  window.globalVideo.play().catch(err => console.warn("play error:", err));
}

export function initVideoEvents() {
  const playPauseBtn = document.getElementById('playPauseBtn');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const seekBar = document.getElementById('seekBar');
  const volumeSlider = document.getElementById('volumeSlider');

  playPauseBtn.addEventListener('click', () => {
    if (window.globalVideo.paused) window.globalVideo.play().catch(e => console.warn(e));
    else window.globalVideo.pause();
  });
  window.globalVideo.addEventListener('play', () => {
    playPauseBtn.textContent = '⏸';
    requestAnimationFrame(updateProgress);
  });
  window.globalVideo.addEventListener('pause', () => {
    playPauseBtn.textContent = '⏵︎';
  });
  nextBtn.addEventListener('click', () => {
    if (window.currentIndex < window.videos.length - 1) {
      playVideo(window.currentIndex + 1);
    }
  });
  prevBtn.addEventListener('click', () => {
    if (window.currentIndex > 0) {
      playVideo(window.currentIndex - 1);
    }
  });
  seekBar.addEventListener('input', () => {
    window.isSeeking = true;
    const val = (seekBar.value / 100) * (window.globalVideo.duration || 0);
    window.globalVideo.currentTime = val;
  });
  seekBar.addEventListener('change', () => {
    window.isSeeking = false;
  });
  volumeSlider.addEventListener('input', () => {
    window.globalVideo.volume = volumeSlider.value;
  });
}
