// src/js/libraryPage.js
import { modalManager } from './modalManager.js';

export function initLibraryPage() {
  console.log("initLibraryPage");
  const folderListEl = document.getElementById('folderList');
  const createFolderBtn = document.getElementById('createFolderBtn');

  if (!folderListEl || !createFolderBtn) {
    console.error("library.html のDOM要素が見つかりません。");
    return;
  }

  // フォルダー作成ボタンのイベントハンドラを直接設定（再初期化時も上書きされる）
  createFolderBtn.onclick = () => {
    modalManager.open((folderName) => {
      if (!folderName) {
        alert("フォルダ名を入力してください");
        return;
      }
      let data = window.libraryAPI.load();
      let folders = data.folders || [];
      const dup = folders.some(f => f.folderName === folderName && f.visible);
      if (dup) {
        alert("同名フォルダが既に存在します！");
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
      // ライブラリ一覧を更新
      initLibraryPage();
    });
  };

  // JSONをfetchしてフォルダ一覧を表示
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
      console.error("libraryData.jsonの読み込みに失敗しました:", err);
      folderListEl.innerHTML = `<p style="color:red">フォルダ情報の読み込みに失敗しました</p>`;
    });
}
