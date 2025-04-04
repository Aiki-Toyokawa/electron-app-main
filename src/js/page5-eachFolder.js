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
  
  const deleteMediaModal = document.getElementById('deleteMediaModal');
  const mediaDeleteCancelBtn = document.getElementById('mediaDeleteCancelBtn');
  const mediaDeleteConfirmBtn = document.getElementById('mediaDeleteConfirmBtn');
  
  // 選択されたフォルダーIDは、page2-library.js で window.selectedFolderId に保存される前提
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
  
  // 変数：削除対象メディアの index を保持
  let mediaToDeleteIndex = null;
  
  // メディア一覧表示関数
  function updateMediaList() {
    data = window.libraryAPI.load();
    const currentFolder = data.folders.find(f => f.folderId === folderId && f.visible);
    if (!currentFolder) return;
    
    mediaListEl.innerHTML = '';
    if (currentFolder.media_files && currentFolder.media_files.length > 0) {
      currentFolder.media_files.forEach((media, idx) => {
        const item = document.createElement('div');
        item.classList.add('media-item');
        
        const thumb = document.createElement('img');
        thumb.src = media.mediaThumbnail || 'placeholder.png';
        
        const title = document.createElement('div');
        title.classList.add('media-title');
        title.textContent = media.mediaName || '(No Title)';
        
        // クリック時に再生ページへ遷移する
        item.addEventListener('click', (e) => {
          // クリック対象が削除アイコンの場合は除外
          if (e.target.classList.contains('media-delete-icon')) return;
          console.log(`メディア "${media.mediaName}" がクリックされました。`);
          window.selectedMedia = media; // player ページで再生用
          loadPage('page3-player');
        });
        
        // 削除アイコンの追加
        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('media-delete-icon');
        deleteIcon.textContent = "🗑️";
        deleteIcon.onclick = (e) => {
          e.stopPropagation();
          mediaToDeleteIndex = idx;
          openDeleteMediaModal();
        };
        
        item.appendChild(thumb);
        item.appendChild(title);
        item.appendChild(deleteIcon);
        
        mediaListEl.appendChild(item);
      });
    } else {
      mediaListEl.innerHTML = '<p>このフォルダにはメディアがありません</p>';
    }
  }
  
  updateMediaList();
  
  // --- 動画追加モーダルの処理 ---
  addVideoBtn.onclick = () => {
    let availableVideos = [];
    if (window.videos && Array.isArray(window.videos)) {
      // ここでは、同じ動画も複数回追加できるように重複チェックは行わない
      availableVideos = window.videos;
    }
    
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
          data = window.libraryAPI.load();
          const folderToUpdate = data.folders.find(f => f.folderId === folderId && f.visible);
          if (folderToUpdate) {
            folderToUpdate.media_files = folderToUpdate.media_files || [];
            const newOrder = folderToUpdate.media_files.length + 1;
            const newMedia = {
              mediaId: video.id,
              mediaName: video.title,
              mediaPath: video.src,         // 再生用パス
              mediaThumbnail: video.thumbnail,
              mediaOrder: newOrder
            };
            folderToUpdate.media_files.push(newMedia);
            window.libraryAPI.save(data);
            updateMediaList();
          }
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
  
  // --- メディア削除モーダルの処理 ---
  function openDeleteMediaModal() {
    deleteMediaModal.style.display = 'flex';
  }
  
  mediaDeleteCancelBtn.onclick = () => {
    deleteMediaModal.style.display = 'none';
    mediaToDeleteIndex = null;
  };
  
  mediaDeleteConfirmBtn.onclick = () => {
    if (mediaToDeleteIndex === null) return;
    data = window.libraryAPI.load();
    const folderToUpdate = data.folders.find(f => f.folderId === folderId && f.visible);
    if (folderToUpdate && folderToUpdate.media_files) {
      folderToUpdate.media_files.splice(mediaToDeleteIndex, 1);
      window.libraryAPI.save(data);
      updateMediaList();
    }
    deleteMediaModal.style.display = 'none';
    mediaToDeleteIndex = null;
  };
}

// 自動初期化
document.addEventListener('DOMContentLoaded', initEachFolderPage);
