// src/app.js
import { initNavigation } from './js/navigation.js';
// 各ページ初期化用のモジュールは navigation.js 内で loadPage 呼出し時に import されるので
// app.js ではナビゲーションの初期化のみを行います。

document.addEventListener('DOMContentLoaded', () => {
  console.log("app.js: DOMContentLoaded fired.");

  // グローバル変数（必要に応じて window オブジェクトに登録）
  window.globalVideo = null;
  window.videos = [];
  window.currentIndex = -1;
  window.isSeeking = false;
  
  // 共通の DOM 要素（フッター等）をグローバルに保持する場合
  window.footer = document.getElementById('footer');
  window.footerThumbnail = document.getElementById('footerThumbnail');
  window.footerTitle = document.getElementById('footerTitle');
  window.prevBtn = document.getElementById('prevBtn');
  window.playPauseBtn = document.getElementById('playPauseBtn');
  window.nextBtn = document.getElementById('nextBtn');
  window.timeDisplay = document.getElementById('timeDisplay');
  window.seekBar = document.getElementById('seekBar');
  window.volumeSlider = document.getElementById('volumeSlider');
  window.hiddenHolder = document.getElementById('hiddenHolder');

  // ナビゲーション（各ページへの切り替え処理）の初期化
  initNavigation();
});
