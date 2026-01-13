/**
 * 錯誤處理整合範例
 * 
 * 這個檔案展示如何在現有功能中整合統一的錯誤處理系統
 */

import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'
import { validateFile } from '@/lib/fileValidation'

// ============================================
// 範例 1: 模型上傳錯誤處理
// ============================================

async function handleModelUpload(file: File, user: any, currentPlan: any) {
    // 1. 檔案驗證
    const validation = validateFile(file, 'models')
    if (!validation.valid) {
        if (validation.error?.includes('Invalid file type')) {
            const ext = file.name.substring(file.name.lastIndexOf('.'))
            errorHandler.invalidFormat(ext, ['.glb', '.gltf', '.obj', '.fbx'])
        } else {
            errorHandler.handle(ErrorType.FILE_CORRUPTED, { fileName: file.name })
        }
        return
    }

    // 2. 檔案大小檢查
    const maxSize = currentPlan.features.maxModelSize || 50
    if (file.size > maxSize * 1024 * 1024) {
        errorHandler.fileTooLarge(file.size, maxSize, file.name)
        return
    }

    // 3. 上傳過程錯誤處理
    try {
        // 上傳邏輯...
        errorHandler.success('模型上傳成功！')
    } catch (error) {
        errorHandler.handle(ErrorType.FILE_UPLOAD_FAILED, { fileName: file.name })
    }
}

// ============================================
// 範例 2: HDRI 上傳錯誤處理
// ============================================

async function handleHDRIUpload(file: File, user: any) {
    // 驗證檔案
    const validation = validateFile(file, 'environments')
    if (!validation.valid) {
        if (validation.error?.includes('Invalid file type')) {
            const ext = file.name.substring(file.name.lastIndexOf('.'))
            errorHandler.invalidFormat(ext, ['.hdr', '.exr'])
        } else {
            errorHandler.handle(ErrorType.HDRI_UPLOAD_FAILED)
        }
        return
    }

    try {
        // 上傳邏輯...
        errorHandler.success('HDRI 上傳成功！')
    } catch (error) {
        errorHandler.handle(ErrorType.HDRI_UPLOAD_FAILED, { fileName: file.name })
    }
}

// ============================================
// 範例 3: AI HDRI 生成錯誤處理
// ============================================

async function handleAIHDRIGeneration(prompt: string) {
    try {
        // AI 生成邏輯...
        errorHandler.success('AI 環境生成成功！')
    } catch (error) {
        errorHandler.handle(ErrorType.HDRI_GENERATION_FAILED)
    }
}

// ============================================
// 範例 4: 視頻導出錯誤處理
// ============================================

async function handleVideoExport(userCredits: number, requiredCredits: number, upgradeAction: () => void) {
    // 1. 積分檢查
    if (userCredits < requiredCredits) {
        errorHandler.insufficientCredits(userCredits, requiredCredits, upgradeAction)
        return
    }

    // 2. 瀏覽器支援檢查
    if (!navigator.mediaDevices || !('MediaRecorder' in window)) {
        errorHandler.handle(ErrorType.BROWSER_NOT_SUPPORTED, {
            browser: navigator.userAgent
        })
        return
    }

    // 3. 導出過程錯誤處理
    try {
        // 導出邏輯...
        errorHandler.success('視頻導出成功！')
    } catch (error) {
        errorHandler.exportFailed(() => {
            // 重試邏輯
            handleVideoExport(userCredits, requiredCredits, upgradeAction)
        })
    }
}

// ============================================
// 範例 5: 專案儲存錯誤處理
// ============================================

async function handleProjectSave(projectData: any) {
    try {
        // 儲存邏輯...
        errorHandler.success('專案已儲存')
    } catch (error) {
        errorHandler.projectSaveFailed(() => {
            // 重試邏輯
            handleProjectSave(projectData)
        })
    }
}

// ============================================
// 範例 6: 專案載入錯誤處理
// ============================================

async function handleProjectLoad(projectId: string) {
    try {
        // 載入邏輯...
        errorHandler.info('專案載入成功')
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            errorHandler.handle(ErrorType.PROJECT_NOT_FOUND)
        } else if (error instanceof Error && error.message.includes('permission')) {
            errorHandler.handle(ErrorType.PERMISSION_DENIED)
        } else {
            errorHandler.handle(ErrorType.PROJECT_LOAD_FAILED)
        }
    }
}

// ============================================
// 範例 7: 模型複雜度警告
// ============================================

function checkModelComplexity(polygonCount: number) {
    const maxPolygons = 100000
    if (polygonCount > maxPolygons) {
        errorHandler.modelTooComplex(polygonCount, maxPolygons)
    }
}

// ============================================
// 範例 8: 通用錯誤處理
// ============================================

function handleGenericError(error: unknown) {
    // 自動判斷錯誤類型並顯示適當訊息
    errorHandler.handleGeneric(error)
}

// ============================================
// 範例 9: 網路錯誤處理
// ============================================

async function handleNetworkRequest() {
    try {
        const response = await fetch('/api/endpoint')
        if (!response.ok) throw new Error('Network error')
    } catch (error) {
        if (error instanceof Error && error.message.includes('timeout')) {
            errorHandler.handle(ErrorType.TIMEOUT_ERROR)
        } else {
            errorHandler.handle(ErrorType.NETWORK_ERROR)
        }
    }
}

// ============================================
// 範例 10: 登入狀態過期處理
// ============================================

function handleSessionExpired(loginAction: () => void) {
    errorHandler.sessionExpired(loginAction)
}

export {
    handleModelUpload,
    handleHDRIUpload,
    handleAIHDRIGeneration,
    handleVideoExport,
    handleProjectSave,
    handleProjectLoad,
    checkModelComplexity,
    handleGenericError,
    handleNetworkRequest,
    handleSessionExpired
}
