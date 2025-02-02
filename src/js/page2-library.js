// src/js/libraryPage.js
export function initLibraryPage() {
  console.log("initLibraryPage");
  const folderListEl = document.getElementById('folderList');
  const createFolderBtn = document.getElementById('createFolderBtn');

  // モーダル関連の DOM 要素
  const folderModal = document.getElementById('folderModal');
  const folderNameInput = document.getElementById('folderNameInput');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const okModalBtn = document.getElementById('okModalBtn');

  if (!folderListEl || !createFolderBtn ||
      !folderModal || !folderNameInput ||
      !cancelModalBtn || !okModalBtn) {
    console.error("library.html DOM not found.");
    return;
  }

  // JSON を fetch してフォルダ一覧を表示
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
      const filtered = allFolders.filter(f => f.visible === true);
      filtered.sort((a, b) => (a.folderOrder || 0) - (b.folderOrder || 0));

      folderListEl.innerHTML = '';
      filtered.forEach(folder => {
        const item = document.createElement('div');
        item.classList.add('folder-item');

        const nameEl = document.createElement('div');
        nameEl.classList.add('folder-name');
        nameEl.textContent = folder.folderName;

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

  // 「新規フォルダ作成」ボタンの処理
  createFolderBtn.addEventListener('click', () => {
    folderNameInput.value = '';
    folderModal.style.display = 'flex';
    setTimeout(() => folderNameInput.focus(), 50);
  });
  cancelModalBtn.addEventListener('click', () => {
    folderModal.style.display = 'none';
  });
  if (!okModalBtn.dataset.bound) {
    okModalBtn.addEventListener('click', onClickCreateFolder);
    okModalBtn.dataset.bound = 'yes';
  }

  function onClickCreateFolder() {
    let data = window.libraryAPI.load();
    let folders = data.folders || [];
    const maxOrder = (folders.length > 0) ? Math.max(...folders.map(f => f.folderOrder || 0)) : 0;
    const rawName = folderNameInput.value.trim();
    const newName = rawName || `フォルダー${maxOrder + 1}`;

    const dup = folders.some(f => f.folderName === newName && f.visible);
    if (dup) {
      alert("同名フォルダが既に存在します！");
      return;
    }
    const newId = 'folder' + Date.now();
    const newFolder = {
      folderId: newId,
      folderName: newName,
      folderOrder: maxOrder + 1,
      delete: true,
      visible: true,
      files_count: 0,
      media_files: []
    };
    folders.push(newFolder);
    data.folders = folders;

    window.libraryAPI.save(data);
    alert(`フォルダ「${newName}」を追加しました！`);
    folderModal.style.display = 'none';
    initLibraryPage();
  }
}
