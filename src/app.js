// src/app.js
import { initNavigation } from './js/navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("app.js: DOMContentLoaded fired.");

  // グローバル変数の設定
  window.globalVideo = null;
  window.videos = [];
  window.currentIndex = -1;
  window.isSeeking = false;
  
  // 共通のDOM要素
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

  // ナビゲーション初期化
  initNavigation();

  // モーダル管理の初期化（index.htmlにモーダル要素を配置すること）
  modalManager.init();
});
