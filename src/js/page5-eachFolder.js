// src/js/page5-eachFolder.js
import { loadPage } from './navigation.js';

export function initEachFolderPage() {
  console.log("initEachFolderPage");
  // クリックされたフォルダーのIDは、page2-library.js で window.selectedFolderId に設定されている前提です
  const folderId = window.selectedFolderId;
  const folderTitleEl = document.getElementById('folderTitle');
  const mediaListEl = document.getElementById('mediaList');

  if (!folderId) {
    folderTitleEl.textContent = "フォルダが選択されていません";
    return;
  }

  // libraryAPI.load() で userData.json もしくは libraryData.json を読み込む
  let data = window.libraryAPI.load();
  const folder = data.folders.find(f => f.folderId === folderId && f.visible);
  if (!folder) {
    folderTitleEl.textContent = "指定されたフォルダが見つかりません";
    return;
  }

  // フォルダーのタイトルを表示
  folderTitleEl.textContent = folder.folderName;

  // ここでは、folder.media_files に格納されたメディア情報を表示する例です。
  // 例として、page1-list.js の動画一覧表示を参考にしています。
  mediaListEl.innerHTML = '';
  if (folder.media_files && folder.media_files.length > 0) {
    folder.media_files.forEach(media => {
      const item = document.createElement('div');
      item.classList.add('media-item');

      const thumb = document.createElement('img');
      // media.thumbnail がある場合はそれを使用し、なければプレースホルダー画像
      thumb.src = media.thumbnail || 'placeholder.png';

      const title = document.createElement('div');
      title.classList.add('media-title');
      title.textContent = media.mediaName || '(No Title)';

      item.appendChild(thumb);
      item.appendChild(title);

      item.addEventListener('click', () => {
        console.log(`メディア "${media.mediaName}" がクリックされました。`);
        // 必要に応じて、別のページ（例：動画プレイヤー）の遷移処理を実装
      });

      mediaListEl.appendChild(item);
    });
  } else {
    mediaListEl.innerHTML = '<p>このフォルダにはメディアがありません</p>';
  }
}

// 自動初期化
document.addEventListener('DOMContentLoaded', initEachFolderPage);
