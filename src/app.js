/*************************************************************
 * app.js
 * - SPAページ: list, url, library, player
 * - library.html : fetch('./data/libraryData.json') で読み込み
 *   フォルダ名 + files_count を表示 (delete: true は無視)
 * - フォルダ作成ボタン: 実ファイル書き込み (contextIsolation: true)
 *   → preload.js の window.libraryAPI.save() を呼ぶ
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

  // playerページ以外時に <video> を退避
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

    // preload.js の videoAPI
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
   * url ページ
   **************************************************/
  function initUrlPage() {
    console.log("initUrlPage");
    const urlForm = document.getElementById('urlForm');
    if (!urlForm) return;

    urlForm.addEventListener('submit', e => {
      e.preventDefault();
      const urlInput = document.getElementById('urlInput').value.trim();
      console.log("URL submitted:", urlInput);
      // TODO
    });
  }

  /**************************************************
   * player ページ
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
   * library ページ
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

    // 1. fetch で libraryData.json 表示
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
        filtered.sort((a,b) => (a.folderOrder||0) - (b.folderOrder||0));

        folderListEl.innerHTML = '';
        filtered.forEach(folder => {
          const item = document.createElement('div');
          item.classList.add('folder-item');

          const nameEl = document.createElement('div');
          nameEl.classList.add('folder-name');
          nameEl.textContent = folder.folderName;

          // files_count or fallback
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

    // 2. フォルダ作成ボタン → モーダル
    createFolderBtn.addEventListener('click', () => {
      folderNameInput.value = '';
      folderModal.style.display = 'flex';
    });

    // 3. キャンセル
    cancelModalBtn.addEventListener('click', () => {
      folderModal.style.display = 'none';
    });

    // 4. 作成 → 「libraryAPI」経由でファイルに追記
    okModalBtn.addEventListener('click', () => {
      const newName = folderNameInput.value.trim();
      if (!newName) {
        alert("フォルダ名を入力してください。");
        return;
      }

      // a) 最新データを preload から読む
      if (!window.libraryAPI) {
        console.error("window.libraryAPI is not defined");
        alert("ファイル操作APIが利用できません");
        return;
      }
      const data = window.libraryAPI.load();  // { folders: [...] }
      let folders = data.folders || [];

      // b) 重複チェック
      const dupe = folders.some(f => f.folderName === newName && f.visible === true);
      if (dupe) {
        alert("同名フォルダが既に存在します！");
        return;
      }

      // c) 新フォルダ追加
      const newId = 'folder' + Date.now();
      const maxOrder = (folders.length>0)
        ? Math.max(...folders.map(f=> f.folderOrder||0))
        : 0;
      const newFolder = {
        folderId: newId,
        folderName: newName,
        folderOrder: maxOrder+1,
        deletable: true,
        visible: true,
        files_count: 0,
        media_files: []
      };
      folders.push(newFolder);
      data.folders = folders;

      // d) 保存
      window.libraryAPI.save(data);

      alert(`フォルダ「${newName}」を追加しました！`);
      folderModal.style.display = 'none';

      // e) 再描画
      initLibraryPage();
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

  // アプリ起動時: list
  loadPage('list');
});
