## やること□ (なるべく優先度順)
- player.htmlを作成する 進行中
- 設定(settings)ページの追加
- ヘッダーの遷移ページをアイコン化し、ホバー時に文字で注釈
- list.html動画タイトルの下にチャンネル名入れる
- UIのブラッシュアップ！ (ページ遷移時などにfooterなどの各アイテムをスライドイン・アウトなど)

- 一覧式のUIだけでなく、縦長のリスト形式のUIを作成、設定から変更できるようにする
- ローカル環境だけで統計情報を蓄積し、ランキングなどを生成(userData.jsonなどを作成)
- footerのプログレスバーを滑らかに
- footerのボタンデザイン変更
- 動画の連続再生機能
- app.jsのコードを分割して他ファイル化(utlシリーズ化)
- pages内のファイルを順序付け
- フォルダ分け機能
- フォルダ作成機能
- pythonフォルダ追加とcomponent-1からの移行


## やったこと☑ (消化が新しい順, 積層式)
- 音量調節をフッターとplayerで同期させる
- 音量調節機能
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
- 自動連続再生
- シャッフル再生
- ダウンロード進捗
- 視聴記録をとり、グラフなどを作成できるようにする
- データ量を記録する
- 再生位置の保存


## jsonファイル記述
ダウンロード日、フォルダー所属とフォルダー内のナンバー、タイトル、
アーティスト、アルバム、トラック番号、ジャンル、年、コメント


## フォルダー分け機能の考案
フォルダ分け機能を作成するときに、順番付けやフォルダの分け方はどうするか？

以下は自分の考えで、
フォルダ表示ページ(ライブラリページ？名前未定)では、すべてのフォルダが表示される。
すべてのファイルが入っている1つのフォルダ(メディアルートフォルダ。非表示はできてもフォルダの削除は不可能、
ここでのみ各ファイルの削除が可能)があり、自分で作成・削除可能なフォルダはメディアルートフォルダの動画をそれぞれフォルダごとに表示するのみにする。

----------------------------------------------
ルートフォルダは表示・非表示の切り替えを可能に
フォルダは1階層しかない
「フォルダ」と言いつつ、「実体は動画IDのリストを持つグループ」(論理グループ)のように扱う
他フォルダでは、メディアの物理削除は避け、「このフォルダから除外」のようなニュアンスのボタンを追加する
フォルダ名重複は赦さない
jsonで疑似的にフォルダ(グループを)作成・管理する
表示順は最初のデフォルトは追加順(追加日時だと思われる)で番号を表示する。ユーザーでドラック＆ドロップで順序を変えられるようにする。
メディアの物理削除はルートフォルダのみで行えるように限定する(ルートフォルダで削除すると他のフォルダからも削除される)。他のフォルダでは論理削除のみ
----------------------------------------------

新規フォルダの扱い
・追加
名前を入力 (例:「作業用BGM」)
作成時にルートフォルダ内から選択した動画を追加する or 後で追加できる
id をユニークに発行 (folder001, GUID, etc.)
folders 配列にpush

・削除
fixed=false のフォルダのみ削除可
実際にはフォルダを配列から取り除くだけ。ファイル本体はルートフォルダに残る
videoIds はルートフォルダに影響せず、そのフォルダのリストだけ消す
「フォルダを消してもファイルは消えない」という運用


## userData.jsonの構成の考案

### データ項目のイメージ
1. 動画ごとの統計データ
再生回数 (playCount)
累計再生時間 (totalWatchTime)
最終再生日時 (lastPlayed)
ほかにも必要に応じて、
「直近再生日時のリスト」
「スキップ率」
「いいね／評価」
「途中離脱した再生時間」
…など
2. 履歴データ（オプション）
動画ID
再生開始日時・終了日時
実際に再生した秒数
などなど
3. 動画のメタデータやランキング
動画IDをキーに再生回数などの統計を参照してランキングを生成
例：「累計再生回数トップ10」「累計再生時間トップ10」「最後に再生した日時が新しい順」など