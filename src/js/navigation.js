// src/js/navigation.js
import { initListPage }    from './page1-list.js';
import { initLibraryPage } from './page2-library.js';
import { initPlayerPage }  from './page3-player.js';
import { initUrlPage }     from './page4-url.js';
import { initEachFolderPage } from './page5-eachFolder.js';

export function loadPage(page) {
  const content = document.getElementById('content');
  const footer = document.getElementById('footer');
  const hiddenHolder = document.getElementById('hiddenHolder');
  console.log(`loadPage called: ${page}`);

  switch (page) {
    case 'page1-list':
    case 'page2-library':
    case 'page4-url': {
      // プレイヤー以外の場合、video 要素を非表示のホルダーへ戻す
      if (window.globalVideo && hiddenHolder) {
        hiddenHolder.appendChild(window.globalVideo);
        window.globalVideo.style.display = 'none';
      }
      footer.style.display = (window.currentIndex >= 0) ? 'flex' : 'none';
      
      // 対応する HTML ファイルを fetch してコンテンツ領域に挿入
      fetch(`pages/${page}.html`)
        .then(res => res.text())
        .then(html => {
          content.innerHTML = html;
          if (page === 'page1-list') {
            initListPage();
          } else if (page === 'page2-library') {
            initLibraryPage();
          } else if (page === 'page4-url') {
            initUrlPage();
          }
        })
        .catch(err => {
          console.error(`Error loading ${page} page`, err);
          content.innerHTML = `<h2>Error loading ${page} page</h2>`;
        });
      break;
    }
    case 'page3-player': {
      console.log("loading player page...");
      footer.style.display = 'none';
      fetch('pages/page3-player.html')
        .then(res => res.text())
        .then(html => {
          content.innerHTML = html;
          initPlayerPage();
        })
        .catch(err => {
          console.error("Error loading player page:", err);
          content.innerHTML = '<h2>Error loading player page</h2>';
        });
      break;
    }
    case 'page5-eachFolder': {
      console.log("loading each folder page...");
      // 遷移先は、フォルダー詳細ページ（page5）
      footer.style.display = 'none';
      fetch('pages/page5-eachFolder.html')
        .then(res => res.text())
        .then(html => {
          content.innerHTML = html;
          initEachFolderPage();
        })
        .catch(err => {
          console.error("Error loading each folder page:", err);
          content.innerHTML = '<h2>Error loading each folder page</h2>';
        });
      break;
    }
    default:
      content.innerHTML = '<h2>404 Not Found</h2>';
  }
}

export function initNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
    });
  });
  // 初期表示は page1-list ページ
  loadPage('page1-list');
}
