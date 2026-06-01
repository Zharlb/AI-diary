<template>
  <div class="app">
    <LoginPage v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    
    <template v-else>
      <header class="app-header">
        <div class="header-left">
          <button class="menu-toggle" @click="showMenu = !showMenu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1>{{ currentPageName }}</h1>
        </div>
        
        <div class="header-right">
          <button 
            v-if="canAccessUsers" 
            class="nav-btn" 
            :class="{ active: currentPage === 'users' }"
            @click="currentPage = 'users'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>用户管理</span>
          </button>
          
          <button class="nav-btn logout-btn" @click="handleLogout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>退出</span>
          </button>
        </div>
      </header>

      <transition name="slide">
        <div class="sidebar" v-if="showMenu">
          <div class="sidebar-header">
            <h3>菜单</h3>
          </div>
          <nav class="sidebar-nav">
            <button 
              class="nav-item" 
              :class="{ active: currentPage === 'calendar' }"
              @click="navigateTo('calendar')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>日历日记</span>
            </button>
            
            <button 
              v-if="canAccessQuickOptions"
              class="nav-item" 
              :class="{ active: currentPage === 'quickOptions' }"
              @click="navigateTo('quickOptions')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>快捷选项</span>
            </button>
            
            <button 
              v-if="canAccessUsers"
              class="nav-item" 
              :class="{ active: currentPage === 'users' }"
              @click="navigateTo('users')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>用户管理</span>
            </button>
          </nav>
        </div>
      </transition>

      <div class="toolbar-wrapper">
        <CalendarToolbar 
          v-if="currentPage === 'calendar'"
          @today-clicked="handleTodayClicked" 
          @view-changed="handleTodayClicked" 
        />
      </div>

      <main class="app-main">
        <CalendarList 
          v-if="currentPage === 'calendar'"
          ref="calendarListRef" 
          @select-day="handleDayClick" 
          @edit-diary="handleEditDiary" 
        />
        
        <UserManagement v-else-if="currentPage === 'users'" />
      </main>

      <transition name="modal-fade">
        <DiaryEditor 
          :visible="showEditor" 
          :day="selectedDay"
          :diary="selectedDiary"
          @close="showEditor = false"
          @saved="handleDiarySaved"
        />
      </transition>

      <transition name="modal-fade">
        <QuickOptionsManager 
          :visible="showQuickOptions" 
          @close="showQuickOptions = false" 
        />
      </transition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import LoginPage from '@/components/LoginPage.vue'
import CalendarToolbar from '@/components/CalendarToolbar.vue'
import CalendarList from '@/components/CalendarList.vue'
import DiaryEditor from '@/components/DiaryEditor.vue'
import QuickOptionsManager from '@/components/QuickOptionsManager.vue'
import UserManagement from '@/components/UserManagement.vue'

const authStore = useAuthStore()
const diaryStore = useDiaryStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentPage = ref('calendar')
const showMenu = ref(false)
const showEditor = ref(false)
const showQuickOptions = ref(false)
const selectedDay = ref(null)
const selectedDiary = ref(null)
const calendarListRef = ref(null)

const pageNames = {
  calendar: '日历日记',
  quickOptions: '快捷选项管理',
  users: '用户管理'
}

const currentPageName = computed(() => pageNames[currentPage.value] || '日历日记')

const canAccessUsers = computed(() => authStore.canAccessPage('users'))
const canAccessQuickOptions = computed(() => authStore.canAccessPage('quickOptions'))

const handleLoginSuccess = async () => {
  await diaryStore.initStore()
}

const handleLogout = () => {
  authStore.logout()
  currentPage.value = 'calendar'
}

const navigateTo = (page) => {
  currentPage.value = page
  showMenu.value = false
}

const handleDayClick = (day) => {
  selectedDay.value = day
  if (day.diaries.length > 0) {
    selectedDiary.value = day.diaries[0]
  } else {
    selectedDiary.value = null
  }
  showEditor.value = true
}

const handleEditDiary = ({ day, diary }) => {
  selectedDay.value = day
  selectedDiary.value = diary
  showEditor.value = true
}

const handleTodayClicked = () => {
  if (calendarListRef.value && calendarListRef.value.scrollToToday) {
    calendarListRef.value.scrollToToday()
  }
}

const handleDiarySaved = () => {
}

onMounted(async () => {
  authStore.initAuth()
  if (authStore.isLoggedIn) {
    await diaryStore.initStore()
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #4080ff 0%, #6a9dff 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 128, 255, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-toggle {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.app-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nav-btn.active {
  background: rgba(255, 255, 255, 0.4);
}

.nav-btn.logout-btn {
  background: rgba(244, 67, 54, 0.8);
}

.nav-btn.logout-btn:hover {
  background: rgba(244, 67, 54, 1);
}

.sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  width: 240px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 90;
  overflow-y: auto;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.sidebar-nav {
  padding: 8px 0;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.nav-item:hover {
  background: #f5f7fa;
  color: #4080ff;
}

.nav-item.active {
  background: #e3f2fd;
  color: #4080ff;
}

.toolbar-wrapper {
  position: sticky;
  top: 56px;
  z-index: 99;
  max-width: 800px;
  margin: 0 auto;
  padding: 8px 16px 0;
  background: #f5f7fa;
}

.app-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 12px 16px 20px;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-header {
    padding: 6px 10px;
    min-height: 44px;
  }
  
  .app-header h1 {
    font-size: 14px;
  }
  
  .menu-toggle {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
  
  .menu-toggle svg {
    width: 14px;
    height: 14px;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .nav-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    justify-content: center;
  }
  
  .sidebar {
    width: 200px;
    top: 44px;
  }
  
  .toolbar-wrapper {
    padding: 6px 8px 0;
    top: 44px;
  }
  
  .app-main {
    padding: 6px 8px 20px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 5px 8px;
    min-height: 40px;
  }
  
  .app-header h1 {
    font-size: 13px;
    font-weight: 500;
  }
  
  .menu-toggle {
    width: 26px;
    height: 26px;
    min-width: 26px;
    min-height: 26px;
  }
  
  .menu-toggle svg {
    width: 12px;
    height: 12px;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
  }
  
  .toolbar-wrapper {
    top: 40px;
    padding: 4px 6px 0;
  }
  
  .app-main {
    padding: 4px 6px 20px;
  }
  
  .sidebar {
    width: 180px;
    top: 40px;
  }
}
</style>