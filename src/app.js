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

  // プレイヤー以外の時に<video>を格納する隠しコンテナ
  const hiddenHolder = document.getElementById('hiddenHolder');

  let globalVideo = null;        // アプリ全体で1つだけの<video>
  let videos = [];               // 動画リスト
  let currentIndex = -1;         // 再生中の動画 (未選択は-1)
  let isSeeking = false;         // シーク操作中

  // ==========================
  // ページ切り替え
  // ==========================
  function loadPage(page) {
    switch (page) {
      case 'list':
      case 'url':
        // playerページではなくなるので、フッターを表示する(もし再生中なら)
        // かつ videoを hiddenHolder に戻して映像隠す
        if (globalVideo && hiddenHolder) {
          hiddenHolder.appendChild(globalVideo);
          globalVideo.style.display = 'none';
        }
        // 「再生中ならフッター表示」「何も再生していなければ非表示」
        if (currentIndex >= 0) {
          footer.style.display = 'flex';
        } else {
          footer.style.display = 'none';
        }

        // 読み込むページ(list or url)
        fetch(`pages/${page}.html`)
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            if (page === 'list') initListPage();
            else if (page === 'url') initUrlPage();
          })
          .catch(err => {
            console.error(err);
            content.innerHTML = `<h2>Error loading ${page} page</h2>`;
          });
        break;

      case 'player':
        // playerページはフッター非表示にしたい
        footer.style.display = 'none';

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
  // urlページ初期化
  // ==========================
  function initUrlPage() {
    const urlForm = document.getElementById('urlForm');
    if (!urlForm) return;
    urlForm.addEventListener('submit', e => {
      e.preventDefault();
      // URL入力関連
    });
  }

  // ==========================
  // playerページ初期化
  // ==========================
  function initPlayerPage() {
    const playerContainer = document.getElementById('playerContainer');
    const backBtn = document.getElementById('backToList');
    if (!playerContainer || !backBtn) return;

    // playerページに来たらフッター非表示 (もう済みだけど念のため)
    footer.style.display = 'none';

    // 映像を表示 (videoをplayerContainerへappend)
    if (globalVideo && currentIndex >= 0) {
      playerContainer.appendChild(globalVideo);
      globalVideo.style.display = 'block';
      // もしフッター操作だけだったら controls=false かもしれませんが
      // 今回は「playerページで動画の操作をしたい」→ controls=true
      globalVideo.controls = true;
    }

    backBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  // ==========================
  // 動画を再生 (同じ動画なら再ロードしない)
  // ==========================
  function playVideo(index) {
    if (!videos[index]) return;
    if (index === currentIndex) {
      // 既に同じ動画を再生中なら何もしない
      return;
    }
    currentIndex = index;
    const vid = videos[index];

    // 初回生成
    if (!globalVideo) {
      globalVideo = document.createElement('video');
      globalVideo.id = 'globalVideo';
      globalVideo.preload = 'auto';
      globalVideo.playsInline = true;
      // フッターで操作するなら controls=false, しかしplayerページで操作するならここをtrueでもOK
      // -> 今回は playerページに行く時に controls=true にしている
      globalVideo.controls = false;

      globalVideo.style.display = 'none';
      hiddenHolder.appendChild(globalVideo); 
      initVideoEvents();
    }

    // src切り替え
    if (globalVideo.src !== vid.src) {
      globalVideo.src = vid.src;
      globalVideo.load();
    }

    // フッター用の情報
    footerThumbnail.src = vid.thumbnail || '';
    footerTitle.textContent = vid.title || '(No Title)';

    // 再生開始
    globalVideo.play().catch(err => console.warn(err));
  }

  // ==========================
  // <video> イベント & フッター操作
  // ==========================
  function initVideoEvents() {
    // 再生/一時停止
    playPauseBtn.addEventListener('click', () => {
      if (globalVideo.paused) {
        globalVideo.play().catch(e => console.warn(e));
      } else {
        globalVideo.pause();
      }
    });
    globalVideo.addEventListener('play', () => {
      playPauseBtn.textContent = '⏸';
      updateProgress();
    });
    globalVideo.addEventListener('pause', () => {
      playPauseBtn.textContent = '⏵︎';
    });

    // 次/前
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

    // シーク
    seekBar.addEventListener('input', () => {
      isSeeking = true;
      const newTime = (seekBar.value / 100) * (globalVideo.duration || 0);
      globalVideo.currentTime = newTime;
    });
    seekBar.addEventListener('change', () => {
      isSeeking = false;
    });

    // 音量
    volumeSlider.addEventListener('input', () => {
      globalVideo.volume = volumeSlider.value;
    });
  }

  // ==========================
  // プログレスバー更新
  // ==========================
  function updateProgress() {
    if (!globalVideo.paused && !globalVideo.ended) {
      const pct = (globalVideo.currentTime / globalVideo.duration) * 100 || 0;
      if (!isSeeking) {
        seekBar.value = pct;
      }
      timeDisplay.textContent = formatTime(globalVideo.currentTime);
      requestAnimationFrame(updateProgress);
    } else {
      // 一時停止 or 終了
      if (!isSeeking) {
        const pct = (globalVideo.currentTime / (globalVideo.duration || 1)) * 100;
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
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
    });
  });

  // ==========================
  // 起動時にlistページ
  // ==========================
  loadPage('list');
});
