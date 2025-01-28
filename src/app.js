/*************************************************************
 * app.js 
 * - SPAページ切替: list, url, library, player
 * - library.html で ./data/libraryData.json をfetchし、
 *   フォルダ名 + files_count を表示 (delete: true は無視)
 * 
 * - フォルダ作成ボタン: ダミー動作 (実ファイル保存はしない)
 *************************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const content    = document.getElementById('content');
  const navLinks   = document.querySelectorAll('nav a');

  // フッター要素
  const footer          = document.getElementById('footer');
  const footerThumbnail = document.getElementById('footerThumbnail');
  const footerTitle     = document.getElementById('footerTitle');
  const prevBtn         = document.getElementById('prevBtn');
  const playPauseBtn    = document.getElementById('playPauseBtn');
  const nextBtn         = document.getElementById('nextBtn');
  const timeDisplay     = document.getElementById('timeDisplay');
  const seekBar         = document.getElementById('seekBar');
  const volumeSlider    = document.getElementById('volumeSlider');

  // playerページ以外の時に <video> を退避する要素
  const hiddenHolder = document.getElementById('hiddenHolder');

  let globalVideo = null; // アプリ全体で1つだけの<video>
  let videos = [];        // 動画リスト
  let currentIndex = -1;  // 再生中の動画 (未選択は-1)
  let isSeeking = false;  // シークバー操作中フラグ

  // ==========================
  // SPAページ切り替え
  // ==========================
  function loadPage(page) {
    switch (page) {
      case 'list':
      case 'url':
      case 'library': {
        // playerページ以外 → フッターを再生中なら表示
        //                   → <video>を hiddenHolder に戻して映像を隠す
        if (globalVideo && hiddenHolder) {
          hiddenHolder.appendChild(globalVideo);
          globalVideo.style.display = 'none';
        }
        if (currentIndex >= 0) {
          footer.style.display = 'flex';
        } else {
          footer.style.display = 'none';
        }

        fetch(`pages/${page}.html`)
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            if (page === 'list')    initListPage();
            if (page === 'url')     initUrlPage();
            if (page === 'library') initLibraryPage();
          })
          .catch(err => {
            console.error(err);
            content.innerHTML = `<h2>Error loading ${page} page</h2>`;
          });
        break;
      }

      case 'player': {
        // playerページ → フッター非表示
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
      }

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

    // preload.js 経由で動画一覧取得
    if (window.videoAPI && typeof window.videoAPI.getVideoData === 'function') {
      videos = window.videoAPI.getVideoData() || [];
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

      // クリックで再生 → playerページへ
      item.addEventListener('click', () => {
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
      const urlInput = document.getElementById('urlInput').value.trim();
      console.log("URL submitted:", urlInput);
      // TODO: 何らかの処理
    });
  }

  // ==========================
  // playerページ初期化
  // ==========================
  function initPlayerPage() {
    const playerContainer = document.getElementById('playerContainer');
    const backBtn = document.getElementById('backToList');
    if (!playerContainer || !backBtn) return;

    // フッターはすでに非表示状態
    // 映像を表示
    if (globalVideo && currentIndex >= 0) {
      playerContainer.appendChild(globalVideo);
      globalVideo.style.display = 'block';
      globalVideo.controls = true;
    }

    backBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  // ==========================
  // libraryページ初期化
  // ==========================
  function initLibraryPage() {
    const folderListEl    = document.getElementById('folderList');
    const createFolderBtn = document.getElementById('createFolderBtn');

    if (!folderListEl || !createFolderBtn) {
      console.error("library.htmlのDOM要素が見つかりません。");
      return;
    }

    // 1. JSON読み込み (delete: trueは無視, visible: trueのみ表示)
    fetch('./data/libraryData.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Fail to load libraryData.json: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        const allFolders = json.folders || [];
        // visible===true のみ
        const filtered = allFolders.filter(f => f.visible === true);

        // folderOrderでソート
        filtered.sort((a, b) => (a.folderOrder || 0) - (b.folderOrder || 0));

        // 2. DOMに表示
        folderListEl.innerHTML = '';
        filtered.forEach(folder => {
          const item = document.createElement('div');
          item.classList.add('folder-item');

          // フォルダ名
          const nameEl = document.createElement('div');
          nameEl.classList.add('folder-name');
          nameEl.textContent = folder.folderName;

          // files_count を表示する (fallbackで media_files.length してもOK)
          const infoEl = document.createElement('div');
          infoEl.classList.add('folder-info');
          const fileCount = (folder.files_count !== undefined) 
            ? folder.files_count 
            : (folder.media_files ? folder.media_files.length : 0);

          infoEl.textContent = `動画数: ${fileCount}`;

          item.appendChild(nameEl);
          item.appendChild(infoEl);

          // クリック
          item.addEventListener('click', () => {
            console.log(`フォルダ "${folder.folderName}" がクリックされました。`);
          });

          folderListEl.appendChild(item);
        });
      })
      .catch(err => {
        console.error("libraryData.json読み込みエラー:", err);
        folderListEl.innerHTML = `<p style="color:red">フォルダ情報の読み込みに失敗しました</p>`;
      });

    // 3. フォルダ作成ボタン (ダミー)
    createFolderBtn.addEventListener('click', () => {
      const folderName = prompt("新しいフォルダ名を入力(ダミー)");
      if (!folderName) return;
      // 実際のファイル書き込みはしない
      console.log(`[ダミー] フォルダ '${folderName}' を作成要求`);
      alert("ダミーフォルダ作成完了。（JSONには未反映）");
    });
  }

  // ==========================
  // 動画を再生
  // ==========================
  function playVideo(index) {
    if (!videos[index]) return;
    if (index === currentIndex) return;
    currentIndex = index;
    const vid = videos[index];

    // 初回video生成
    if (!globalVideo) {
      globalVideo = document.createElement('video');
      globalVideo.id = 'globalVideo';
      globalVideo.preload = 'auto';
      globalVideo.playsInline = true;
      globalVideo.controls = false;
      globalVideo.style.display = 'none';
      hiddenHolder.appendChild(globalVideo);

      initVideoEvents();
    }

    // src 切り替え
    if (globalVideo.src !== vid.src) {
      globalVideo.src = vid.src;
      globalVideo.load();
    }
    footerThumbnail.src = vid.thumbnail || '';
    footerTitle.textContent = vid.title || '(No Title)';

    footer.style.display = 'flex';

    globalVideo.play().catch(err => console.warn(err));
  }

  // フッターのvideoイベント
  function initVideoEvents() {
    playPauseBtn.addEventListener('click', () => {
      if (globalVideo.paused) globalVideo.play().catch(e => console.warn(e));
      else globalVideo.pause();
    });
    globalVideo.addEventListener('play', () => {
      playPauseBtn.textContent = '⏸';
      requestAnimationFrame(updateProgress);
    });
    globalVideo.addEventListener('pause', () => {
      playPauseBtn.textContent = '⏵︎';
    });

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

    seekBar.addEventListener('input', () => {
      isSeeking = true;
      const val = (seekBar.value / 100) * (globalVideo.duration||0);
      globalVideo.currentTime = val;
    });
    seekBar.addEventListener('change', () => { isSeeking = false; });

    volumeSlider.addEventListener('input', () => {
      globalVideo.volume = volumeSlider.value;
    });
  }

  function updateProgress() {
    if (!globalVideo.paused && !globalVideo.ended) {
      const pct = (globalVideo.currentTime / globalVideo.duration)*100 || 0;
      if (!isSeeking) seekBar.value = pct;
      timeDisplay.textContent = formatTime(globalVideo.currentTime);
      requestAnimationFrame(updateProgress);
    } else {
      if (!isSeeking) {
        const pct = (globalVideo.currentTime/(globalVideo.duration||1))*100 || 0;
        seekBar.value = pct;
      }
    }
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60);
    return `${m}:${s<10?'0':''}${s}`;
  }

  // ヘッダーのリンク
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
    });
  });

  // 起動時に list
  loadPage('list');
});
