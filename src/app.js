// src/app.js
document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const links = document.querySelectorAll('nav a');

  // ===== フッターの要素を取得 =====
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

  // ===== グローバル変数 =====
  let currentVideoIndex = 0;
  let videos = [];    // src/dl から読み込む動画一覧
  let isPlaying = false;
  let isSeeking = false; // シークバー操作中フラグ

  // =========================================
  // ページ切り替え用の関数
  // =========================================
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

  // ----- listページを動的に読み込む関数 -----
  function loadListPage() {
    fetch('pages/list.html')
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        initializeList();
      })
      .catch(error => {
        content.innerHTML = '<h2>Error loading the List page</h2>';
        console.error('Error loading List page:', error);
      });
  }

  // ----- URL入力フォームページを動的に読み込む関数 -----
  function loadUrlPage() {
    fetch('pages/url.html')
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        initializeUrlForm(); // フォームの初期化関数を呼び出す
      })
      .catch(error => {
        content.innerHTML = '<h2>Error loading the URL input page</h2>';
        console.error('Error loading URL input page:', error);
      });
  }

  // ----- playerページを動的に読み込む関数 -----
  function loadPlayerPage() {
    fetch('pages/player.html')
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        initializePlayer();
      })
      .catch(error => {
        content.innerHTML = '<h2>Error loading the Player page</h2>';
        console.error('Error loading Player page:', error);
      });
  }

  // =========================================
  // listページの初期化
  // =========================================
  function initializeList() {
    const videoList = document.getElementById('videoList');
    videos = window.videoAPI.getVideoData(); // preload.js経由で取得

    // それぞれの動画を表示する
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

      // ======= クリック時の挙動 =======
      videoItem.addEventListener('click', () => {
        // 「player.htmlで動画を再生したい」ので、フッターはBGMとして継続再生する想定
        // もしフッターで動画を再生したい場合は loadVideo(video) を使うが、ここでは使わない

        // どの動画を再生するかをグローバル or sessionStorage等に保存
        window.selectedVideo = video; 
        // playerページをロード
        loadPage('player');
      });

      videoList.appendChild(videoItem);
    });
  }

  // =========================================
  // playerページの初期化
  // =========================================
  function initializePlayer() {
    // player.html にある要素を取得
    const container = document.getElementById('playerContainer');
    const backToListBtn = document.getElementById('backToList');

    if (!container || !backToListBtn) {
      console.warn('playerContainer / backToList が見つかりません');
      return;
    }

    // グローバル変数から「再生したい動画情報」を受け取る
    const video = window.selectedVideo;
    if (!video) {
      // もし video 情報がなければリストページに戻す
      loadPage('list');
      return;
    }

    // ----- <video> タグを作って表示 -----
    const videoElem = document.createElement('video');
    videoElem.src = video.src;
    videoElem.controls = true;
    videoElem.autoplay = true;
    videoElem.style.width = '80%';

    container.appendChild(videoElem);

    // ======= 戻るボタンの動作 =======
    backToListBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  // =========================================
  // フッターに動画(or音源)をロードする関数
  // ※「フッターで動画を再生する場合」に利用
  // =========================================
  function loadVideo(video) {
    footerAudio.src = video.src;
    footerAudio.load();

    // フッターを表示（CSSの display:none などを解除）
    footer.style.display = 'flex';

    // 動画情報を表示（サムネ＆タイトル）
    footerThumbnail.src = video.thumbnail;
    footerTitle.textContent = video.title;

    // 再生開始
    footerAudio.play();
    isPlaying = true;
    updatePlayPauseButton();

    // 再生時間バーを更新開始
    updateProgressBar();
  }

  // =========================================
  // フッターの操作（再生/停止, シークバー等）
  // =========================================
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

  // ----- 再生時間バーを滑らかに更新する -----
  function updateProgressBar() {
    if (footerAudio.duration) {
      const progressPercent = (footerAudio.currentTime / footerAudio.duration) * 100;
      footerProgressBar.value = progressPercent;

      footerCurrentTime.textContent = formatTime(footerAudio.currentTime);
      footerDuration.textContent = formatTime(footerAudio.duration);
    }
    // 再生中であれば、リクエストアニメーションフレームで連続更新
    if (isPlaying) {
      requestAnimationFrame(updateProgressBar);
    }
  }

  // ----- 時間を mm:ss 形式にフォーマット -----
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // ----- シークバー操作 -----
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

  // ----- 前の動画を再生 -----
  prevButton.addEventListener('click', () => {
    if (currentVideoIndex > 0) {
      currentVideoIndex--;
      loadVideo(videos[currentVideoIndex]);
    }
  });

  // ----- 次の動画を再生 -----
  nextButton.addEventListener('click', () => {
    if (currentVideoIndex < videos.length - 1) {
      currentVideoIndex++;
      loadVideo(videos[currentVideoIndex]);
    }
  });

  // =========================================
  // URL入力フォームページの初期化関数
  // =========================================
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

  // ----- URLの簡易バリデーション -----
  function validateUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // =========================================
  // ナビゲーションのクリックイベント
  // =========================================
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = event.target.getAttribute('data-page');
      loadPage(page);
    });
  });

  // アプリ起動時、最初に読み込むページ
  loadPage('list');
});
