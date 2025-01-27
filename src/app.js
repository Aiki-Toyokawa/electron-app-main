document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const navLinks = document.querySelectorAll('nav a');

  // フッター要素
  const footer = document.getElementById('footer');
  const footerThumbnail = document.getElementById('footerThumbnail');
  const footerTitle = document.getElementById('footerTitle');
  const prevBtn = document.getElementById('prevBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const nextBtn = document.getElementById('nextBtn');
  const timeDisplay = document.getElementById('timeDisplay');
  const seekBar = document.getElementById('seekBar');
  const volumeSlider = document.getElementById('volumeSlider');

  // 隠しコンテナ (playerページ外で <video> を格納しておく)
  const hiddenHolder = document.getElementById('hiddenHolder');

  // アプリ全体で1つだけの<video>
  let sharedVideo = null;

  // 動画リストや状態
  let videos = [];
  let currentIndex = -1; // 未選択なら -1
  let isSeeking = false; // シーク操作中

  // ==========================
  // SPAページ切り替え
  // ==========================
  function loadPage(page) {
    switch(page) {
      case 'list':
        // playerから戻るとき、videoを隠しコンテナに戻す (映像非表示, 音は継続)
        if (sharedVideo && hiddenHolder) {
          hiddenHolder.appendChild(sharedVideo); // DOM再マウントだが同じ要素
          sharedVideo.style.display = 'none';    // 映像は非表示
        }
        fetch('pages/list.html')
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            initListPage();
          })
          .catch(err => {
            console.error(err);
            content.innerHTML = '<h2>Error loading list page</h2>';
          });
        break;

      case 'url':
        // 同様に player以外では隠しコンテナへ
        if (sharedVideo && hiddenHolder) {
          hiddenHolder.appendChild(sharedVideo);
          sharedVideo.style.display = 'none';
        }
        fetch('pages/url.html')
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            initUrlPage();
          })
          .catch(err => {
            console.error(err);
            content.innerHTML = '<h2>Error loading url page</h2>';
          });
        break;

      case 'player':
        // playerページへ行く場合、映像を表示したい
        fetch('pages/player.html')
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            initPlayerPage();
          })
          .catch(err => {
            console.error(err);
            content.innerHTML = '<h2>Error loading player page</h2>';
          });
        break;

      default:
        content.innerHTML = '<h2>404 Not Found</h2>';
        break;
    }
  }

  // ==========================
  // listページ初期化
  // ==========================
  function initListPage() {
    const videoListEl = document.getElementById('videoList');
    if (!videoListEl) return;

    // preload.js経由で動画一覧取得
    if (window.videoAPI && typeof window.videoAPI.getVideoData === 'function') {
      videos = window.videoAPI.getVideoData();
    } else {
      videos = [];
    }

    videos.forEach((vid, idx) => {
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
        // 再生開始 & playerページへ
        playVideo(idx);
        loadPage('player');
      });
      videoListEl.appendChild(item);
    });
  }

  // ==========================
  // playerページ初期化
  // ==========================
  function initPlayerPage() {
    const playerContainer = document.getElementById('playerContainer');
    const backBtn = document.getElementById('backToList');
    if (!playerContainer || !backBtn) return;

    // playerページへ来た時に、映像を表示状態にする
    // (まだcurrentIndexが-1なら動画選択なしで映像出さない)
    if (sharedVideo && currentIndex >= 0) {
      playerContainer.appendChild(sharedVideo);
      sharedVideo.style.display = 'block';  // 映像を表示
    }

    backBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  // ==========================
  // urlページ初期化
  // ==========================
  function initUrlPage() {
    const urlForm = document.getElementById('urlForm');
    if (!urlForm) return;
    urlForm.addEventListener('submit', e => {
      e.preventDefault();
      // ここでURL入力処理など
    });
  }

  // ==========================
  // 動画を再生 (同じ動画なら再ロードしない)
  // ==========================
  function playVideo(index) {
    if (!videos[index]) return;
    if (index === currentIndex) {
      // 既に同じ動画を再生中なら何もしない (シームレス)
      return;
    }
    currentIndex = index;
    const vid = videos[index];

    // sharedVideoが未生成なら作っておく
    if (!sharedVideo) {
      sharedVideo = document.createElement('video');
      sharedVideo.id = 'sharedVideo';
      sharedVideo.preload = 'auto';
      sharedVideo.playsInline = true;
      sharedVideo.controls = false; // フッターで操作する
      sharedVideo.style.display = 'none'; // 初期は非表示
      hiddenHolder.appendChild(sharedVideo); // 最初は隠しホルダーに
      initVideoEvents(); // イベント付与
    }

    // srcが違うならセット
    if (sharedVideo.src !== vid.src) {
      sharedVideo.src = vid.src;
      sharedVideo.load();
    }

    // フッターにサムネ/タイトル
    footerThumbnail.src = vid.thumbnail || '';
    footerTitle.textContent = vid.title || '(No Title)';

    // フッターを表示
    footer.style.display = 'flex';

    // 再生開始 (エラーは握りつぶし)
    sharedVideo.play().catch(err => console.warn('play error:', err));
  }

  // ==========================
  // <video> イベント & フッター操作初期化
  // ==========================
  function initVideoEvents() {
    // 再生/一時停止
    playPauseBtn.addEventListener('click', () => {
      if (sharedVideo.paused) {
        sharedVideo.play().catch(e => console.warn(e));
      } else {
        sharedVideo.pause();
      }
    });

    sharedVideo.addEventListener('play', () => {
      playPauseBtn.textContent = '⏸';
      updateProgress();
    });
    sharedVideo.addEventListener('pause', () => {
      playPauseBtn.textContent = '⏵︎';
    });

    // 次へ/前へ
    nextBtn.addEventListener('click', () => {
      if (currentIndex < videos.length - 1) {
        playVideo(currentIndex + 1);
      }
    });
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        playVideo(currentIndex - 1);
      }
    });

    // シークバー
    seekBar.addEventListener('input', () => {
      isSeeking = true;
      const newTime = (seekBar.value / 100) * (sharedVideo.duration || 0);
      sharedVideo.currentTime = newTime;
    });
    seekBar.addEventListener('change', () => {
      isSeeking = false;
    });

    // 音量
    volumeSlider.addEventListener('input', () => {
      sharedVideo.volume = volumeSlider.value;
    });
  }

  // ==========================
  // プログレスバー更新
  // ==========================
  function updateProgress() {
    if (!sharedVideo.paused && !sharedVideo.ended) {
      const pct = (sharedVideo.currentTime / sharedVideo.duration) * 100 || 0;
      if (!isSeeking) {
        seekBar.value = pct;
      }
      timeDisplay.textContent = formatTime(sharedVideo.currentTime);
      requestAnimationFrame(updateProgress);
    } else {
      // 一時停止 or 再生終了
      if (!isSeeking) {
        const pct = (sharedVideo.currentTime / (sharedVideo.duration || 1)) * 100;
        seekBar.value = pct;
      }
    }
  }
  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ==========================
  // ヘッダーのリンク
  // ==========================
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
    });
  });

  // ==========================
  // 起動時はlistページへ
  // ==========================
  loadPage('list');
});
