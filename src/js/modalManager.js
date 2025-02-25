// src/js/modalManager.js
export const modalManager = (() => {
  let modal, folderNameInput, okButton, cancelButton;
  let confirmCallback = null;

  // モーダル初期化（DOMに一度だけ存在する前提）
  function init() {
    modal = document.getElementById('folderModal');
    folderNameInput = document.getElementById('folderNameInput');
    okButton = document.getElementById('okModalBtn');
    cancelButton = document.getElementById('cancelModalBtn');

    if (!modal || !folderNameInput || !okButton || !cancelButton) {
      console.error("モーダル要素が見つかりません。index.htmlにモーダルマークアップが正しく配置されているか確認してください。");
      return;
    }

    okButton.addEventListener('click', () => {
      if (confirmCallback) {
        const folderName = folderNameInput.value.trim();
        confirmCallback(folderName);
      }
      close();
    });

    cancelButton.addEventListener('click', close);
  }

  // モーダルを開く（onConfirm: OK押下時のコールバック）
  function open(onConfirm) {
    if (!modal) {
      console.error("モーダルが初期化されていません");
      return;
    }
    confirmCallback = onConfirm;
    folderNameInput.value = "";
    modal.style.display = "flex";
    setTimeout(() => folderNameInput.focus(), 50);
  }

  // モーダルを閉じる
  function close() {
    if (modal) {
      modal.style.display = "none";
      confirmCallback = null;
    }
  }

  return { init, open, close };
})();
