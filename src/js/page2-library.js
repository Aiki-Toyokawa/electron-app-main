// src/js/page2-library.js
export function initLibraryPage() {
  console.log("initLibraryPage");
  const folderListEl = document.getElementById('folderList');
  const createFolderBtn = document.getElementById('createFolderBtn');
  const folderModal = document.getElementById('folderModal');
  const folderNameInput = document.getElementById('folderNameInput');
  const okModalBtn = document.getElementById('okModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const folderError = document.getElementById('folderError');

  if (!folderListEl || !createFolderBtn || !folderModal || !folderNameInput || !okModalBtn || !cancelModalBtn || !folderError) {
    console.error("必要なDOM要素が見つかりません");
    return;
  }

  // モーダルを開く：必ず入力欄とエラー状態をリセット
  createFolderBtn.onclick = () => {
    folderNameInput.value = "";
    folderNameInput.disabled = false;
    folderError.textContent = "";
    folderError.style.display = 'none';
    folderModal.style.display = 'flex';
    setTimeout(() => folderNameInput.focus(), 50);
  };

  // モーダルのキャンセル：状態をリセットして閉じる
  cancelModalBtn.onclick = () => {
    folderModal.style.display = 'none';
    folderNameInput.value = "";
    folderError.textContent = "";
    folderError.style.display = 'none';
  };

  // モーダルの作成ボタン処理
  okModalBtn.onclick = () => {
    const folderName = folderNameInput.value.trim();
    if (!folderName) {
      folderError.textContent = "フォルダ名を入力してください";
      folderError.style.display = 'block';
      folderNameInput.focus();
      return;
    }
    let data = window.libraryAPI.load();
    let folders = data.folders || [];
    if (folders.some(f => f.folderName === folderName && f.visible)) {
      folderError.textContent = "同名フォルダが既に存在します！";
      folderError.style.display = 'block';
      folderNameInput.focus();
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
    // 正常に作成できた場合、モーダルを閉じ、状態をリセットして一覧を更新
    folderModal.style.display = 'none';
    folderNameInput.value = "";
    folderError.textContent = "";
    folderError.style.display = 'none';
    updateFolderList();
  };

  // 入力が始まったらエラー表示をクリア
  folderNameInput.addEventListener('input', () => {
    folderError.textContent = "";
    folderError.style.display = 'none';
  });

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
