// src/js/navigation.js
import { initListPage } from './listPage.js';
import { initUrlPage } from './urlPage.js';
import { initPlayerPage } from './playerPage.js';
import { initLibraryPage } from './libraryPage.js';

export function loadPage(page) {
  const content = document.getElementById('content');
  const footer = document.getElementById('footer');
  const hiddenHolder = document.getElementById('hiddenHolder');
  console.log(`loadPage called: ${page}`);

  switch (page) {
    case 'list':
    case 'url':
    case 'library': {
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
          if (page === 'list') initListPage();
          else if (page === 'url') initUrlPage();
          else if (page === 'library') initLibraryPage();
        })
        .catch(err => {
          console.error(`Error loading ${page} page`, err);
          content.innerHTML = `<h2>Error loading ${page} page</h2>`;
        });
      break;
    }
    case 'player': {
      console.log("loading player page...");
      footer.style.display = 'none';
      fetch('pages/player.html')
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
  // 初期表示は list ページ
  loadPage('list');
}
