<template>
  <div class="calendar-list" ref="listRef">
    <div 
      v-for="(day, index) in calendarDays" 
      :key="day.dateStr"
      :data-date="day.dateStr"
      :class="['day-item', { today: day.isToday, selected: day.isSelected }]"
    >
      <div class="day-header">
        <div class="day-info">
          <span class="day-number">{{ day.day }}</span>
          <span class="day-week">{{ day.weekDay }}</span>
        </div>
        <div class="day-actions">
          <div v-if="day.color" class="day-color" :style="{ backgroundColor: day.color }"></div>
          <button 
            v-if="day.diaries.length > 0" 
            class="edit-btn" 
            @click.stop="handleEditDiary(day, day.diaries[0])"
            title="编辑日记"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button 
            v-else 
            class="add-btn-small" 
            @click.stop="handleDayClick(day)"
            title="添加日记"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="day.diaries.length > 0" class="day-diaries" @click="handleDayClick(day)">
        <div 
          v-for="diary in day.diaries.slice(0, 3)" 
          :key="diary.id"
          :class="['diary-preview', { important: diary.importance === 'high' }]"
        >
          <div v-if="diary.title" class="diary-title">{{ diary.title }}</div>
          <div v-if="diary.summary" class="diary-summary">{{ diary.summary }}</div>
          
          <div v-if="hasMarketMarks(diary)" class="market-marks">
            <span v-if="diary.marketMark" :class="['mark-badge', diary.marketMark]">大盘</span>
            <span v-if="diary.volumeMark" :class="['mark-badge', diary.volumeMark]">量能</span>
            <span v-if="diary.indexMark" :class="['mark-badge', diary.indexMark]">指数</span>
            <span v-if="diary.focusMark" :class="['mark-badge', diary.focusMark]">重点</span>
            <span v-if="diary.expectationMark" :class="['mark-badge', diary.expectationMark]">预期</span>
          </div>
          
          <div v-if="diary.tags && diary.tags.length > 0" class="diary-tags">
            <span v-for="tag in diary.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
          </div>
          
          <div v-if="diary.images && diary.images.length > 0" class="diary-images">
            <img 
              v-for="(img, idx) in diary.images.slice(0, 3)" 
              :key="idx" 
              :src="img" 
              alt="" 
              class="diary-image"
            />
            <span v-if="diary.images.length > 3" class="image-more">+{{ diary.images.length - 3 }}</span>
          </div>
        </div>
        <div v-if="day.diaries.length > 3" class="more-diaries">
          +{{ day.diaries.length - 3 }} 更多
        </div>
      </div>
      
      <div v-else class="no-diary" @click="handleDayClick(day)">
        <span>点击添加日记</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';
import { useDiaryStore, formatDate } from '@/stores/diary';

const store = useDiaryStore();
const emit = defineEmits(['select-day', 'edit-diary']);

const listRef = ref(null);

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const hasMarketMarks = (diary) => {
  return diary.marketMark || diary.volumeMark || diary.indexMark || diary.focusMark || diary.expectationMark;
};

const calendarDays = computed(() => {
  const result = [];
  const current = new Date(store.currentDate);
  let startDate;
  let endDate;

  if (store.viewMode === 'year') {
    startDate = new Date(current.getFullYear(), 0, 1);
    endDate = new Date(current.getFullYear(), 11, 31);
  } else if (store.viewMode === 'month') {
    startDate = new Date(current.getFullYear(), current.getMonth(), 1);
    endDate = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  } else {
    const dayOfWeek = current.getDay();
    startDate = new Date(current);
    startDate.setDate(current.getDate() - dayOfWeek);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

const scrollToToday = () => {
  nextTick(() => {
    const todayElement = document.querySelector('.day-item.today');
    if (todayElement) {
      todayElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  });
};

defineExpose({
  scrollToToday
});

const handleDayClick = (day) => {
  emit('select-day', day);
};

const handleEditDiary = (day, diary) => {
  emit('edit-diary', { day, diary });
};
</script>

<style scoped>
.calendar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-item {
  background: white;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.day-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.day-number {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.day-week {
  font-size: 13px;
  color: #999;
}

.day-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-color {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

.edit-btn,
.add-btn-small {
  width: 32px;
  height: 32px;
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

.edit-btn:hover,
.add-btn-small:hover {
  background: #4080ff;
  color: white;
}

.day-diaries {
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}

.diary-preview {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s;
}

.diary-preview:hover {
  background: #e8eaed;
}

.diary-preview.important {
  border-left: 3px solid #ff6b6b;
}

.diary-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diary-summary {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.market-marks {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.mark-badge {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 3px;
  font-weight: 500;
}

.mark-badge.red {
  background: #ffe0e0;
  color: #ff4444;
}

.mark-badge.green {
  background: #e0ffe0;
  color: #00c853;
}

.diary-tags {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 6px;
  background: #e8f4fd;
  color: #4080ff;
  font-size: 11px;
  border-radius: 12px;
}

.diary-images {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.diary-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.image-more {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #666;
}

.more-diaries {
  font-size: 12px;
  color: #4080ff;
  text-align: center;
  padding: 6px;
}

.no-diary {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 13px;
  cursor: pointer;
}

.no-diary:hover {
  color: #4080ff;
}

@media (max-width: 768px) {
  .calendar-list {
    gap: 8px;
  }
  
  .day-item {
    padding: 12px;
  }
  
  .day-header {
    margin-bottom: 8px;
    padding-bottom: 8px;
  }
  
  .day-number {
    font-size: 20px;
  }
  
  .day-week {
    font-size: 12px;
  }
  
  .day-color {
    width: 20px;
    height: 20px;
  }
  
  .edit-btn,
  .add-btn-small {
    width: 28px;
    height: 28px;
  }
  
  .diary-preview {
    padding: 8px;
  }
  
  .diary-title {
    font-size: 13px;
  }
  
  .diary-summary {
    font-size: 11px;
  }
  
  .no-diary {
    padding: 14px;
    font-size: 12px;
  }
  
  .diary-image {
    width: 36px;
    height: 36px;
  }
  
  .image-more {
    width: 36px;
    height: 36px;
  }
}
</style>
