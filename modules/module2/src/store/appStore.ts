import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// 앱 상태 인터페이스 정의
interface AppState {
  // UI 상태
  isLoading: boolean
  isSidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  // 사용자 데이터
  user: User | null
  
  // 알림
  notifications: AppNotification[]
  
  // 액션들
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setUser: (user: User | null) => void
  addNotification: (notification: Omit<AppNotification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

// 타입 정의
interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Zustand 스토어 생성
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        isLoading: false,
        isSidebarOpen: false,
        theme: 'system',
        user: null,
        notifications: [],

        // 액션 구현
        setLoading: (loading: boolean) => 
          set({ isLoading: loading }, false, 'setLoading'),
        
        toggleSidebar: () => 
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),
        
        setTheme: (theme: 'light' | 'dark' | 'system') => 
          set({ theme }, false, 'setTheme'),
        
        setUser: (user: User | null) => 
          set({ user }, false, 'setUser'),
        
        addNotification: (notification: Omit<AppNotification, 'id'>) => {
          const id = Math.random().toString(36).substr(2, 9)
          const newNotification = {
            ...notification,
            id,
            duration: notification.duration || 5000
          }
          
          set(
            (state) => ({
              notifications: [...state.notifications, newNotification]
            }),
            false,
            'addNotification'
          )
          
          // 자동 제거 설정
          if (newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, newNotification.duration)
          }
        },
        
        removeNotification: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }),
            false,
            'removeNotification'
          ),
        
        clearNotifications: () =>
          set({ notifications: [] }, false, 'clearNotifications'),
      }),
      {
        name: 'iness-app-store', // localStorage 키
        partialize: (state) => ({
          theme: state.theme,
          user: state.user,
          // 로딩 상태나 알림은 영구 저장하지 않음
        }),
      }
    ),
    {
      name: 'iness-store', // devtools 이름
    }
  )
)

// 편의를 위한 셀렉터 함수들
export const useLoading = () => useAppStore((state) => state.isLoading)
export const useUser = () => useAppStore((state) => state.user)
export const useTheme = () => useAppStore((state) => state.theme)
export const useNotifications = () => useAppStore((state) => state.notifications)

// 타입 재 내보내기
export type { User, AppNotification }