// src/app.js
document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const links = document.querySelectorAll('nav a');

  // フッターの要素
  const footer = document.getElementById('footer');
  const footerAudio = document.getElementById('footerAudio');
  const footerThumbnail = document.getElementById('footerThumbnail');
  const footerTitle = document.getElementById('footerTitle');
  const prevButton = document.getElementById('prevButton');
  const playPauseButton = document.getElementById('playPauseButton');
  const nextButton = document.getElementById('nextButton');
  const footerProgressBar = document.getElementById('footerProgressBar');
  const footerCurrentTime = document.getElementById('footerCurrentTime');
  const footerDuration = document.getElementById('footerDuration');

  let currentVideoIndex = 0;
  let videos = [];
  let isPlaying = false;
  let isSeeking = false;

  // ページ切り替え
  function loadPage(page) {
    switch (page) {
      case 'list':
        loadListPage();
        break;
      case 'url':
        loadUrlPage();
        break;
      case 'player':
        loadPlayerPage();
        break;
      default:
        content.innerHTML = '<h2>404</h2><p>ページが見つかりません。</p>';
        break;
    }
  }

  // listページ
  function loadListPage() {
    fetch('pages/list.html')
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        initializeList(); // リスト初期化
      })
      .catch(error => {
        content.innerHTML = '<h2>Error loading the List page</h2>';
        console.error('Error loading List page:', error);
      });
  }

  // URLページ
  function loadUrlPage() {
    fetch('pages/url.html')
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        initializeUrlForm(); // フォーム初期化
      })
      .catch(error => {
        content.innerHTML = '<h2>Error loading the URL page</h2>';
        console.error('Error loading URL page:', error);
      });
  }

  // playerページ
  function loadPlayerPage() {
    fetch('pages/player.html')
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        initializePlayer(); // プレイヤー初期化
      })
      .catch(error => {
        content.innerHTML = '<h2>Error loading the Player page</h2>';
        console.error('Error loading Player page:', error);
      });
  }

  // ===== リスト初期化 =====
  function initializeList() {
    const videoList = document.getElementById('videoList');
    videos = window.videoAPI.getVideoData(); // preload.js -> videoAPI.js から取得

    videos.forEach((video, index) => {
      const videoItem = document.createElement('div');
      videoItem.classList.add('video-item');

      const thumbnail = document.createElement('img');
      thumbnail.src = video.thumbnail;
      thumbnail.alt = video.title;

      const title = document.createElement('p');
      title.textContent = video.title;
      title.classList.add('video-title');

      videoItem.appendChild(thumbnail);
      videoItem.appendChild(title);

      // クリック時の挙動
      videoItem.addEventListener('click', () => {
        // フッターで再生するパターン
        // → 下記のようにフッターを表示＆音声を再生
        // loadVideo(videos[index]);

        // あるいはplayer.htmlで再生したいなら:
        window.selectedVideo = video;
        loadPage('player');
      });

      videoList.appendChild(videoItem);
    });
  }

  // ===== フッターで動画(音声)をロードして再生 =====
  function loadVideo(video) {
    // フッターを表示 (← これで初めてユーザーに見える)
    footer.style.display = 'flex';

    footerAudio.src = video.src;
    footerAudio.load();

    footerThumbnail.src = video.thumbnail || '';
    footerTitle.textContent = video.title || '';

    footerAudio.play();
    isPlaying = true;
    updatePlayPauseButton();
    updateProgressBar();
  }

  // ===== playerページ初期化 =====
  function initializePlayer() {
    const container = document.getElementById('playerContainer');
    const backBtn = document.getElementById('backToList');

    if (!container || !backBtn) return;

    const video = window.selectedVideo;
    if (!video) {
      // 選択された動画情報が無ければリストへ戻す
      loadPage('list');
      return;
    }

    const videoElem = document.createElement('video');
    videoElem.src = video.src;
    videoElem.controls = true;
    videoElem.autoplay = true;
    videoElem.style.width = '80%';
    container.appendChild(videoElem);

    backBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  // ===== URLページ初期化 =====
  function initializeUrlForm() {
    const urlForm = document.getElementById('urlForm');
    const responseDiv = document.getElementById('response');

    if (urlForm) {
      urlForm.addEventListener('submit', (event) => {
        event.preventDefault();
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
  }

  // ===== URLの簡易バリデーション =====
  function validateUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  // ===== フッター操作関連 =====
  // 再生・一時停止
  playPauseButton.addEventListener('click', () => {
    if (isPlaying) {
      footerAudio.pause();
    } else {
      footerAudio.play();
    }
  });
  footerAudio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseButton();
    updateProgressBar();
  });
  footerAudio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseButton();
  });
  function updatePlayPauseButton() {
    playPauseButton.textContent = isPlaying ? '⏸' : '⏵︎';
  }

  // 前へ
  prevButton.addEventListener('click', () => {
    if (currentVideoIndex > 0) {
      currentVideoIndex--;
      loadVideo(videos[currentVideoIndex]);
    }
  });
  // 次へ
  nextButton.addEventListener('click', () => {
    if (currentVideoIndex < videos.length - 1) {
      currentVideoIndex++;
      loadVideo(videos[currentVideoIndex]);
    }
  });

  // シークバー
  footerProgressBar.addEventListener('input', () => {
    if (footerAudio.duration) {
      const newTime = (footerProgressBar.value / 100) * footerAudio.duration;
      footerAudio.currentTime = newTime;
      if (!isSeeking) {
        isSeeking = true;
        footerAudio.pause();
      }
    }
  });
  footerProgressBar.addEventListener('change', () => {
    if (isSeeking) {
      footerAudio.play();
      isSeeking = false;
    }
  });

  // 再生時間バーの更新
  function updateProgressBar() {
    if (footerAudio.duration) {
      const percent = (footerAudio.currentTime / footerAudio.duration) * 100;
      footerProgressBar.value = percent;
      footerCurrentTime.textContent = formatTime(footerAudio.currentTime);
      footerDuration.textContent = formatTime(footerAudio.duration);
    }
    if (isPlaying) {
      requestAnimationFrame(updateProgressBar);
    }
  }
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ===== ナビゲーションリンクのクリック =====
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = event.target.getAttribute('data-page');
      loadPage(page);
    });
  });

  // アプリ起動時、listを読み込む
  loadPage('list');
});
