## やること□ (なるべく優先度順)
- 動画タイトルの下にチャンネル名入れる
- player.htmlを作成する 難航中
- 音量調節機能
- footerのプログレスバー変更
- footerのアイコンなどデザイン変更
- 動画の連続再生機能
- app.jsのコードを分割して他ファイル化(utlシリーズ化)
- pages内のファイルを順序付け
- フォルダ分け機能
- フォルダ作成機能
- pythonフォルダ追加とcomponent-1からの移行


## やったこと☑ (消化が新しい順, 積層式)
- グローバル要素にvideoを置き、シームレスに再生を行う
- URL入力ページ作成
- ヘッダーを固定化
- video-itemにカーソル合わせたときに背景をグレイ化
- video-itemの動画タイトルが長いのを...で省略する


## 心構え
- UIでmarginを入れるときは常にmargin-topのみ、下にmarginを入れない(上下のmargin同士が競合して対消滅するから)


## 現在のフォルダ構成
root directory
- node_modules
- src
  - dl (動画フォルダ)
    - 各動画フォルダ (フォルダ名は動画ID)
      - info.json
      - media.mp4
      - thumbnail.png
      - each_media_title.title (各動画のタイトルがファイルの名前になる)
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