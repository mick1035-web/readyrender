# Firebase Storage CORS 設置腳本
# 請在 PowerShell 中執行此腳本

Write-Host "=== Firebase Storage CORS 設置 ===" -ForegroundColor Cyan
Write-Host ""

# 檢查 gcloud 是否已安裝
Write-Host "1. 檢查 Google Cloud SDK..." -ForegroundColor Yellow
if (Get-Command gcloud -ErrorAction SilentlyContinue) {
    Write-Host "   ✓ Google Cloud SDK 已安裝" -ForegroundColor Green
} else {
    Write-Host "   ✗ Google Cloud SDK 未安裝" -ForegroundColor Red
    Write-Host ""
    Write-Host "請先安裝 Google Cloud SDK:" -ForegroundColor Yellow
    Write-Host "1. 前往: https://cloud.google.com/sdk/docs/install" -ForegroundColor White
    Write-Host "2. 下載並安裝 Windows 版本" -ForegroundColor White
    Write-Host "3. 重新啟動 PowerShell" -ForegroundColor White
    Write-Host "4. 再次執行此腳本" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "2. 初始化 gcloud..." -ForegroundColor Yellow
Write-Host "   請在彈出的瀏覽器中登入您的 Google 帳號" -ForegroundColor White
gcloud init

Write-Host ""
Write-Host "3. 應用 CORS 設定..." -ForegroundColor Yellow
$bucketName = "d-video-gen.firebasestorage.app"
Write-Host "   Bucket: $bucketName" -ForegroundColor White

try {
    gsutil cors set cors.json gs://$bucketName
    Write-Host "   ✓ CORS 設定成功應用" -ForegroundColor Green
} catch {
    Write-Host "   ✗ CORS 設定失敗" -ForegroundColor Red
    Write-Host "   錯誤: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "4. 驗證 CORS 設定..." -ForegroundColor Yellow
try {
    gsutil cors get gs://$bucketName
    Write-Host "   ✓ CORS 設定驗證成功" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 驗證失敗" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== 設置完成！===" -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "1. 重新整理瀏覽器頁面 (Ctrl + Shift + R)" -ForegroundColor White
Write-Host "2. 嘗試上傳並載入 3D 模型" -ForegroundColor White
Write-Host "3. 檢查是否還有 CORS 錯誤" -ForegroundColor White
