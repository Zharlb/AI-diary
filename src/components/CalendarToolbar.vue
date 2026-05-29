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
const emit = defineEmits(['today-clicked', 'view-changed'])

const viewModes = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' }
]

const viewMode = computed(() => store.viewMode)

const currentDateText = computed(() => {
  const date = new Date(store.currentDate)
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
  // 切换视图时设置日期为今天
  const now = new Date()
  store.setViewMode(mode)
  store.setCurrentDate(now)
  emit('view-changed')
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
  const now = new Date()
  store.setCurrentDate(now)
  emit('today-clicked')
}
</script>

<style scoped>
.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}

.view-controls {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.view-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: #f5f7fa;
  color: #666;
  cursor: pointer;
  font-size: 13px;
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
  gap: 10px;
  flex-shrink: 0;
}

.nav-btn {
  width: 34px;
  height: 34px;
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
  min-width: 100px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
}

.today-btn {
  padding: 6px 16px;
  border: 1px solid #4080ff;
  border-radius: 6px;
  background: white;
  color: #4080ff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.today-btn:hover {
  background: #f0f5ff;
}

@media (max-width: 768px) {
  .calendar-toolbar {
    padding: 8px 10px;
    gap: 8px;
    border-radius: 6px;
  }
  
  .view-controls {
    gap: 4px;
  }
  
  .view-btn {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 4px;
    min-width: 44px;
    min-height: 28px;
  }
  
  .nav-controls {
    gap: 8px;
  }
  
  .nav-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
  
  .nav-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .current-date {
    min-width: 80px;
    font-size: 12px;
  }
  
  .today-btn {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 4px;
    min-width: 44px;
    min-height: 28px;
  }
}

@media (max-width: 480px) {
  .calendar-toolbar {
    padding: 6px 8px;
    gap: 6px;
    flex-wrap: wrap;
    border-radius: 4px;
  }
  
  .view-controls {
    width: 100%;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .view-btn {
    padding: 6px 14px;
    font-size: 12px;
    min-width: 48px;
    min-height: 30px;
  }
  
  .nav-controls {
    width: 100%;
    justify-content: center;
    gap: 8px;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }
  
  .nav-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .current-date {
    min-width: 80px;
    font-size: 13px;
    font-weight: 600;
  }
  
  .today-btn {
    padding: 6px 14px;
    font-size: 12px;
    min-width: 48px;
    min-height: 32px;
  }
}
</style>