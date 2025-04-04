// src/js/page3-player.js
import { playVideo } from './footer-player.js';
import { loadPage } from './navigation.js';

export function initPlayerPage() {
  console.log("initPlayerPage");
  const playerContainer = document.getElementById('playerContainer');
  const backBtn = document.getElementById('backToList');
  if (!playerContainer || !backBtn) return;

  // もし window.selectedMedia が設定されていれば、その動画を再生する
  if (window.selectedMedia) {
    playVideo(); // playVideo() 内で window.selectedMedia を使って再生開始
  }
  
  // 強制的に globalVideo を playerContainer に移動して表示・コントロールを有効化
  if (window.globalVideo) {
    playerContainer.appendChild(window.globalVideo);
    window.globalVideo.style.display = 'block';
    window.globalVideo.controls = true;
  }
  
  // ※ここで footer を強制的に非表示にする
  document.getElementById('footer').style.display = 'none';
  
  backBtn.addEventListener('click', () => {
    loadPage('page1-list');
  });
}
