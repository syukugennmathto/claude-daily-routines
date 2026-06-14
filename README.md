# YouTube Blocker (Chrome / 時間帯ブロック)

Android スマホで **Chrome ブラウザの YouTube (youtube.com)** を、ユーザーが設定した
**時間帯だけ** ブロックするアプリです。root 不要・一般ユーザー権限のみで動作します。

---

## 1. 採用した実装方法と理由

### 採用：AccessibilityService（アクセシビリティサービス）＋ オーバーレイ表示

Chrome のアドレスバーの URL をアクセシビリティ API で読み取り、`youtube.com` を検知し、
かつ現在時刻がブロック時間帯に入っていれば、画面全体にブロック用オーバーレイを重ねて表示します。

### なぜこの方法か（他案との比較）

| 方法 | Chrome だけを狙えるか | youtube.com だけを狙えるか | root | 評価 |
|------|------|------|------|------|
| **アクセシビリティサービス（採用）** | ◎ パッケージ名で判定 | ◎ アドレスバーの URL を直接読める | 不要 | **最有力** |
| ローカル VPN (VpnService) で DNS ブロック | ✗ 全アプリに効く | △ ドメイン単位（アプリ単位の区別不可） | 不要 | 「Chrome だけ」が実現できない |
| hosts 書き換え / iptables | — | — | **必要** | root 前提のため除外 |
| DNS over HTTPS の遮断 | ✗ | △ | 不要 | Chrome が DoH を使うと回避され不安定 |

要件は「**Chrome の YouTube のみ**」です。VPN 方式はネットワーク層で全アプリに効いてしまい、
「Chrome だけ・youtube.com だけ」という条件を満たせません。一方アクセシビリティサービスなら、
イベント発生元のパッケージ（`com.android.chrome` など）と、アドレスバーの実 URL の
両方で判定できるため、要件にちょうど一致します。root も不要です。

### 必要な権限は 2 つだけ

1. **アクセシビリティ** … Chrome のアドレスバー (`com.android.chrome:id/url_bar`) を読むため
2. **他のアプリの上に重ねて表示 (SYSTEM_ALERT_WINDOW)** … ブロック画面を出すため

どちらもユーザーが設定画面で手動 ON にする方式（危険権限の動的取得不要）で、サイドロードのみで完結します。

### 制約・既知の限界（正直な注意点）

- アドレスバーの表示テキストで判定するため、シークレットタブやアドレスバーを隠す全画面表示など、
  URL が読めない状況では検知が遅れる/効かないことがあります（個人利用なら実用十分）。
- `youtube.com` 文字列一致のため、他サイト経由の埋め込み再生（例: ニュース記事内の埋め込み）は対象外です。
- 「絶対に突破不能」な仕組みではありません（自分の意思を補助する用途向け）。

---

## 2. プロジェクト構成

```
claude-daily-routines/
├── settings.gradle.kts
├── build.gradle.kts
├── gradle.properties
├── gradle/wrapper/gradle-wrapper.properties
└── app/
    ├── build.gradle.kts
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/example/ytblocker/
        │   ├── MainActivity.kt            # 設定 UI（時間帯の追加/削除/ON-OFF、権限案内）
        │   ├── YouTubeBlockerService.kt   # アクセシビリティサービス本体（検知＋オーバーレイ）
        │   ├── Schedule.kt                # 時間帯モデル（深夜またぎ対応）
        │   └── ScheduleRepository.kt      # SharedPreferences への保存/読み込み
        └── res/
            ├── layout/overlay_block.xml   # ブロック画面のレイアウト
            ├── values/strings.xml
            ├── values/themes.xml
            └── xml/accessibility_service_config.xml
```

---

## 3. 必要なパーミッション（AndroidManifest.xml）

- `android.permission.SYSTEM_ALERT_WINDOW` … ブロック画面を重ねて表示
- アクセシビリティは `<service>` の `android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"`
  と `accessibility_service_config.xml` で宣言（ユーザーが設定画面で ON にする）

---

## 4. ビルド・インストール手順

### A. Android Studio（推奨）

1. Android Studio（Hedgehog 以降を推奨）でこのフォルダを **Open**。
2. 初回は Gradle 同期が走ります（Android Studio が Gradle Wrapper を自動生成します）。
   `compileSdk 34` 用の SDK が無ければ SDK Manager から導入。
3. スマホを USB 接続し **開発者向けオプション → USB デバッグ** を ON。
4. ▶ Run でインストール。または `Build → Build APK` で APK を作成して端末へ転送。

### B. コマンドライン（gradlew がある場合）

```bash
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

> 注意: このリポジトリにはバイナリの `gradlew` / `gradle-wrapper.jar` は含めていません。
> Android Studio で開けば自動生成されます。CLI で wrapper を作るには `gradle wrapper` を一度実行してください。

### C. アプリ初回設定（インストール後、スマホ側で 1 回だけ）

1. アプリを起動。
2. 「アクセシビリティ」カードの **設定を開く** → 一覧から **YouTube Blocker** を ON。
3. 「他のアプリの上に重ねて表示」カードの **設定を開く** → 許可を ON。
4. **時間帯を追加** で開始・終了時刻を設定（例: 22:00 〜 07:00）。複数登録・個別 ON/OFF・削除が可能。

設定後、ブロック時間帯に Chrome で youtube.com を開くと、ブロック画面が表示されます。

---

## 5. 動作の仕組み（概要）

- `YouTubeBlockerService` は Chrome 系パッケージのアクセシビリティイベントのみ購読。
- イベントごとにアクティブウィンドウから `url_bar` のテキストを取得 → `youtube.com`/`youtu.be` を判定。
- `ScheduleRepository.isBlockedNow()` が現在時刻を見て、有効な時間帯に入っていれば
  `TYPE_APPLICATION_OVERLAY` で全画面オーバーレイを追加。YouTube から離れると自動で消えます。
- 時間帯は「分(0–1439)」で保持し、`start > end` の場合は深夜またぎとして扱います。
