// Firebase Storage 測試工具
// 在瀏覽器 Console 中執行此腳本來診斷問題

console.log('=== Firebase Storage 診斷工具 ===\n');

// 1. 檢查認證狀態
async function checkAuth() {
    const { useAuth } = await import('@/contexts/AuthContext');
    console.log('1. 檢查認證狀態:');

    if (typeof window !== 'undefined') {
        // 簡單檢查
        const authState = localStorage.getItem('firebase:authUser');
        if (authState) {
            console.log('✅ 用戶已登入');
            const user = JSON.parse(authState);
            console.log('   User ID:', user.uid);
        } else {
            console.log('❌ 用戶未登入');
            console.log('   請先登入再嘗試上傳/載入檔案');
        }
    }
}

// 2. 測試 Storage 訪問
async function testStorageAccess() {
    console.log('\n2. 測試 Storage 訪問:');

    const testUrl = 'https://firebasestorage.googleapis.com/v0/b/d-video-gen.firebasestorage.app/o/models%2FLD1xfHJ7cehN7W9UqjSJQhBPaEh1%2F1766561947321_airport_suitcase.glb?alt=media&token=1022d698-4668-4be9-a04b-1d6ac5be6264';

    try {
        const response = await fetch(testUrl);
        console.log('   狀態碼:', response.status);

        if (response.status === 200) {
            console.log('✅ Storage 訪問成功');
        } else if (response.status === 403) {
            console.log('❌ 權限被拒 (403)');
            console.log('   → Storage 規則可能未正確設置');
            console.log('   → 或用戶未登入');
        } else if (response.status === 404) {
            console.log('❌ 檔案不存在 (404)');
        } else {
            console.log('❌ 未知錯誤:', response.statusText);
        }
    } catch (error) {
        console.log('❌ 網路錯誤:', error.message);
        console.log('   → 可能是 CORS 問題');
        console.log('   → 或 Storage 規則阻擋');
    }
}

// 3. 提供建議
function provideSuggestions() {
    console.log('\n3. 建議解決方案:');
    console.log('');
    console.log('方案 A: 設置測試模式規則（快速）');
    console.log('   1. 前往 Firebase Console → Storage → Rules');
    console.log('   2. 使用以下規則:');
    console.log('   ```');
    console.log('   rules_version = \'2\';');
    console.log('   service firebase.storage {');
    console.log('     match /b/{bucket}/o {');
    console.log('       match /{allPaths=**} {');
    console.log('         allow read, write: if true;');
    console.log('       }');
    console.log('     }');
    console.log('   }');
    console.log('   ```');
    console.log('   3. 點擊「發布」');
    console.log('   4. 等待 30 秒');
    console.log('   5. 重新整理頁面');
    console.log('');
    console.log('方案 B: 設置生產模式規則（安全）');
    console.log('   1. 確認已登入');
    console.log('   2. 使用安全規則（詳見 storage_rules_setup.md）');
    console.log('');
}

// 執行診斷
(async () => {
    await checkAuth();
    await testStorageAccess();
    provideSuggestions();
    console.log('\n=== 診斷完成 ===');
})();
