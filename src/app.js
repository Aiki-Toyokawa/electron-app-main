document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const navLinks = document.querySelectorAll('nav a');

  // フッターDOM
  const footer = document.getElementById('footer');
  // 共有動画要素
  const footerVideo = document.getElementById('sharedVideo');
  const footerThumbnail = document.getElementById('footerThumbnail');
  const footerTitle = document.getElementById('footerTitle');
  const prevButton = document.getElementById('prevButton');
  const playPauseButton = document.getElementById('playPauseButton');
  const nextButton = document.getElementById('nextButton');
  const footerProgressBar = document.getElementById('footerProgressBar');
  const footerCurrentTime = document.getElementById('footerCurrentTime');
  const footerDuration = document.getElementById('footerDuration');

  let videos = [];           // videoAPIから取得するローカル動画リスト
  let currentIndex = -1;     // 現在再生中の動画Index(未選択時は -1)
  let inPlayerPage = false;  // プレイヤー画面中か否か
  let isSeeking = false;     // シークバー操作中フラグ

  // ==========================
  // ページ切り替え
  // ==========================
  function loadPage(page) {
    switch (page) {
      case 'list':
        inPlayerPage = false;
        // フッターを小さいモードに（動画再生中なら表示）
        exitFullScreenMode();
        showFooterIfVideoLoaded();

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
        inPlayerPage = false;
        exitFullScreenMode();
        showFooterIfVideoLoaded();

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
        inPlayerPage = true;
        // 動画が選択されていなければフルスクリーンにしない(音だけ再生されてしまうので)
        if (currentIndex >= 0) {
          enterFullScreenMode();
        } else {
          // 動画が無い場合はフッターを隠すだけ
          hideFooter();
        }

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
    const videoListElement = document.getElementById('videoList');
    if (!videoListElement) return;

    // preload.js -> videoAPI.getVideoData() で取得
    if (window.videoAPI && typeof window.videoAPI.getVideoData === 'function') {
      videos = window.videoAPI.getVideoData();
    } else {
      videos = [];
    }

    videos.forEach((video, idx) => {
      const item = document.createElement('div');
      item.classList.add('video-item');

      const thumb = document.createElement('img');
      thumb.src = video.thumbnail || '';
      thumb.alt = video.title || '';

      const title = document.createElement('p');
      title.textContent = video.title || 'No Title';
      title.classList.add('video-title');

      item.appendChild(thumb);
      item.appendChild(title);

      // クリックしたら動画を再生し、playerページへ
      item.addEventListener('click', () => {
        currentIndex = idx;
        loadVideoInFooter(videos[currentIndex]);
        loadPage('player');
      });

      videoListElement.appendChild(item);
    });
  }

  // ==========================
  // playerページ初期化
  // ==========================
  function initPlayerPage() {
    const backBtn = document.getElementById('backToList');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        loadPage('list');
      });
    }
  }

  // ==========================
  // urlページ初期化
  // ==========================
  function initUrlPage() {
    const urlForm = document.getElementById('urlForm');
    if (!urlForm) return;

    const responseDiv = document.getElementById('response');
    urlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('urlInput').value.trim();
      if (validateUrl(urlInput)) {
        responseDiv.textContent = `入力されたURL: ${urlInput}`;
        responseDiv.style.color = '#333';
      } else {
        responseDiv.textContent = '有効なURLを入力してください。';
        responseDiv.style.color = 'red';
      }
    });
  }
  function validateUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  // ==========================
  // フッターに動画を読み込んで再生
  // ==========================
  function loadVideoInFooter(videoObj) {
    if (!videoObj) return;

    // <video> に src を設定
    footerVideo.src = videoObj.src;
    footerVideo.load();

    // サムネ、タイトル
    footerThumbnail.src = videoObj.thumbnail || '';
    footerTitle.textContent = videoObj.title || '';

    // フッターを表示(小さいモード)
    exitFullScreenMode();
    footer.style.display = 'flex';

    // 再生開始
    footerVideo.play().catch(err => console.warn('Video play error:', err));
  }

  // ==========================
  // フルスクリーン関連
  // ==========================
  function enterFullScreenMode() {
    footerVideo.classList.remove('footer-mode');
    footerVideo.classList.add('fullscreen-mode');
    // フッターUIは非表示 (サムネやボタンを隠す)
    footer.style.display = 'none';
  }
  function exitFullScreenMode() {
    footerVideo.classList.remove('fullscreen-mode');
    footerVideo.classList.add('footer-mode');
  }

  // 動画が無い時はフッターを隠す
  function showFooterIfVideoLoaded() {
    if (currentIndex >= 0 && footerVideo.src) {
      footer.style.display = 'flex';
    } else {
      hideFooter();
    }
  }
  function hideFooter() {
    footer.style.display = 'none';
  }

  // ==========================
  // フッター操作（再生/停止、前後、シーク）
  // ==========================
  playPauseButton.addEventListener('click', () => {
    if (footerVideo.paused) {
      footerVideo.play().catch(err => console.warn(err));
    } else {
      footerVideo.pause();
    }
  });
  footerVideo.addEventListener('play', () => {
    playPauseButton.textContent = '⏸';
    updateProgressBar();
  });
  footerVideo.addEventListener('pause', () => {
    playPauseButton.textContent = '⏵︎';
  });

  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      loadVideoInFooter(videos[currentIndex]);
    }
  });
  nextButton.addEventListener('click', () => {
    if (currentIndex < videos.length - 1) {
      currentIndex++;
      loadVideoInFooter(videos[currentIndex]);
    }
  });

  footerProgressBar.addEventListener('input', () => {
    if (!isSeeking) {
      isSeeking = true;
      footerVideo.pause();
    }
    const newTime = (footerProgressBar.value / 100) * (footerVideo.duration || 0);
    footerVideo.currentTime = newTime;
  });
  footerProgressBar.addEventListener('change', () => {
    isSeeking = false;
    footerVideo.play().catch(err => console.warn(err));
  });

  function updateProgressBar() {
    if (!footerVideo.paused && !footerVideo.ended) {
      const pct = (footerVideo.currentTime / footerVideo.duration) * 100 || 0;
      footerProgressBar.value = pct;
      footerCurrentTime.textContent = formatTime(footerVideo.currentTime);
      footerDuration.textContent = formatTime(footerVideo.duration);
      requestAnimationFrame(updateProgressBar);
    }
  }
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ==========================
  // ヘッダーのリンクでページ切り替え
  // ==========================
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
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
