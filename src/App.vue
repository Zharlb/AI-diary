<template>
  <div class="app">
    <header class="app-header">
      <h1>日历日记</h1>
      <button class="options-btn" @click="showQuickOptions = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </header>
    
    <div class="toolbar-wrapper">
      <CalendarToolbar />
    </div>
    
    <main class="app-main">
      <CalendarList @select-day="handleDayClick" />
    </main>
    
    <button class="add-btn" @click="openNewDiary">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
    
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
import { ref } from 'vue'
import CalendarToolbar from '@/components/CalendarToolbar.vue'
import CalendarList from '@/components/CalendarList.vue'
import DiaryEditor from '@/components/DiaryEditor.vue'
import QuickOptionsManager from '@/components/QuickOptionsManager.vue'

const showEditor = ref(false)
const showQuickOptions = ref(false)
const selectedDay = ref(null)
const selectedDiary = ref(null)

const handleDayClick = (day) => {
  selectedDay.value = day
  if (day.diaries.length > 0) {
    selectedDiary.value = day.diaries[0]
  } else {
    selectedDiary.value = null
  }
  showEditor.value = true
}

const openNewDiary = () => {
  selectedDay.value = { date: new Date() }
  selectedDiary.value = null
  showEditor.value = true
}

const handleDiarySaved = () => {
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
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

.add-btn {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #4080ff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 128, 255, 0.4);
  transition: all 0.2s;
  z-index: 98;
}

.add-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 128, 255, 0.5);
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
  .app-main {
    padding: 8px 12px 20px;
  }
  
  .toolbar-wrapper {
    padding: 8px 12px 0;
  }
  
  .app-header h1 {
    font-size: 16px;
  }
  
  .add-btn {
    width: 52px;
    height: 52px;
    right: 12px;
    bottom: 12px;
  }
}
</style>