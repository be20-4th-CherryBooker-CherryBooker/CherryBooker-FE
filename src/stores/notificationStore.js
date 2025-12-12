// src/stores/notificationStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/AuthStore'
import {
    fetchMyNotifications,
    fetchMyUnreadCount,
} from '@/api/notificationApi.js'

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([]) // [{ id, title, body, read, createdAt }]
    const unreadCount = ref(0)
    const sse = ref(null)
    const connected = ref(false)

    const authStore = useAuthStore()

    // 1) 알림 목록 조회
    async function loadNotifications(page = 0, size = 10) {
        if (!authStore.user) return

        const pageRes = await fetchMyNotifications({ page, size })

        notifications.value = (pageRes?.notifications || []).map((n) => ({
            id: n.notificationId,
            title: n.title,
            body: n.content,
            read: !!n.read,
            createdAt: n.createdAt,
        }))
    }

    // 2) 미읽음 개수 조회
    async function fetchUnreadCountAction() {
        if (!authStore.user) return
        const cnt = await fetchMyUnreadCount()
        unreadCount.value = Number(cnt) || 0
    }

    // 3) SSE 연결 (/api/notifications/me/stream)
    function connectSse() {
        if (connected.value || !authStore.user) return

        const es = new EventSource('/api/notifications/me/stream', {
            withCredentials: true,
        })
        sse.value = es

        es.addEventListener('INIT', (event) => {
            console.log('[SSE] INIT', event.data)
        })

        // 새로운 알림 생성
        es.addEventListener('NOTIFICATION', (event) => {
            try {
                const payload = JSON.parse(event.data)
                console.log('[SSE] NOTIFICATION', payload)

                notifications.value.unshift({
                    id: payload.notificationId,
                    title: payload.title,
                    body: payload.content,
                    read: false,
                    createdAt: payload.createdAt,
                })

                // 이벤트에 실려 온 최신 미읽음 개수
                if (typeof payload.unreadCount !== 'undefined') {
                    unreadCount.value = Number(payload.unreadCount) || 0
                }
            } catch (e) {
                console.error('[SSE] NOTIFICATION parse error', e)
            }
        })

        // 읽음 처리 후 미읽음 개수 갱신
        es.addEventListener('UNREAD_COUNT', (event) => {
            try {
                // 서버에서 Long 하나만 내려보내므로 그대로 파싱
                const cnt = JSON.parse(event.data)
                unreadCount.value = Number(cnt) || 0
            } catch (e) {
                console.error('[SSE] UNREAD_COUNT parse error', e)
            }
        })

        es.addEventListener('PING', () => {
            // keep-alive
        })

        es.onerror = (err) => {
            console.error('[SSE] error', err)
            es.close()
            connected.value = false
            sse.value = null
        }

        connected.value = true
    }

    // 4) SSE 해제 (로그아웃 시)
    function disconnectSse() {
        if (sse.value) {
            sse.value.close()
            sse.value = null
        }
        connected.value = false
        notifications.value = []
        unreadCount.value = 0
    }

    return {
        notifications,
        unreadCount,
        connected,
        loadNotifications,
        fetchUnreadCount: fetchUnreadCountAction,
        connectSse,
        disconnectSse,
    }
})
