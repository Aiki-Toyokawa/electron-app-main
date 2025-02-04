// src/js/common.js
export function updateProgress() {
  const seekBar = document.getElementById('seekBar');
  const timeDisplay = document.getElementById('timeDisplay');
  if (!window.globalVideo.paused && !window.globalVideo.ended) {
    const pct = (window.globalVideo.currentTime / window.globalVideo.duration) * 100 || 0;
    if (!window.isSeeking) seekBar.value = pct;
    timeDisplay.textContent = formatTime(window.globalVideo.currentTime);
    requestAnimationFrame(updateProgress);
  } else {
    if (!window.isSeeking) {
      const pct = (window.globalVideo.currentTime / (window.globalVideo.duration || 1)) * 100 || 0;
      seekBar.value = pct;
    }
  }
}

export function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
