// src/app.js
document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const navLinks = document.querySelectorAll('nav a');

  // フッターと共有メディア要素
  const footer = document.getElementById('footer');
  const footerVideo = document.getElementById('sharedVideo'); // 共有メディア
  const footerThumbnail = document.getElementById('footerThumbnail');
  const footerTitle = document.getElementById('footerTitle');
  const prevButton = document.getElementById('prevButton');
  const playPauseButton = document.getElementById('playPauseButton');
  const nextButton = document.getElementById('nextButton');
  const footerProgressBar = document.getElementById('footerProgressBar');
  const footerCurrentTime = document.getElementById('footerCurrentTime');
  const footerDuration = document.getElementById('footerDuration');

  let videos = [];            // list.htmlで取得する動画一覧
  let currentIndex = 0;       // 現在再生している動画のインデックス
  let isSeeking = false;      // シークバー操作中フラグ

  // 「プレーヤー画面かどうか」を判定するフラグ
  let inPlayerPage = false;

  // ==========================
  // ページ切り替え
  // ==========================
  function loadPage(page) {
    switch (page) {
      case 'list':
        inPlayerPage = false; // プレーヤーではない
        fetch('pages/list.html')
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            initListPage();
            // フッターを表示してもOK（もし既に再生中なら）
            // ただしユーザが再生していないなら非表示にしてもよい
            if (footerVideo.src) {
              footer.style.display = 'flex';
            }
          })
          .catch(err => {
            content.innerHTML = '<h2>Error loading list page</h2>';
            console.error(err);
          });
        break;

      case 'url':
        inPlayerPage = false;
        fetch('pages/url.html')
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            initUrlPage();
            // 他のページでもフッターは表示OK
            if (footerVideo.src) {
              footer.style.display = 'flex';
            }
          })
          .catch(err => {
            content.innerHTML = '<h2>Error loading url page</h2>';
            console.error(err);
          });
        break;

      case 'player':
        inPlayerPage = true;
        fetch('pages/player.html')
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            initPlayerPage();
            // プレーヤーを表示している間はfooterを非表示
            // （ただしメディア再生は続ける）
            footer.style.display = 'none';
          })
          .catch(err => {
            content.innerHTML = '<h2>Error loading player page</h2>';
            console.error(err);
          });
        break;

      default:
        content.innerHTML = '<h2>404 Page Not Found</h2>';
        break;
    }
  }

  // ==========================
  // listページ初期化
  // ==========================
  function initListPage() {
    const videoList = document.getElementById('videoList');
    // preload.js -> videoAPI.js で取得
    videos = window.videoAPI.getVideoData() || [];

    videos.forEach((video, idx) => {
      const item = document.createElement('div');
      item.classList.add('video-item');

      const thumb = document.createElement('img');
      thumb.src = video.thumbnail || '';
      thumb.alt = video.title || '';

      const title = document.createElement('p');
      title.textContent = video.title || '(No Title)';
      title.classList.add('video-title');

      item.appendChild(thumb);
      item.appendChild(title);

      item.addEventListener('click', () => {
        currentIndex = idx;
        // 「フッターで再生しながら映像が観たい」＝ player へ遷移
        // ただしフッターと同じ media 要素を再生するので、ここで src を設定
        loadVideoInFooter(videos[currentIndex]);
        loadPage('player');
      });

      videoList.appendChild(item);
    });
  }

  // ==========================
  // urlページ初期化
  // ==========================
  function initUrlPage() {
    const urlForm = document.getElementById('urlForm');
    const responseDiv = document.getElementById('response');
    if (!urlForm) return;

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
    try { new URL(str); return true; }
    catch { return false; }
  }

  // ==========================
  // playerページ初期化
  // ==========================
  function initPlayerPage() {
    const container = document.getElementById('playerContainer');
    const backBtn = document.getElementById('backToList');
    if (!container || !backBtn) return;

    // すでにフッター側で loadVideoInFooter() しているはずなので、
    // "sharedVideo" をここに移動して「映像を表示」する
    container.appendChild(footerVideo);
    footerVideo.style.display = 'block';   // 可視化
    footerVideo.controls = true;           // コントロール表示

    // 「戻るボタン」でlistページへ戻ったら、footerに再度移動し、表示を隠す
    backBtn.addEventListener('click', () => {
      loadPage('list'); // これが完了したら↓でfooterVideoを戻す
    });
  }

  // ==========================
  // フッターで動画を再生する（共有メディアにセット）
  // ==========================
  function loadVideoInFooter(videoObj) {
    if (!videoObj) return;

    // footerVideo にソースをセット
    footerVideo.src = videoObj.src;
    footerVideo.load();

    // サムネとタイトルをフッターに表示
    footerThumbnail.src = videoObj.thumbnail || '';
    footerTitle.textContent = videoObj.title || '';

    // フッターを表示（playerページにいない時のみ）
    if (!inPlayerPage) {
      footer.style.display = 'flex';
    }

    // 再生開始
    footerVideo.play().catch(err => console.warn('Play error:', err));
  }

  // ==========================
  // フッター操作 (再生/一時停止/シークなど)
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

  // 前へ・次へ は「videos[]」の配列で切り替え
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

  // シークバー操作
  footerProgressBar.addEventListener('input', () => {
    if (!isSeeking) {
      isSeeking = true;
      footerVideo.pause();
    }
    const newValue = (footerProgressBar.value / 100) * footerVideo.duration;
    footerVideo.currentTime = newValue;
  });
  footerProgressBar.addEventListener('change', () => {
    footerVideo.play();
    isSeeking = false;
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
  function formatTime(sec) {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ==========================
  // ナビゲーション（list, url）
  // ==========================
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const page = a.getAttribute('data-page');
      loadPage(page);
    });
  });

  // ==========================
  // ページ起動時に list を表示
  // ==========================
  loadPage('list');

  // ==========================
  // ページが切り替わり終わった後の処理
  // （player→他ページに移動した時に、sharedVideo を footer に戻す）
  // ==========================
  // MutationObserver 等で監視する方法もありますが、今回は setInterval など簡易的な例
  let lastPageIsPlayer = false;
  setInterval(() => {
    if (lastPageIsPlayer && !inPlayerPage) {
      // 「playerページだったのが、今はプレーヤーじゃない」に変わった時
      // → sharedVideo を footer に戻し、表示を消す
      footer.appendChild(footerVideo);
      footerVideo.style.display = 'none';
      footerVideo.controls = false;
      // フッターが動いているなら表示
      if (footerVideo.src && !footerVideo.paused && !footerVideo.ended) {
        footer.style.display = 'flex';
      }
    }
    lastPageIsPlayer = inPlayerPage;
  }, 500);
});
