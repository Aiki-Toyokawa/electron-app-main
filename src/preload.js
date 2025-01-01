// src/preload.js
const { contextBridge } = require('electron');
const path = require('path');
const videoAPI = require(path.join(__dirname, 'api', 'videoAPI'));

// videoAPIをレンダラープロセスに公開
contextBridge.exposeInMainWorld('videoAPI', {
  getVideoData: videoAPI.getVideoData
});
