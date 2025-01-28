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
      case 'library':
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

        // 対象ページを読み込む
        fetch(`pages/${page}.html`)
          .then(res => res.text())
          .then(html => {
            content.innerHTML = html;
            if (page === 'list') initListPage();
            else if (page === 'url') initUrlPage();
            else if (page === 'library') initLibraryPage();
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

    // preload.js経由で動画一覧取得
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

      // 動画クリック
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

    // playerページに来たらフッターは非表示(上で設定済み)
    // 映像を表示
    if (globalVideo && currentIndex >= 0) {
      playerContainer.appendChild(globalVideo);
      globalVideo.style.display = 'block';
      // playerページで直接操作したいので controls=true
      globalVideo.controls = true;
    }

    backBtn.addEventListener('click', () => {
      loadPage('list');
    });
  }

  // ==========================
  // playerページ初期化
  // ==========================
  function initLibraryPage() {
    const folderListEl = document.getElementById('folderList');
    const createFolderBtn = document.getElementById('createFolderBtn');
  
    if (!folderListEl || !createFolderBtn) return;
  
    // 1. foldersをロード (もし"folders"がapp.jsの上部などで読み込まれているなら以下イメージ)
    //   例: folders = [ { id, name, videoIds, order, ... }, ...]
    //   すでに "videos" という変数がある場合、"folders" も同じように
    //   userData.json 等からpreload.jsで取得しているか、app.js冒頭で定義しているかの想定
  
    // もし folders がまだundefinedならダミー初期化など
    if (!window.folders) {
      window.folders = [
        // rootフォルダなどのダミーデータ
        {
          id: "root",
          name: "すべての動画",
          fixed: true,
          visible: true,
          videoIds: ["vid001", "vid002"],
          order: 0
        }
        // ...ユーザー作成フォルダなど
      ];
    }
  
    // 2. foldersを表示順(order)でソートして並べる
    const sortedFolders = window.folders.slice().sort((a, b) => a.order - b.order);
  
    // 3. DOM生成
    folderListEl.innerHTML = ''; // 一旦クリア
  
    sortedFolders.forEach(folder => {
      // ルートフォルダのvisibleがfalseの場合は非表示にする
      if (folder.id === 'root' && !folder.visible) {
        return; 
      }
  
      const item = document.createElement('div');
      item.classList.add('folder-item');
  
      // フォルダ名(重複不可の想定)
      const nameEl = document.createElement('div');
      nameEl.classList.add('folder-name');
      nameEl.textContent = folder.name;
  
      // 動画数などの情報
      const infoEl = document.createElement('div');
      infoEl.classList.add('folder-info');
      infoEl.textContent = `動画数: ${folder.videoIds.length}`;
  
      item.appendChild(nameEl);
      item.appendChild(infoEl);
  
      // クリックしたらフォルダ内の動画リストを表示するとか、別ページに行く等
      item.addEventListener('click', () => {
        // 例: "folderView"ページなどを作る or folder専用URLに遷移
        //      ここでは簡単に console.log
        console.log(`フォルダ "${folder.name}" をクリックしました`);
        // もしフォルダ内動画一覧を表示したいなら、別途UIを作る
      });
  
      folderListEl.appendChild(item);
    });
  
    // 4. 新規フォルダ作成ボタン
    createFolderBtn.addEventListener('click', () => {
      const folderName = prompt("新しいフォルダ名を入力してください (重複不可)");
      if (!folderName) return;
  
      // 名前の重複チェック
      const exists = folders.some(f => f.name === folderName);
      if (exists) {
        alert("そのフォルダ名はすでに存在します！");
        return;
      }
  
      // 新規フォルダ追加
      const newId = generateFolderId(); // 適宜ユニークID生成関数
      const maxOrder = Math.max(...folders.map(f => f.order));
      const newFolder = {
        id: newId,
        name: folderName,
        fixed: false,
        visible: true,
        videoIds: [],
        order: maxOrder + 1
      };
      folders.push(newFolder);
  
      // JSONファイルに保存する処理が必要ならここで実装
      // 例: saveFoldersToJson(folders);
  
      // 再表示
      initLibraryPage();
    });
  }
  
  // ユニークID生成のサンプル (簡易版)
  function generateFolderId() {
    return 'folder' + Date.now(); 
  }  



  // ==========================
  // 動画を再生
  // ==========================
  function playVideo(index) {
    if (!videos[index]) return;
    if (index === currentIndex) {
      // 同じ動画なら再ロードしない(シームレス)
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
      globalVideo.controls = false; // フッター操作 or playerページで切り替え
      globalVideo.style.display = 'none';
      hiddenHolder.appendChild(globalVideo);

      initVideoEvents(); 
    }

    // src切り替え
    if (globalVideo.src !== vid.src) {
      globalVideo.src = vid.src;
      globalVideo.load();
    }

    // フッターにサムネ/タイトルを反映
    footerThumbnail.src = vid.thumbnail || '';
    footerTitle.textContent = vid.title || '(No Title)';

    // フッター表示
    footer.style.display = 'flex';

    // 再生開始
    globalVideo.play().catch(err => console.warn(err));
  }

  // ==========================
  // フッター操作 (videoイベント)
  // ==========================
  function initVideoEvents() {
    // 再生 / 一時停止
    playPauseBtn.addEventListener('click', () => {
      if (globalVideo.paused) {
        globalVideo.play().catch(e => console.warn(e));
      } else {
        globalVideo.pause();
      }
    });

    // 動画の再生開始時 -> 毎フレームでプログレスバーを更新
    globalVideo.addEventListener('play', () => {
      playPauseBtn.textContent = '⏸';
      requestAnimationFrame(updateProgress); 
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
  // プログレスバーを requestAnimationFrame で更新
  // ==========================
  function updateProgress() {
    if (!globalVideo.paused && !globalVideo.ended) {
      const pct = (globalVideo.currentTime / globalVideo.duration) * 100 || 0;
      if (!isSeeking) {
        seekBar.value = pct;
      }
      timeDisplay.textContent = formatTime(globalVideo.currentTime);

      // 再生中は毎フレーム呼び出し
      requestAnimationFrame(updateProgress);
    } else {
      // 一時停止 or 終了 
      if (!isSeeking) {
        const pct = (globalVideo.currentTime / (globalVideo.duration || 1)) * 100 || 0;
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
    link.addEventListener('click', e => {
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
