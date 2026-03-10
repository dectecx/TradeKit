# TradeKit UI/UX 設計規範 (Design Specification)

## 總覽 (Overview)

TradeKit 是一個為台灣股票市場當沖交易打造的極致精確、低阻力的工具。
介面必須採用響應式網頁設計 (Responsive Web Design, RWD)，確保跨裝置（桌面大螢幕與行動裝置觸控）皆具備足夠的資訊清晰度與操作效率。

## 1. 美學設計方向 (Premium Fintech)

設計靈感來自於高階交易終端機 (如 Bloomberg, Apple Stocks, Robinhood)。我們摒棄了傳統的「純白扁平化」設計，轉而採用具備空間感、毛玻璃質感的 UI。

### 1.1 主題設定 (Themes) 與色彩矩陣 (Color Palette)

應用程式支援雙主題切換，我們基於 Tailwind v4 預設色盤進行嚴格的 Fintech 色系定義：

| 顏色意象 (Semantic)     | Tailwind 色系 | 淺色模式 (Light) | 深色模式 (Dark)  | 應用場景                    |
| :---------------------- | :------------ | :--------------- | :--------------- | :-------------------------- |
| **主品牌色 (Brand)**    | Sky / Blue    | `bg-sky-500`     | `bg-sky-600`     | 主按鈕、Logo 點綴、重點強調 |
| **背景色 (Background)** | Slate         | `bg-slate-50`    | `bg-slate-950`   | 全局背景                    |
| **面板色 (Surface)**    | White / Slate | `bg-white`       | `bg-slate-900`   | 卡片、Sidebar、Header 背景  |
| **文字色 (Text)**       | Slate         | `text-slate-900` | `text-slate-50`  | 主標題、內文                |
| **輔助文字 (Muted)**    | Slate         | `text-slate-500` | `text-slate-400` | 備註、單位、次要資訊        |

**注意：遵循台灣股市習慣 (紅漲綠跌)**

- **獲利/上漲 (Profit)**：淺色使用 `text-rose-600`，深色使用 `text-rose-400`。
- **虧損/下跌 (Loss)**：淺色使用 `text-emerald-600`，深色使用 `text-emerald-400`。

### 1.3 材質與表面 (Glassmorphism 毛玻璃)

卡片與互動元素應透過背景模糊效果 (backdrop filter) 懸浮於背景之上。

- **面板面板**：深色使用 `bg-white/5`，淺色使用 `bg-white/80`，並結合 `backdrop-blur-xl`。
- **邊框**：使用超細邊框 `border-white/10` 勾勒邊緣，增加質感而不顯笨重。

## 2. 互動設計 (Interaction Design)

### 2.1 跨裝置輸入體驗困境 (RWD Input Strategy)

手機瀏覽器在遇到 `<input type="number">` 時會強制彈出作業系統原生數字鍵盤 (iOS/Android)，這會破壞沉浸感並遮擋金融數據。

**解決方案：**

1.  **手機端**：我們使用假輸入框 (偽裝成 input 的 `<button>`)。點擊時，會從底部彈出我們自定義的 `<CustomNumpad />` 數字盤。
2.  **電腦端**：當假輸入框處於「啟動 (active)」狀態時，全域 `<svelte:window onkeydown />` 監聽器會攔截實體鍵盤的敲擊 (`0-9`, `.`, `Backspace`, `Enter`)，並將數值直接寫入狀態中，完美還原一般打字體驗。

### 2.2 字體排版與視覺回饋

- 數字必須使用等寬或幾何清晰的字型 (如 `Inter` 或 `Outfit` )。
- 目前正在輸入的欄位必須有閃爍的光標指示器 (`animate-pulse`)。
- 狀態切換或數字面板彈出應使用 Svelte 內建的 `slide` 或 `fade` 進行微動畫過渡。

### 2.3 表單驗證與回饋 (Form Validation UX)

- **即時錯誤標示 (Inline Validation Feedback)**：當使用者輸入無效資料時，切勿使用 `alert` 或粗暴地自動蓋掉數值。應在該輸入框下方以紅字 (`text-rose-500`) 明確指出錯誤原因，並將輸入框邊框變更為紅色，保留使用者的原始輸入。
- **自我修復 (Error Recovery)**：當使用者開始重新輸入或修改時，必須即時清除錯誤紅字與紅框。
- **架構解耦 (Architecture Decoupling)**：所有資料校驗必須在 Schema 層 (例如 Zod) 中定義，並由元件呼叫；驗證提示文字必須依循 i18n 原則，從外部字典檔 (如 `messages.ts`) 引入，嚴禁將錯誤文字或防呆邏輯硬編碼 (Hardcode) 於 UI 元件內。

## 3. 全局視圖與板塊劃分 (Global Layout Architecture)

TradeKit 採用現代 SaaS 面板架構，具備高度擴充性與跨裝置適應。

### 3.1 區塊定義

1.  **Sidebar (側邊導覽)**：
    - **Desktop**：固定於左側，作為主要工具切換區 (現股當沖、除權息等)。
    - **Mobile**：隱藏於頂部漢堡選單內，展開時覆蓋全螢幕。
2.  **Header (頂部標題)**：
    - 展示目前所在工具名稱。全域功能的設定鈕、主題切換安置於此。
3.  **Main Content (內容區)**：
    - 主邏輯運算與顯示區塊。

### 3.2 Desktop 線稿參考 (Layout Wireframe)

```text
+---------+------------------------------------------------+
| [Logo]  |  台股 / 當沖計算機                [Dark] [⚙設定] |
| Sidebar |------------------------------------------------+
|         |  +------------------------------------------+  |
| - 當沖  |  | 淨損益 (Net Profit)                      |  |
| - 股利  |  | $ 1,500  (Rose Red text, glowing)        |  |
| - 歷史  |  +------------------------------------------+  |
|         |  +------------------------------------------+  |
|         |   (內容輸入區)                                 |
|         |  +------------------------------------------+  |
|         |                                                |
|         |  +------------------------------------------+  |
|         |  | TradeKit (C) 2026. Data for ref only.    |  |
+---------+------------------------------------------------+
```
