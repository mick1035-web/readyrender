// 在 Firestore Console 中執行此腳本來設定測試用戶的訂閱資料
// 或者使用 Firebase Admin SDK 執行

// 設定用戶為 FREE tier
/*
const userId = 'YOUR_USER_ID_HERE'
const userRef = db.collection('users').doc(userId)

await userRef.set({
        subscription: {
            tier: 'FREE',
            credits: 200,
            resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
    }, { merge: true })
*/

// 設定用戶為 PRO tier
/*
const userId = 'YOUR_USER_ID_HERE'
const userRef = db.collection('users').doc(userId)

await userRef.set({
        subscription: {
            tier: 'PRO',
            credits: 2000,
            resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
    }, { merge: true })
*/

// 設定用戶為 ULTRA tier
/*
const userId = 'YOUR_USER_ID_HERE'
const userRef = db.collection('users').doc(userId)

await userRef.set({
        subscription: {
            tier: 'ULTRA',
            credits: 6000,
            resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
    }, { merge: true })
*/

// PowerShell 腳本：使用 Firebase CLI 設定訂閱資料
// 將以下內容保存為 set-subscription.ps1

$userId = Read-Host "Enter User ID"
$tier = Read-Host "Enter Tier (FREE/PRO/ULTRA)"

$credits = switch ($tier) {
    "FREE" { 200 }
    "PRO" { 2000 }
    "ULTRA" { 6000 }
    default { 200 }
}

$resetDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

Write-Host "Setting subscription for user $userId to $tier with $credits credits"
Write-Host "Reset date: $resetDate"

# 使用 Firebase CLI 更新文件
# firebase firestore:update users/$userId --data "{\"subscription\":{\"tier\":\"$tier\",\"credits\":$credits,\"resetDate\":\"$resetDate\"}}"

Write-Host ""
Write-Host "Manual steps:"
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/"
Write-Host "2. Select your project"
Write-Host "3. Go to Firestore Database"
Write-Host "4. Navigate to users/$userId"
Write-Host "5. Add/Update the 'subscription' field with:"
Write-Host "   {" 
Write-Host "     tier: '$tier',"
Write-Host "     credits: $credits,"
Write-Host "     resetDate: (timestamp) $resetDate"
Write-Host "   }"
