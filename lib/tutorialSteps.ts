export interface TutorialStep {
    id: string
    title: string
    content: string
    target: string // CSS selector or 'fullscreen'
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
    action: 'click' | 'interact' | 'wait' | 'none'
    waitTime?: number // seconds
    optional?: boolean
    nextButtonText?: string
}

export const tutorialSteps: TutorialStep[] = [
    // 第一階段：歡迎和基礎認識（步驟 1-4）
    {
        id: 'welcome',
        title: '歡迎使用 ReadyRender',
        content: '這是一個 3D 產品視頻創建工具。讓我們一起創建您的第一個視頻！',
        target: 'fullscreen',
        placement: 'center',
        action: 'none',
        nextButtonText: '開始教學'
    },
    {
        id: 'dashboard',
        title: 'Dashboard 界面',
        content: '這裡顯示您的所有專案。您可以創建新專案或編輯現有專案。',
        target: '[data-tutorial="projects-grid"]',
        placement: 'center',
        action: 'none'
    },
    {
        id: 'create-project',
        title: '創建新專案',
        content: '點擊這裡創建您的第一個專案',
        target: '[data-tutorial="new-project"]',
        placement: 'bottom',
        action: 'click'
    },
    {
        id: 'editor-overview',
        title: 'Editor 界面總覽',
        content: '這是編輯器界面。左側是工具欄，中間是 3D 場景，底部是時間軸',
        target: 'fullscreen',
        placement: 'center',
        action: 'none'
    },

    // 第二階段：模型和場景（步驟 5-6）
    {
        id: 'upload-model',
        title: '上傳 3D 模型',
        content: '首先，上傳您的 3D 模型（支持 GLB/GLTF 格式）。您也可以點擊"載入範例"快速開始',
        target: '[data-tutorial="upload-model"]',
        placement: 'right',
        action: 'click'
    },
    {
        id: '3d-controls',
        title: '3D 場景操作',
        content: '🖱️ 左鍵拖動：旋轉視角\n🖱️ 滾輪：縮放\n🖱️ 右鍵拖動：平移\n\n試試看！移動您的視角',
        target: '[data-tutorial="canvas"]',
        placement: 'center',
        action: 'interact',
        waitTime: 3
    },

    // 第三階段：環境和燈光（步驟 7-9）
    {
        id: 'hdri-intro',
        title: 'HDRI 環境介紹',
        content: 'HDRI 環境可以為您的場景提供真實的光照和反射。我們提供預設環境和 AI 生成功能',
        target: '[data-tutorial="hdri-section"]',
        placement: 'left',
        action: 'none'
    },
    {
        id: 'preset-hdri',
        title: '選擇預設 HDRI',
        content: '先試試預設的 HDRI 環境。選擇"日落"、"城市"或"工作室"等不同環境',
        target: '[data-tutorial="hdri-presets"]',
        placement: 'left',
        action: 'click'
    },
    {
        id: 'ai-hdri',
        title: 'AI 生成 HDRI（進階功能）',
        content: '💡 AI 生成功能：輸入描述，AI 會為您生成獨特的 HDRI 環境\n\n例如："溫暖的日落海灘"、"現代科技展廳"\n\n點擊"✨ AI 生成"按鈕試試看！',
        target: '[data-tutorial="ai-hdri"]',
        placement: 'left',
        action: 'none',
        optional: true
    },

    // 第四階段：關鍵幀和鏡頭模板（步驟 10-13）
    {
        id: 'add-keyframe',
        title: '添加第一個關鍵幀',
        content: '關鍵幀記錄相機位置。調整好視角後，點擊 ➕ 按鈕添加關鍵幀',
        target: '[data-tutorial="add-keyframe"]',
        placement: 'top',
        action: 'click'
    },
    {
        id: 'camera-template',
        title: '使用鏡頭模板（快速創建）',
        content: '🎬 一鍵鏡頭模板：不想手動設置？使用我們的專業鏡頭模板！\n\n點擊"模板"按鈕，選擇：\n📸 產品展示 - 360° 旋轉展示\n🎥 特寫鏡頭 - 聚焦產品細節\n🌟 動態展示 - 多角度動態切換\n\n選擇一個模板，系統會自動創建多個關鍵幀',
        target: '[data-tutorial="template-button"]',
        placement: 'top',
        action: 'none',
        optional: true
    },
    {
        id: 'adjust-camera',
        title: '調整相機視角（手動模式）',
        content: '如果您選擇手動模式，現在移動到另一個視角，準備添加第二個關鍵幀',
        target: '[data-tutorial="canvas"]',
        placement: 'center',
        action: 'interact',
        waitTime: 2
    },
    {
        id: 'add-second-keyframe',
        title: '添加第二個關鍵幀',
        content: '很好！再次點擊 ➕ 添加第二個關鍵幀。視頻會在這兩個視角之間平滑過渡',
        target: '[data-tutorial="add-keyframe"]',
        placement: 'top',
        action: 'click'
    },

    // 第五階段：文字和圖片（步驟 14-16）
    {
        id: 'add-text',
        title: '添加 3D 文字',
        content: '點擊關鍵幀上的"T"按鈕，為這個鏡頭添加 3D 文字',
        target: '[data-tutorial="text-button"]',
        placement: 'top',
        action: 'click'
    },
    {
        id: 'edit-text',
        title: '編輯文字內容',
        content: '在這裡輸入文字內容，調整大小、顏色和位置',
        target: '[data-tutorial="text-editor"]',
        placement: 'left',
        action: 'wait',
        waitTime: 2
    },
    {
        id: 'add-image',
        title: '添加圖片（可選）',
        content: '您也可以添加圖片到場景中。點擊"🖼️"按鈕試試看',
        target: '[data-tutorial="image-button"]',
        placement: 'top',
        action: 'none',
        optional: true
    },

    // 第六階段：預覽和導出（步驟 17-18）
    {
        id: 'preview',
        title: '預覽動畫',
        content: '點擊播放按鈕預覽您的動畫效果',
        target: '[data-tutorial="play-button"]',
        placement: 'top',
        action: 'click'
    },
    {
        id: 'export',
        title: '導出視頻',
        content: '滿意後，點擊"導出視頻"按鈕\n\n選擇質量（720p / 1080p / 4K）\n選擇格式（MP4）\n點擊"開始導出"',
        target: '[data-tutorial="export-button"]',
        placement: 'bottom',
        action: 'click'
    }
]
