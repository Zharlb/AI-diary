<template>
  <div class="calendar-list">
    <div 
      v-for="day in calendarDays" 
      :key="day.dateStr"
      :class="['day-item', { today: day.isToday, selected: day.isSelected }]"
      @click="handleDayClick(day)"
    >
      <div class="day-header">
        <div class="day-info">
          <span class="day-number">{{ day.day }}</span>
          <span class="day-week">{{ day.weekDay }}</span>
        </div>
        <div v-if="day.color" class="day-color" :style="{ backgroundColor: day.color }"></div>
      </div>
      
      <div v-if="day.diaries.length > 0" class="day-diaries">
        <div 
          v-for="diary in day.diaries.slice(0, 3)" 
          :key="diary.id"
          :class="['diary-preview', { important: diary.importance === 'high' }]"
        >
          <div v-if="diary.title" class="diary-title">{{ diary.title }}</div>
          <div v-if="diary.summary" class="diary-summary">{{ diary.summary }}</div>
          <div v-if="diary.tags && diary.tags.length > 0" class="diary-tags">
            <span v-for="tag in diary.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <div v-if="day.diaries.length > 3" class="more-diaries">
          +{{ day.diaries.length - 3 }} 更多
        </div>
      </div>
      
      <div v-else class="no-diary">
        <span>暂无日记</span>
      </div>
    </div>
  </div>
</template>

<script setup>import { computed } from 'vue';
import { useDiaryStore, formatDate } from '@/stores/diary';
const store = useDiaryStore();
const emit = defineEmits(['select-day']);
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const calendarDays = computed(() => {
 const result = [];
 const current = new Date(store.currentDate);
 let startDate;
 let endDate;
 if (store.viewMode === 'year') {
 startDate = new Date(current.getFullYear(), 0, 1);
 endDate = new Date(current.getFullYear(), 11, 31);
 }
 else if (store.viewMode === 'month') {
 startDate = new Date(current.getFullYear(), current.getMonth(), 1);
 endDate = new Date(current.getFullYear(), current.getMonth() + 1, 0);
 }
 else {
 const dayOfWeek = current.getDay();
 startDate = new Date(current);
 startDate.setDate(current.getDate() - dayOfWeek);
 endDate = new Date(startDate);
 endDate.setDate(startDate.getDate() + 6);
 }
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const currentDateForCompare = new Date(store.currentDate);
 currentDateForCompare.setHours(0, 0, 0, 0);
 const date = new Date(startDate);
 while (date <= endDate) {
 const dateStr = formatDate(date);
 const diaries = store.getDiariesByDate(date);
 const dateForCompare = new Date(date);
 dateForCompare.setHours(0, 0, 0, 0);
 const isToday = dateForCompare.getTime() === today.getTime();
 const isSelected = isToday;
 const color = diaries.length > 0 ? diaries[0].color : null;
 result.push({
 date: new Date(date),
 dateStr,
 day: date.getDate(),
 weekDay: weekDays[date.getDay()],
 diaries,
 isToday,
 isSelected,
 color
 });
 date.setDate(date.getDate() + 1);
 }
 return result;
});
const handleDayClick = (day) => {
 emit('select-day', day);
};
</script>

<style scoped>
.calendar-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.day-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.day-item.today {
  border-left-color: #4080ff;
}

.day-item.selected {
  background: #f8f9fa;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.day-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.day-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.day-week {
  font-size: 14px;
  color: #999;
}

.day-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.day-diaries {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary-preview {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s;
}

.diary-preview:hover {
  background: #f0f0f0;
}

.diary-preview.important {
  border-left: 3px solid #ff6b6b;
}

.diary-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diary-summary {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.diary-tags {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  padding: 2px 8px;
  background: #e8f4fd;
  color: #4080ff;
  font-size: 12px;
  border-radius: 12px;
}

.more-diaries {
  font-size: 13px;
  color: #4080ff;
  text-align: center;
  padding: 8px;
}

.no-diary {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>