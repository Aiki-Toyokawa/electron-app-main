// src/app.js
document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const links = document.querySelectorAll('nav a');

  // フッターの要素を取得
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
  let videos = []; // グローバルに定義
  let isPlaying = false;

  // ページのコンテンツを読み込む関数
  function loadPage(page) {
    switch (page) {
      case 'player':
        loadPlayerPage();
        break;
      default:
        content.innerHTML = '<h2>404</h2><p>Page not found.</p>';
        break;
    }
  }

  // playerページを動的に読み込む関数
  function loadPlayerPage() {
    fetch('pages/player.html')
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        initializePlayer();
      })
      .catch(error => {
        content.innerHTML = '<h2>Error loading the Player page</h2>';
        console.error('Error loading player page:', error);
      });
  }

  // プレーヤー初期化
  function initializePlayer() {
    const videoList = document.getElementById('videoList');
    videos = window.videoAPI.getVideoData();

    videos.forEach((video, index) => {
      const videoItem = document.createElement('div');
      videoItem.classList.add('video-item');

      const thumbnail = document.createElement('img');
      thumbnail.src = video.thumbnail;
      thumbnail.alt = video.title;

      const title = document.createElement('p');
      title.textContent = video.title;
      title.classList.add('video-title'); // クラスを追加

      videoItem.appendChild(thumbnail);
      videoItem.appendChild(title);

      videoItem.addEventListener('click', () => {
        currentVideoIndex = index;
        loadVideo(video);
      });

      videoList.appendChild(videoItem);
    });
  }

  // フッターに動画をロードする関数
  function loadVideo(video) {
    footerAudio.src = video.src;
    footerAudio.load();

    // フッターを表示
    footer.style.display = 'flex';

    // 動画情報を表示
    footerThumbnail.src = video.thumbnail;
    footerTitle.textContent = video.title;

    // 再生を開始
    footerAudio.play();
    isPlaying = true;
    updatePlayPauseButton();

    // 再生時間バーの更新開始
    updateProgressBar();
  }

  // 再生・一時停止ボタンのイベントリスナー
  playPauseButton.addEventListener('click', () => {
    if (isPlaying) {
      footerAudio.pause();
    } else {
      footerAudio.play();
    }
  });

  // オーディオの再生状態を監視
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

  // 再生時間バーの更新を滑らかにする
  function updateProgressBar() {
    if (footerAudio.duration) {
      const progressPercent = (footerAudio.currentTime / footerAudio.duration) * 100;
      footerProgressBar.value = progressPercent;

      // 再生時間を表示
      footerCurrentTime.textContent = formatTime(footerAudio.currentTime);
      footerDuration.textContent = formatTime(footerAudio.duration);
    }
    if (isPlaying) {
      requestAnimationFrame(updateProgressBar);
    }
  }

  // 時間を mm:ss 形式にフォーマットする関数
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // 再生バーの操作
  let isSeeking = false;

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

  // 前の動画を再生
  prevButton.addEventListener('click', () => {
    if (currentVideoIndex > 0) {
      currentVideoIndex--;
      loadVideo(videos[currentVideoIndex]);
    }
  });

  // 次の動画を再生
  nextButton.addEventListener('click', () => {
    if (currentVideoIndex < videos.length - 1) {
      currentVideoIndex++;
      loadVideo(videos[currentVideoIndex]);
    }
  });

  // ナビゲーションリンクのクリックイベント
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = event.target.getAttribute('data-page');
      loadPage(page);
    });
  });

  // 初期ページのロードを 'player' に設定
  loadPage('player');
});
