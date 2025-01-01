## 現在のフォルダ構成
- node_modules
- src
  - dl (動画フォルダ)
    - 各動画フォルダ (フォルダ名は動画ID)
      - info.json
      - music.mp4
      - thumbnail.png
  - api
    - videoAPI.js
  - assets (アイコンや画像)
    - icons
    - imgs
  - components (htmlやcssなどでのコンポーネント定義)
  - data
    - userData.json (ユーザーのデータや再生履歴などが記録される)
  - pages
    - player.html
    - folder.html
  - styles
    - global.css
  - app.js
  - index.html (pagesへのルーティングファイル)
  - main.js (エントリーポイント)
  - preload.js
- .gitignore
- package-lock.json
- package.json
- README.md

## フロー
- main.jsがindex.htmlをロード。
- index.htmlにはapp.jsが含まれ、ページ遷移の管理を行う。
- app.jsでplayer.htmlを動的にロードし、videoAPIを通して取得した動画情報を表示。
- videoAPIがローカルのdlフォルダから動画データを取得し、サムネイルとタイトルをリスト表示。
- ユーザーが動画をクリックすると、その動画が再生される。
  
main.js -> index.html -> app.js -> videoAPI.js -> player.html

## ページ遷移表
SPA部分
- ヘッダーorハンバーガーメニュー(各ページへのリンク)
- フッター(音楽を再生しているときのみ)
- 

ホーム画面(各音楽フォルダ表示) -> 音楽ファイル表示ページ -> 


## やることリスト
- 自動再生
- シャッフル再生
- 並び替え(フォルダ・ファイル)
- フォルダ機能
- コピー機能
- 削除機能
- ダウンロード進捗
- オプションページ
- フッターで再生されてるやつ表示
- src/dataで視聴記録をとり、グラフなどを作成できるようにする
- src/dataでデータ量を記録する
- 再生位置の保存
- 
## jsonファイル記述
ダウンロード日、フォルダー所属とフォルダー内のナンバー、タイトル、アーティスト、アルバム、トラック番号、ジャンル、年、コメント