// src/js/urlPage.js
export function initUrlPage() {
  console.log("initUrlPage");
  const urlForm = document.getElementById('urlForm');
  if (!urlForm) return;

  urlForm.addEventListener('submit', e => {
    e.preventDefault();
    const urlInput = document.getElementById('urlInput').value.trim();
    console.log("URL submitted:", urlInput);
    // TODO: URL に基づく処理を実装
  });
}
