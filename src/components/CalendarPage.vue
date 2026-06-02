<template>
  <div class="calendar-page">
    <div class="toolbar-wrapper">
      <CalendarToolbar @today-clicked="handleTodayClicked" @view-changed="handleTodayClicked" />
    </div>
    
    <CalendarList ref="calendarListRef" @select-day="handleDayClick" @edit-diary="handleEditDiary" />

    <transition name="modal-fade">
      <DiaryEditor 
        :visible="showEditor" 
        :day="selectedDay"
        :diary="selectedDiary"
        @close="showEditor = false"
        @saved="handleDiarySaved"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CalendarToolbar from '@/components/CalendarToolbar.vue'
import CalendarList from '@/components/CalendarList.vue'
import DiaryEditor from '@/components/DiaryEditor.vue'
import { useDiaryStore } from '@/stores/diary'

const store = useDiaryStore()
const showEditor = ref(false)
const selectedDay = ref(null)
const selectedDiary = ref(null)
const calendarListRef = ref(null)

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
  await store.initStore()
})
</script>

<style scoped>
.calendar-page {
  width: 100%;
}

.toolbar-wrapper {
  position: sticky;
  top: 56px;
  z-index: 99;
  padding: 8px 0 0;
  background: #f5f7fa;
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
  .toolbar-wrapper {
    padding: 6px 0 0;
    top: 44px;
  }
}

@media (max-width: 480px) {
  .toolbar-wrapper {
    padding: 4px 0 0;
    top: 40px;
  }
}
</style>