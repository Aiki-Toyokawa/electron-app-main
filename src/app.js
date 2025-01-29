/*************************************************************
 * app.js
 * - SPAページ: list, url, library, player
 * - library.html : fetch('./data/libraryData.json') で読み込み
 *   フォルダ名 + files_count を表示 (delete: true は無視)
 * - フォルダ作成ボタン: ダミー動作 (実ファイル保存は行わない)
 *************************************************************/

document.addEventListener('DOMContentLoaded', () => {
  console.log("app.js: DOMContentLoaded fired.");

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

  let globalVideo = null; 
  let videos = [];        
  let currentIndex = -1;  
  let isSeeking = false;  

  /**************************************************
   * SPAページ切り替え
   **************************************************/
  function loadPage(page) {
    console.log(`loadPage called: ${page}`);

    switch (page) {
      case 'list':
      case 'url':
      case 'library': {
        if (globalVideo && hiddenHolder) {
          hiddenHolder.appendChild(globalVideo);
          globalVideo.style.display = 'none';
        }
        if (currentIndex >= 0) {
          footer.style.display = 'flex';
        } else {
          footer.style.display = 'none';
        }

        // pages/xxx.html を fetch して切り替え
        fetch(`pages/${page}.html`)
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            if      (page === 'list')    initListPage();
            else if (page === 'url')     initUrlPage();
            else if (page === 'library') initLibraryPage();
          })
          .catch(err => {
            console.error(`Error loading page: ${page}`, err);
            content.innerHTML = `<h2>Error loading ${page} page</h2>`;
          });
        break;
      }

      case 'player': {
        console.log("loading player page...");
        footer.style.display = 'none';

        fetch('pages/player.html')
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            initPlayerPage();
          })
          .catch(err => {
            console.error("Error loading player page:", err);
            content.innerHTML = '<h2>Error loading player page</h2>';
          });
        break;
      }

      default:
        content.innerHTML = '<h2>404 Not Found</h2>';
    }
  }

  /**************************************************
   * list ページ初期化
   **************************************************/
  function initListPage() {
    console.log("initListPage");
    const videoListEl = document.getElementById('videoList');
    if (!videoListEl) return;

    // preload.js経由で動画一覧を取得
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

      // クリックで再生 → player
      item.addEventListener('click', () => {
        playVideo(idx);
        loadPage('player');
      });
      videoListEl.appendChild(item);
    });
  }

  /**************************************************
   * url ページ初期化
   **************************************************/
  function initUrlPage() {
    console.log("initUrlPage");
    const urlForm = document.getElementById('urlForm');
    if (!urlForm) return;

    urlForm.addEventListener('submit', e => {
      e.preventDefault();
      const urlInput = document.getElementById('urlInput').value.trim();
      console.log("URL submitted:", urlInput);
      // TODO: 何か処理
    });
  }

  /**************************************************
   * player ページ初期化
   **************************************************/
  function initPlayerPage() {
    console.log("initPlayerPage");
    const playerContainer = document.getElementById('playerContainer');
    const backBtn = document.getElementById('backToList');
    if (!playerContainer || !backBtn) return;

    if (globalVideo && currentIndex >= 0) {
      playerContainer.appendChild(globalVideo);
      globalVideo.style.display = 'block';
      globalVideo.controls = true;
    }

    backBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  /**************************************************
   * library ページ初期化
   **************************************************/
  function initLibraryPage() {
    console.log("initLibraryPage");
    const folderListEl    = document.getElementById('folderList');
    const createFolderBtn = document.getElementById('createFolderBtn');

    // モーダル
    const folderModal     = document.getElementById('folderModal');
    const folderNameInput = document.getElementById('folderNameInput');
    const cancelModalBtn  = document.getElementById('cancelModalBtn');
    const okModalBtn      = document.getElementById('okModalBtn');

    if (!folderListEl || !createFolderBtn || 
        !folderModal || !folderNameInput || 
        !cancelModalBtn || !okModalBtn) {
      console.error("library.html DOM elements not found.");
      return;
    }

    // JSON読み込み (delete:true無視, visible:trueのみ)
    fetch('./data/libraryData.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Fail to load libraryData.json: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        console.log("libraryData.json loaded:", json);
        const allFolders = json.folders || [];
        // visible===true のみ
        const filtered = allFolders.filter(f => f.visible === true);
        // folderOrder ソート
        filtered.sort((a,b) => (a.folderOrder||0) - (b.folderOrder||0));

        folderListEl.innerHTML = '';
        filtered.forEach(folder => {
          const item = document.createElement('div');
          item.classList.add('folder-item');

          // フォルダ名
          const nameEl = document.createElement('div');
          nameEl.classList.add('folder-name');
          nameEl.textContent = folder.folderName;

          // files_count or fallback media_files.length
          const infoEl = document.createElement('div');
          infoEl.classList.add('folder-info');
          const fileCount = (folder.files_count != null)
            ? folder.files_count
            : (folder.media_files ? folder.media_files.length : 0);
          infoEl.textContent = `動画数: ${fileCount}`;

          item.appendChild(nameEl);
          item.appendChild(infoEl);

          item.addEventListener('click', () => {
            console.log(`フォルダ "${folder.folderName}" clicked.`);
          });

          folderListEl.appendChild(item);
        });
      })
      .catch(err => {
        console.error("Failed to load libraryData.json:", err);
        folderListEl.innerHTML = `<p style="color:red">フォルダ情報の読み込みに失敗しました</p>`;
      });

    // フォルダ作成ボタン → モーダル表示
    createFolderBtn.addEventListener('click', () => {
      folderNameInput.value = '';
      folderModal.style.display = 'flex';
    });

    // キャンセル → 閉じる
    cancelModalBtn.addEventListener('click', () => {
      folderModal.style.display = 'none';
    });

    // 作成 → ダミー動作
    okModalBtn.addEventListener('click', () => {
      const newName = folderNameInput.value.trim();
      if (!newName) {
        alert("フォルダ名を入力してください。");
        return;
      }
      console.log(`[ダミー] 新フォルダ "${newName}" を作成(実ファイル書き込みは未実装)`);
      alert(`フォルダ「${newName}」を作成しました (ダミー)。`);

      folderModal.style.display = 'none';
      // 再描画が必要ならinitLibraryPage()再呼び出し etc.
    });
  }

  /**************************************************
   * 動画を再生
   **************************************************/
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

    if (globalVideo.src !== vid.src) {
      globalVideo.src = vid.src;
      globalVideo.load();
    }
    footerThumbnail.src = vid.thumbnail || '';
    footerTitle.textContent = vid.title || '(No Title)';

    footer.style.display = 'flex';
    globalVideo.play().catch(err => console.warn("play error:", err));
  }

  /**************************************************
   * フッターのvideoイベント
   **************************************************/
  function initVideoEvents() {
    playPauseBtn.addEventListener('click', () => {
      if (globalVideo.paused) globalVideo.play().catch(e=>console.warn(e));
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
      const val = (seekBar.value/100)*(globalVideo.duration||0);
      globalVideo.currentTime = val;
    });
    seekBar.addEventListener('change', () => {
      isSeeking = false;
    });
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

  // ヘッダーナビゲーション
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
    });
  });

  // アプリ起動時にlistページ
  loadPage('list');
});
