// src/js/page5-eachFolder.js
import { loadPage } from './navigation.js';

export function initEachFolderPage() {
  console.log("initEachFolderPage");
  const folderTitleEl = document.getElementById('folderTitle');
  const mediaListEl = document.getElementById('mediaList');
  
  // クリック時に設定した selectedFolderId を利用
  const folderId = window.selectedFolderId;
  if (!folderId) {
    folderTitleEl.textContent = "フォルダが選択されていません";
    return;
  }
  
  let data = window.libraryAPI.load();
  const folder = data.folders.find(f => f.folderId === folderId && f.visible);
  if (!folder) {
    folderTitleEl.textContent = "指定されたフォルダが見つかりません";
    return;
  }
  
  // フォルダー名を表示
  folderTitleEl.textContent = folder.folderName;
  
  // folder.media_files を利用して、各メディアを表示（page1-list.js を参考）
  mediaListEl.innerHTML = '';
  if (folder.media_files && folder.media_files.length > 0) {
    folder.media_files.forEach(media => {
      const item = document.createElement('div');
      item.classList.add('media-item');
      
      const thumb = document.createElement('img');
      thumb.src = media.thumbnail || 'placeholder.png';
      
      const title = document.createElement('div');
      title.classList.add('media-title');
      title.textContent = media.mediaName || '(No Title)';
      
      item.appendChild(thumb);
      item.appendChild(title);
      
      item.addEventListener('click', () => {
        console.log(`メディア "${media.mediaName}" がクリックされました。`);
        // 必要に応じて、動画プレイヤーへの遷移処理を追加
      });
      
      mediaListEl.appendChild(item);
    });
  } else {
    mediaListEl.innerHTML = '<p>このフォルダにはメディアがありません</p>';
  }
}

// 自動初期化
document.addEventListener('DOMContentLoaded', initEachFolderPage);
