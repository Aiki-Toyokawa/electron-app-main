// src/preload.js
const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const videoAPI = require(path.join(__dirname, 'api', 'videoAPI'));

// 1) videoAPI (既存) を公開
contextBridge.exposeInMainWorld('videoAPI', {
  getVideoData: videoAPI.getVideoData
});

// 2) libraryData.json の読み書きAPI

// libraryData.json のパスを確定
const libraryDataPath = path.join(__dirname, 'data', 'libraryData.json');

function loadLibraryData() {
  let json = { folders: [] };
  try {
    if (fs.existsSync(libraryDataPath)) {
      const raw = fs.readFileSync(libraryDataPath, 'utf-8');
      json = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read libraryData.json:", e);
  }
  return json;
}

function saveLibraryData(data) {
  try {
    fs.writeFileSync(libraryDataPath, JSON.stringify(data, null, 2));
    console.log("libraryData.json updated:", libraryDataPath);
  } catch (e) {
    console.error("Failed to write libraryData.json:", e);
  }
}

// libraryAPI を公開
contextBridge.exposeInMainWorld('libraryAPI', {
  load: () => loadLibraryData(),
  save: (data) => saveLibraryData(data)
});
