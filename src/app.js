/*************************************************************
 * app.js 
 * - SPAページ切替: list, url, library, player
 * - library.html で src/data/libraryData.json を読み込み、
 *   フォルダ名 + ファイル数 を表示 ( delete: true は無視 )
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
        //                   → videoをhiddenHolderに戻し映像を隠す
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

      // クリックで再生 & player画面へ
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
      // TODO: 何か処理
    });
  }

  // ==========================
  // playerページ初期化
  // ==========================
  function initPlayerPage() {
    const playerContainer = document.getElementById('playerContainer');
    const backBtn = document.getElementById('backToList');
    if (!playerContainer || !backBtn) return;

    // フッター非表示(上記switchで設定済み)
    // 映像を表示
    if (globalVideo && currentIndex >= 0) {
      playerContainer.appendChild(globalVideo);
      globalVideo.style.display = 'block';
      globalVideo.controls = true; // コントロールを出す
    }

    backBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  // ==========================
  // libraryData.json をfetchして表示
  // ==========================
  function initLibraryPage() {
    const folderListEl    = document.getElementById('folderList');
    const createFolderBtn = document.getElementById('createFolderBtn');
    if (!folderListEl || !createFolderBtn) {
      console.error("library.htmlのDOM要素が見つかりません。");
      return;
    }

    // 1. JSONをfetchで取得 (delete:trueは無視、 visible===trueなら表示)
    fetch('./data/libraryData.json') 
      .then(res => {
        if (!res.ok) {
          throw new Error(`Fail to load libraryData.json: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        const allFolders = json.folders || [];
        // 2. フォルダを表示順(folderOrder)でソート
        //    deleteフラグはUIでは無視. visible===true のみ
        const sorted = allFolders
          .filter(f => f.visible === true) // visibleのみ
          .sort((a, b) => (a.folderOrder||0) - (b.folderOrder||0));

        // 3. 表示を組み立て
        folderListEl.innerHTML = '';
        sorted.forEach(folder => {
          const item = document.createElement('div');
          item.classList.add('folder-item');

          // フォルダ名
          const nameEl = document.createElement('div');
          nameEl.classList.add('folder-name');
          nameEl.textContent = folder.folderName;

          // メディアファイル数
          const infoEl = document.createElement('div');
          infoEl.classList.add('folder-info');
          const fileCount = folder.media_files ? folder.media_files.length : 0;
          infoEl.textContent = `動画数: ${fileCount}`;

          item.appendChild(nameEl);
          item.appendChild(infoEl);

          item.addEventListener('click', () => {
            console.log(`フォルダ "${folder.folderName}" がクリックされました。`);
            // TODO: フォルダ詳細ページへ行くなら loadPage('folderDetail') 等
          });

          folderListEl.appendChild(item);
        });
      })
      .catch(err => {
        console.error("libraryData.json 読み込みエラー:", err);
        folderListEl.innerHTML = `<p style="color:red">フォルダ情報の読み込みに失敗しました</p>`;
      });

    // フォルダ作成ボタン (ダミー)
    createFolderBtn.addEventListener('click', () => {
      const folderName = prompt("新しいフォルダ名を入力(ダミー)");
      if (!folderName) return;
      // 実際にはここで JSONファイル更新処理 or サーバPOSTなど
      console.log(`「${folderName}」フォルダを作成(ダミー)`);
      alert("ダミーフォルダ作成完了。（実ファイルへは未反映）");
    });
  }

  // ==========================
  // 動画を再生
  // ==========================
  function playVideo(index) {
    if (!videos[index]) return;
    if (index === currentIndex) return; // 同じ
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
      const pct = (globalVideo.currentTime / globalVideo.duration) * 100 || 0;
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

  // ヘッダーナビゲーション
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
    });
  });

  // 起動時 listページ
  loadPage('list');
});
