<template>
  <div class="app">
    <header class="app-header">
      <h1>日历日记</h1>
      <button class="options-btn" @click="showQuickOptions = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </header>
    
    <div class="toolbar-wrapper">
      <CalendarToolbar @today-clicked="handleTodayClicked" @view-changed="handleTodayClicked" />
    </div>
    
    <main class="app-main">
      <CalendarList ref="calendarListRef" @select-day="handleDayClick" @edit-diary="handleEditDiary" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CalendarToolbar from '@/components/CalendarToolbar.vue'
import CalendarList from '@/components/CalendarList.vue'
import DiaryEditor from '@/components/DiaryEditor.vue'
import QuickOptionsManager from '@/components/QuickOptionsManager.vue'
import { useDiaryStore } from '@/stores/diary'

const store = useDiaryStore()
const showEditor = ref(false)
const showQuickOptions = ref(false)
const selectedDay = ref(null)
const selectedDiary = ref(null)
const calendarListRef = ref(null)

onMounted(async () => {
  await store.initStore()
})

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

.app-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.options-btn {
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

.options-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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

/* 弹窗过渡效果 */
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
  
  .options-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
  
  .options-btn svg {
    width: 14px;
    height: 14px;
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
  
  .options-btn {
    width: 26px;
    height: 26px;
    min-width: 26px;
    min-height: 26px;
  }
  
  .options-btn svg {
    width: 12px;
    height: 12px;
  }
  
  .toolbar-wrapper {
    top: 40px;
    padding: 4px 6px 0;
  }
  
  .app-main {
    padding: 4px 6px 20px;
  }
}
</style>
