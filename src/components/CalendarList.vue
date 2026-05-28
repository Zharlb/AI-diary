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
      
      <div v-if="day.diaries.length > 0" class="day-diaries">
        <div 
          v-for="diary in day.diaries.slice(0, 3)" 
          :key="diary.id"
          class="diary-preview"
        >
          <div v-if="diary.title" class="diary-title">{{ diary.title }}</div>
          <div v-if="diary.summary" class="diary-summary">{{ diary.summary }}</div>
          
          <div v-if="hasMarketMarks(diary)" class="market-marks">
            <span v-if="diary.marketMark" :class="['mark-badge', diary.marketMark]">▲</span>
            <span v-if="diary.volumeMark" :class="['mark-badge', diary.volumeMark]">量</span>
            <span v-if="diary.indexMark" :class="['mark-badge', diary.indexMark]">指</span>
            <span v-if="diary.focusMark" :class="['mark-badge', diary.focusMark]">重</span>
            <span v-if="diary.expectationMark" :class="['mark-badge', diary.expectationMark]">预</span>
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
              @click.stop="openPreview(diary.images, idx)"
            />
            <span v-if="diary.images.length > 3" class="image-more">+{{ diary.images.length - 3 }}</span>
          </div>
        </div>
        <div v-if="day.diaries.length > 3" class="more-diaries">
          +{{ day.diaries.length - 3 }} 更多
        </div>
      </div>
      
      <div v-else class="no-diary">
        <span></span>
      </div>
    </div>
    
    <!-- 图片预览 -->
    <transition name="preview-fade">
      <div v-if="previewVisible" class="image-preview-modal" @click="closePreview" @wheel="handleWheel">
        <div class="preview-toolbar">
          <button class="toolbar-btn" @click.stop="zoomIn" title="放大">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
            </svg>
          </button>
          <button class="toolbar-btn" @click.stop="zoomOut" title="缩小">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8 11h6"/>
            </svg>
          </button>
          <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
          <button class="toolbar-btn" @click.stop="rotateLeft" title="左旋">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/>
            </svg>
          </button>
          <button class="toolbar-btn" @click.stop="rotateRight" title="右旋">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
            </svg>
          </button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" @click.stop="prevImage" :disabled="currentIndex <= 0" title="上一张">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <span class="image-counter">{{ currentIndex + 1 }} / {{ previewImages.length }}</span>
          <button class="toolbar-btn" @click.stop="nextImage" :disabled="currentIndex >= previewImages.length - 1" title="下一张">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
        <img 
          :src="previewSrc" 
          alt="" 
          class="preview-image"
          :style="{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease'
          }"
          @click.stop
        />
        <button class="close-preview-btn" @click.stop="closePreview">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useDiaryStore, formatDate } from '@/stores/diary';

const store = useDiaryStore();
const emit = defineEmits(['select-day', 'edit-diary']);

const listRef = ref(null);
const previewVisible = ref(false);
const previewSrc = ref('');
const previewImages = ref([]);
const currentIndex = ref(0);
const scale = ref(1);
const rotation = ref(0);

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const hasMarketMarks = (diary) => {
  return diary.marketMark || diary.volumeMark || diary.indexMark || diary.focusMark || diary.expectationMark;
};

const openPreview = (images, index) => {
  previewImages.value = images;
  currentIndex.value = index;
  previewSrc.value = images[index];
  scale.value = 1;
  rotation.value = 0;
  previewVisible.value = true;
  document.body.style.overflow = 'hidden';
};

const closePreview = () => {
  previewVisible.value = false;
  document.body.style.overflow = '';
};

const handleWheel = (e) => {
  if (!previewVisible.value) return;
  
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.min(Math.max(scale.value + delta, 0.5), 3);
};

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3);
};

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5);
};

const rotateLeft = () => {
  rotation.value -= 90;
};

const rotateRight = () => {
  rotation.value += 90;
};

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    previewSrc.value = previewImages.value[currentIndex.value];
    scale.value = 1;
    rotation.value = 0;
  }
};

const nextImage = () => {
  if (currentIndex.value < previewImages.value.length - 1) {
    currentIndex.value++;
    previewSrc.value = previewImages.value[currentIndex.value];
    scale.value = 1;
    rotation.value = 0;
  }
};

const handleKeydown = (e) => {
  if (!previewVisible.value) return;
  
  switch (e.key) {
    case 'Escape':
      closePreview();
      break;
    case 'ArrowLeft':
      prevImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

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
  min-width: 18px;
  text-align: center;
}

.mark-badge.up {
  background: #ffe0e0;
  color: #ff4444;
}

.mark-badge.down {
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
  cursor: pointer;
  transition: transform 0.2s;
}

.diary-image:hover {
  transform: scale(1.1);
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

/* 图片预览 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 24px;
  backdrop-filter: blur(10px);
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-level,
.image-counter {
  color: white;
  font-size: 13px;
  min-width: 50px;
  text-align: center;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}

.preview-image {
  max-width: 85%;
  max-height: 75vh;
  object-fit: contain;
  cursor: grab;
}

.preview-image:active {
  cursor: grabbing;
}

.close-preview-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-preview-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.3s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
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
  
  .preview-toolbar {
    top: 10px;
    padding: 6px 12px;
    gap: 4px;
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
  }
  
  .zoom-level,
  .image-counter {
    font-size: 11px;
    min-width: 40px;
  }
  
  .preview-image {
    max-width: 90%;
    max-height: 70vh;
  }
}
</style>
