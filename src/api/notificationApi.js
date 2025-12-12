// src/api/notificationApi.js
import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
})

// JWT 붙이기
apiClient.interceptors.request.use((config) => {
    const authStore = useAuthStore()

    // 새로고침 직후 대비
    if (!authStore.accessToken && typeof authStore.loadFromStorage === 'function') {
        authStore.loadFromStorage()
    }

    const token = authStore.accessToken
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

/* ===================== 관리자 템플릿 관리 ===================== */

// 템플릿 목록/검색 조회
export async function fetchAdminNotificationTemplates({
                                                          keyword = '',
                                                          page = 0,
                                                          size = 10,
                                                      } = {}) {
    const res = await apiClient.get('/admin/notifications/templates', {
        params: {
            keyword: keyword || undefined,
            page,
            size,
        },
    })
    // data: { templates: [...], pagination: {...} }
    return res.data?.data
}

// 템플릿 생성
export async function createAdminNotificationTemplate({
                                                          templateType = 'SYSTEM', // 기본값: 시스템 공지
                                                          title,
                                                          body,
                                                      }) {
    const res = await apiClient.post('/admin/notifications/templates', {
        templateType,
        title,
        body,
    })

    return res.data?.data
}

// 템플릿 수정
export async function updateAdminNotificationTemplate(
    templateId,
    { templateType = 'SYSTEM', title, body },
) {
    const res = await apiClient.put(`/admin/notifications/templates/${templateId}`, {
        templateType,
        title,
        body,
    })

    return res.data?.data
}

// 템플릿 삭제
export async function deleteAdminNotificationTemplate(templateId) {
    const res = await apiClient.delete(`/admin/notifications/templates/${templateId}`)
    return res.data
}

/* ===================== 관리자 발송/발송 로그 ===================== */

// 템플릿 기반 알림 발송 (즉시, 단일 사용자)
export async function sendNotificationByTemplate(templateId, { targetUserId, variables = {} }) {
    const res = await apiClient.post(
        `/admin/notifications/templates/${templateId}/send`,
        {
            targetUserId,
            variables,
        },
    )

    // data: { notificationId }
    return res.data?.data
}

// 발송 로그 조회
export async function fetchAdminNotificationSendLogs({
                                                         page = 0,
                                                         size = 10,
                                                     } = {}) {
    const res = await apiClient.get('/admin/notifications/send-logs', {
        params: { page, size },
    })

    // data: { logs: [...], pagination: {...} }
    return res.data?.data
}

/* ===================== 사용자 알림함 ===================== */

// 내 알림 목록 조회
export async function fetchMyNotifications({ page = 0, size = 10 } = {}) {
    const res = await apiClient.get('/notifications/me', {
        params: { page, size },
    })
    // data: { notifications: [...], pagination: {...} }
    return res.data?.data
}

// 내 미읽음 개수 조회
export async function fetchMyUnreadCount() {
    const res = await apiClient.get('/notifications/me/unread-count')
    // data: Long
    return res.data?.data
}

// 내 알림 하나 읽음 처리
export async function markMyNotificationRead(notificationId) {
    const res = await apiClient.patch(`/notifications/me/${notificationId}/read`)
    return res.data
}

// 내 알림 모두 읽음 처리
export async function markMyNotificationsReadAll() {
    const res = await apiClient.patch('/notifications/me/read-all')
    return res.data
}

// 내 알림 하나 삭제
export async function deleteMyNotification(notificationId) {
    const res = await apiClient.delete(`/notifications/me/${notificationId}`)
    return res.data
}

// 읽은 알림 모두 삭제
export async function deleteMyReadNotifications() {
    const res = await apiClient.delete('/notifications/me/read')
    return res.data
}
