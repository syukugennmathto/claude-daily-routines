# ChunkPaste（仮）

長い文字列をクリップボードにコピーすると、自動で **75 文字ごと** に分割して一覧表示する Android アプリです。分割されたチャンクはタップするだけで再びクリップボードにコピーできます。

- 開発言語: **Kotlin**
- UI: **Jetpack Compose** + **Material Design 3**（Dynamic Color / ダークモード対応）
- ターゲット: **Samsung Galaxy（Android 12 / API 31 以上）** ・One UI 環境を想定
- `minSdk 31` / `targetSdk 34`

## 機能

| 機能 | 説明 |
| --- | --- |
| クリップボード監視 | フォアグラウンド時に `ClipboardManager` で変化を監視し、新しいテキストを自動分割 |
| 分割ロジック | 75 文字ごとにスライス（端数は最後のチャンクへ）。重複するテキストは追加しない |
| チャンク一覧 | `LazyColumn` でカード表示。番号「1 / 3」＋先頭 30 文字プレビュー＋文字数 |
| タップでコピー | カードをタップするとクリップボードへコピーし、Snackbar で「コピーしました」 |
| クリア | 上部バーのボタンで全チャンクを一括削除 |
| 自動コピーモード（任意実装） | 上部バー右のトグルで ON。ON 中は FAB「次をコピー」で順番にコピーして自動で次へ進む |

## ファイル構成

```
app/src/main/java/com/example/chunkpaste/
├── MainActivity.kt          # エントリポイント。onResume/onPause で監視を制御
├── ClipboardViewModel.kt    # チャンク管理・コピー操作・重複判定・自動コピー
├── ChunkListScreen.kt       # Compose UI（LazyColumn / カード / FAB / Snackbar）
├── ClipboardObserver.kt     # ClipboardManager のラッパー（監視・読み書き）
├── Chunk.kt                 # チャンクのデータモデルと分割ロジック
└── ui/theme/                # Material 3 テーマ（Dynamic Color・ダークモード）
```

## クリップボード読み取りの制約について

Android 10 (API 29) 以降、そして特に **Android 12 以降はバックグラウンドからのクリップボード読み取りが制限**されています。フォアグラウンドにあるアプリのみが `getPrimaryClip()` で内容を取得できます。

そのため本アプリは **専用のパーミッションを宣言していません**（`READ_CLIPBOARD` という宣言可能な実行時パーミッションは Android には存在しません）。代わりに次の設計で制約に準拠しています。

- `MainActivity.onResume()` で監視を開始し、`onPause()` で停止する
- フォアグラウンド時のみ `ClipboardManager.OnPrimaryClipChangedListener` を登録する

## ビルド

```bash
./gradlew assembleDebug     # APK をビルド
./gradlew test              # 分割ロジックの単体テスト
```

> `local.properties` に Android SDK のパス（`sdk.dir=...`）が必要です。
