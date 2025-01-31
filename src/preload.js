// src/preload.js
const { contextBridge } = require('electron');
const path = require('path');

// 1) videoAPI を読み込み
const videoAPI = require(path.join(__dirname, 'api', 'videoAPI'));

// 2) libraryAPI を読み込み
const libraryAPI = require(path.join(__dirname, 'api', 'libraryAPI'));

// -------------------------
// videoAPI を公開
contextBridge.exposeInMainWorld('videoAPI', {
  getVideoData: videoAPI.getVideoData
});

// -------------------------
// libraryData.json 読み書きAPI を公開
// （loadLibraryData, saveLibraryData を使う）
contextBridge.exposeInMainWorld('libraryAPI', {
  load: () => libraryAPI.loadLibraryData(),
  save: (data) => libraryAPI.saveLibraryData(data)
});
