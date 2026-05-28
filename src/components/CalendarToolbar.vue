<template>
  <div class="calendar-toolbar">
    <div class="view-controls">
      <button 
        v-for="mode in viewModes" 
        :key="mode.value"
        :class="['view-btn', { active: viewMode === mode.value }]"
        @click="handleViewChange(mode.value)"
      >
        {{ mode.label }}
      </button>
    </div>
    
    <div class="nav-controls">
      <button class="nav-btn" @click="handlePrev">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="current-date">{{ currentDateText }}</div>
      <button class="nav-btn" @click="handleNext">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      <button class="today-btn" @click="handleToday">
        今天
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiaryStore } from '@/stores/diary'

const store = useDiaryStore()

const viewModes = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' }
]

const viewMode = computed(() => store.viewMode)

const currentDateText = computed(() => {
  const date = store.currentDate
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  
  if (store.viewMode === 'year') {
    return `${year}年`
  } else if (store.viewMode === 'month') {
    return `${year}年${month}月`
  } else {
    return `${year}年${month}月`
  }
})

const handleViewChange = (mode) => {
  store.setViewMode(mode)
}

const handlePrev = () => {
  const date = new Date(store.currentDate)
  if (store.viewMode === 'year') {
    date.setFullYear(date.getFullYear() - 1)
  } else if (store.viewMode === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else {
    date.setDate(date.getDate() - 7)
  }
  store.setCurrentDate(date)
}

const handleNext = () => {
  const date = new Date(store.currentDate)
  if (store.viewMode === 'year') {
    date.setFullYear(date.getFullYear() + 1)
  } else if (store.viewMode === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else {
    date.setDate(date.getDate() + 7)
  }
  store.setCurrentDate(date)
}

const handleToday = () => {
  store.setCurrentDate(new Date())
}
</script>

<style scoped>
.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.view-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f5f7fa;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #e8eaed;
}

.view-btn.active {
  background: #4080ff;
  color: white;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f5f7fa;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #e8eaed;
}

.current-date {
  min-width: 120px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.today-btn {
  padding: 8px 16px;
  border: 1px solid #4080ff;
  border-radius: 6px;
  background: white;
  color: #4080ff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.today-btn:hover {
  background: #f0f5ff;
}
</style>