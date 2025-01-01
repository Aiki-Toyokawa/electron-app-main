// src/api/videoAPI.js
const fs = require('fs');
const path = require('path');

function getVideoData() {
  const dlPath = path.join(__dirname, '..', 'dl');
  const videoFolders = fs.readdirSync(dlPath);

  const videos = videoFolders.map(folder => {
    const folderPath = path.join(dlPath, folder);
    const infoPath = path.join(folderPath, 'info.json');

    if (fs.existsSync(infoPath)) {
      const infoData = fs.readFileSync(infoPath);
      const info = JSON.parse(infoData);

      return {
        id: info.videoId,
        title: info.raw_data.title,
        author: info.author,
        time: info.timeDisplay,
        videoQuality: info.videoQuality,
        audioQuality: info.audioQuality,
        src: `file://${path.join(__dirname, '..', 'dl', folder, 'media.mp4').replace(/\\/g, '/')}`,  // file://を追加
        thumbnail: `file://${path.join(__dirname, '..', 'dl', folder, 'thumbnail.png').replace(/\\/g, '/')}`,  // file://を追加
      };
    }
    return null;
  }).filter(video => video !== null);

  return videos;
}

module.exports = {
  getVideoData
};
