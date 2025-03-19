// src/js/page2-library.js
export function initLibraryPage() {
  console.log("initLibraryPage");
  const folderListEl = document.getElementById('folderList');
  const createFolderBtn = document.getElementById('createFolderBtn');
  const folderCreationForm = document.getElementById('folderCreationForm');
  const newFolderNameInput = document.getElementById('newFolderName');
  const submitFolderBtn = document.getElementById('submitFolderBtn');
  const cancelFolderBtn = document.getElementById('cancelFolderBtn');

  if (!folderListEl || !createFolderBtn || !folderCreationForm ||
      !newFolderNameInput || !submitFolderBtn || !cancelFolderBtn) {
    console.error("必要なDOM要素が見つかりません。");
    return;
  }

  // 初回のみイベントリスナーを設定（複数回呼ばれても再登録しない）
  if (!createFolderBtn.dataset.bound) {
    createFolderBtn.onclick = () => {
      // 表示前に必ず入力欄をクリアし、disabled状態を解除
      newFolderNameInput.value = "";
      newFolderNameInput.disabled = false;
      folderCreationForm.style.display = 'block';
      newFolderNameInput.focus();
    };
    submitFolderBtn.onclick = () => {
      const folderName = newFolderNameInput.value.trim();
      if (!folderName) {
        alert("フォルダ名を入力してください");
        newFolderNameInput.focus();
        return;
      }
      let data = window.libraryAPI.load();
      let folders = data.folders || [];
      const dup = folders.some(f => f.folderName === folderName && f.visible);
      if (dup) {
        alert("同名フォルダが既に存在します！");
        newFolderNameInput.focus();
        return;
      }
      const maxOrder = folders.length > 0 ? Math.max(...folders.map(f => f.folderOrder || 0)) : 0;
      const newFolder = {
        folderId: 'folder' + Date.now(),
        folderName: folderName,
        folderOrder: maxOrder + 1,
        deletable: true,
        visible: true,
        files_count: 0,
        media_files: []
      };
      folders.push(newFolder);
      data.folders = folders;
      window.libraryAPI.save(data);
      alert(`フォルダ「${folderName}」を追加しました！`);
      folderCreationForm.style.display = 'none';
      updateFolderList();
    };
    cancelFolderBtn.onclick = () => {
      folderCreationForm.style.display = 'none';
    };
    createFolderBtn.dataset.bound = 'true';
  }

  // フォルダー一覧部分のみを更新する関数
  function updateFolderList() {
    fetch('./data/libraryData.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`libraryData.json の読み込みに失敗しました: ${res.status}`);
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
          const fileCount = folder.files_count != null ? folder.files_count : (folder.media_files ? folder.media_files.length : 0);
          infoEl.textContent = `動画数: ${fileCount}`;

          item.appendChild(nameEl);
          item.appendChild(infoEl);

          item.addEventListener('click', () => {
            console.log(`フォルダ "${folder.folderName}" がクリックされました。`);
          });
          folderListEl.appendChild(item);
        });
      })
      .catch(err => {
        console.error("libraryData.json の読み込みに失敗しました:", err);
        folderListEl.innerHTML = `<p style="color:red">フォルダ情報の読み込みに失敗しました</p>`;
      });
  }

  // 初回フォルダー一覧表示
  updateFolderList();
}
