// src/js/page2-library.js
import { loadPage } from './navigation.js';

export function initLibraryPage() {
  console.log("initLibraryPage");
  const folderListEl = document.getElementById('folderList');
  const createFolderBtn = document.getElementById('createFolderBtn');
  const folderModal = document.getElementById('folderModal');
  const folderNameInput = document.getElementById('folderNameInput');
  const okModalBtn = document.getElementById('okModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const folderError = document.getElementById('folderError');
  
  const deleteFolderModal = document.getElementById('deleteFolderModal');
  const deleteCancelBtn = document.getElementById('deleteCancelBtn');
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

  if (!folderListEl || !createFolderBtn || !folderModal || !folderNameInput || !okModalBtn || !cancelModalBtn || !folderError ||
      !deleteFolderModal || !deleteCancelBtn || !deleteConfirmBtn) {
    console.error("必要なDOM要素が見つかりません");
    return;
  }
  
  // --- フォルダ作成モーダルの処理 ---
  createFolderBtn.onclick = () => {
    folderNameInput.value = "";
    folderNameInput.disabled = false;
    folderError.textContent = "";
    folderError.style.display = 'none';
    folderModal.style.display = 'flex';
    setTimeout(() => folderNameInput.focus(), 50);
  };

  cancelModalBtn.onclick = () => {
    folderModal.style.display = 'none';
    folderNameInput.value = "";
    folderError.textContent = "";
    folderError.style.display = 'none';
  };

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
      deletable: true, // 作成時は削除可能なフォルダとして作成
      visible: true,
      files_count: 0,
      media_files: []
    };
    folders.push(newFolder);
    data.folders = folders;
    window.libraryAPI.save(data);
    folderModal.style.display = 'none';
    folderNameInput.value = "";
    folderError.textContent = "";
    folderError.style.display = 'none';
    updateFolderList();
  };

  // --- 削除確認モーダルの処理 ---
  deleteCancelBtn.onclick = () => {
    deleteFolderModal.style.display = 'none';
  };

  let folderToDeleteId = null; // 削除対象のフォルダIDを保持

  deleteConfirmBtn.onclick = () => {
    if (!folderToDeleteId) return;
    let data = window.libraryAPI.load();
    data.folders = data.folders.filter(f => f.folderId !== folderToDeleteId);
    window.libraryAPI.save(data);
    deleteFolderModal.style.display = 'none';
    folderToDeleteId = null;
    updateFolderList();
  };

  // --- 入力エラークリア ---
  folderNameInput.addEventListener('input', () => {
    folderError.textContent = "";
    folderError.style.display = 'none';
  });

  // --- フォルダー一覧の更新 ---
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

          // deletable が true の場合、ゴミ箱アイコンを追加
          if (folder.deletable) {
            const deleteIcon = document.createElement('span');
            deleteIcon.classList.add('delete-icon');
            deleteIcon.textContent = "🗑️";
            deleteIcon.onclick = (e) => {
              e.stopPropagation();
              folderToDeleteId = folder.folderId;
              openDeleteModal();
            };
            item.appendChild(deleteIcon);
          }

          // フォルダー項目クリック時：選択したフォルダーIDをグローバル変数に保存して page5 へ遷移
          item.addEventListener('click', () => {
            console.log(`フォルダ "${folder.folderName}" がクリックされました。`);
            window.selectedFolderId = folder.folderId;
            loadPage('page5-eachFolder');
          });

          folderListEl.appendChild(item);
        });
      })
      .catch(err => {
        console.error("libraryData.json の読み込みに失敗しました:", err);
        folderListEl.innerHTML = `<p style="color:red">フォルダ情報の読み込みに失敗しました</p>`;
      });
  }

  function openDeleteModal() {
    deleteFolderModal.style.display = 'flex';
  }

  // 初回フォルダー一覧表示
  updateFolderList();
}
