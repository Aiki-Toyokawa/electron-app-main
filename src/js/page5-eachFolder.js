// src/js/page5-eachFolder.js
import { loadPage } from './navigation.js';

export function initEachFolderPage() {
  console.log("initEachFolderPage");
  const folderTitleEl = document.getElementById('folderTitle');
  const mediaListEl = document.getElementById('mediaList');
  const addVideoBtn = document.getElementById('addVideoBtn');
  const addVideoModal = document.getElementById('addVideoModal');
  const videoOptionsEl = document.getElementById('videoOptions');
  const cancelAddVideoBtn = document.getElementById('cancelAddVideoBtn');

  // 選択したフォルダーIDは、page2-library.js で window.selectedFolderId に保存されている前提
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
  
  // メディア一覧を表示する関数
  function updateMediaList() {
    // 再度ライブラリデータから対象フォルダーを取得
    data = window.libraryAPI.load();
    const currentFolder = data.folders.find(f => f.folderId === folderId && f.visible);
    if (!currentFolder) return;
    
    mediaListEl.innerHTML = '';
    if (currentFolder.media_files && currentFolder.media_files.length > 0) {
      currentFolder.media_files.forEach(media => {
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
          // 必要に応じて動画プレイヤーへの遷移などを実装
        });
        
        mediaListEl.appendChild(item);
      });
    } else {
      mediaListEl.innerHTML = '<p>このフォルダにはメディアがありません</p>';
    }
  }
  
  updateMediaList();
  
  // --- 動画追加モーダルの処理 ---
  addVideoBtn.onclick = () => {
    // グローバルな動画一覧 (window.videos) から、既にフォルダに登録されていない動画を抽出
    let availableVideos = [];
    if (window.videos && Array.isArray(window.videos)) {
      // 重複チェック用に、現在のフォルダの media_files の mediaId を取得
      const currentFolder = data.folders.find(f => f.folderId === folderId && f.visible);
      const existingIds = currentFolder && currentFolder.media_files
        ? currentFolder.media_files.map(m => m.id)
        : [];
      availableVideos = window.videos.filter(video => !existingIds.includes(video.id));
    }
    
    // 動画選択リストを生成
    videoOptionsEl.innerHTML = '';
    if (availableVideos.length === 0) {
      videoOptionsEl.innerHTML = '<p>追加可能な動画がありません</p>';
    } else {
      availableVideos.forEach(video => {
        const option = document.createElement('div');
        option.classList.add('video-option');
        
        const thumb = document.createElement('img');
        thumb.src = video.thumbnail || 'placeholder.png';
        
        const title = document.createElement('div');
        title.textContent = video.title || '(No Title)';
        
        option.appendChild(thumb);
        option.appendChild(title);
        
        option.addEventListener('click', () => {
          // 動画をフォルダーに追加
          data = window.libraryAPI.load();
          const folderToUpdate = data.folders.find(f => f.folderId === folderId && f.visible);
          if (folderToUpdate) {
            // ここでは、動画の id, title, thumbnail を格納
            const newMedia = {
              id: video.id,
              mediaName: video.title,
              thumbnail: video.thumbnail
            };
            folderToUpdate.media_files = folderToUpdate.media_files || [];
            folderToUpdate.media_files.push(newMedia);
            window.libraryAPI.save(data);
            updateMediaList();
          }
          // モーダルを閉じる
          addVideoModal.style.display = 'none';
        });
        
        videoOptionsEl.appendChild(option);
      });
    }
    addVideoModal.style.display = 'flex';
  };
  
  cancelAddVideoBtn.onclick = () => {
    addVideoModal.style.display = 'none';
  };
}

// 自動初期化
document.addEventListener('DOMContentLoaded', initEachFolderPage);
