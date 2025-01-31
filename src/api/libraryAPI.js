// src/api/libraryAPI.js
const fs = require('fs');
const path = require('path');

// libraryData.json のパス (apiフォルダから見て ../data/libraryData.json)
const libraryDataPath = path.join(__dirname, '..', 'data', 'libraryData.json');

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

module.exports = {
  loadLibraryData,
  saveLibraryData
};
