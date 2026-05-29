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
          v-for="diary in day.diaries" 
          :key="diary.id"
          class="diary-preview"
        >
          <div v-if="diary.title" class="diary-title">{{ diary.title }}</div>
          <div v-if="diary.summary" class="diary-summary">{{ diary.summary }}</div>
          
          <div v-if="hasMarketInfo(diary)" class="market-info">
            <div v-if="diary.market" class="market-item">
              <span class="market-label">大盘:</span>
              <span class="market-value" :class="diary.marketMark">{{ diary.market }}</span>
            </div>
            <div v-if="diary.volume" class="market-item">
              <span class="market-label">量能:</span>
              <span class="market-value" :class="diary.volumeMark">{{ diary.volume }}</span>
            </div>
            <div v-if="diary.index" class="market-item">
              <span class="market-label">指数:</span>
              <span class="market-value" :class="diary.indexMark">{{ diary.index }}</span>
            </div>
            <div v-if="diary.focus" class="market-item">
              <span class="market-label">重点:</span>
              <span class="market-value" :class="diary.focusMark">{{ diary.focus }}</span>
            </div>
            <div v-if="diary.expectation" class="market-item">
              <span class="market-label">预期:</span>
              <span class="market-value" :class="diary.expectationMark">{{ diary.expectation }}</span>
            </div>
          </div>
          
          <div v-if="diary.tags && diary.tags.length > 0" class="diary-tags">
            <span v-for="tag in diary.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          
          <div v-if="diary.images && diary.images.length > 0" class="diary-images">
            <img 
              v-for="(img, idx) in diary.images" 
              :key="idx" 
              :src="img" 
              alt="" 
              class="diary-image"
              @click.stop="openPreview(diary.images, idx)"
            />
          </div>
          
          <div v-if="diary.content" class="diary-content" v-html="diary.content"></div>
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

const hasMarketInfo = (diary) => {
  return diary.market || diary.volume || diary.index || diary.focus || diary.expectation;
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
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.day-week {
  font-size: 14px;
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
}

.diary-preview {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  word-wrap: break-word;
}

.diary-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.diary-summary {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}

.market-info {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #4080ff;
}

.market-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 14px;
}

.market-item:last-child {
  margin-bottom: 0;
}

.market-label {
  color: #666;
  font-weight: 500;
  min-width: 34px;
}

.market-value {
  color: #222;
  flex: 1;
  font-weight: 500;
}

.market-value.up {
  color: #ff4444;
}

.market-value.down {
  color: #00c853;
}

.diary-tags {
  display: flex;
  gap: 5px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 8px;
  background: #e8f4fd;
  color: #4080ff;
  font-size: 13px;
  border-radius: 14px;
}

.diary-images {
  display: flex;
  gap: 5px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.diary-image {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.diary-image:hover {
  transform: scale(1.1);
}

.diary-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
  font-size: 14px;
  color: #444;
  line-height: 1.7;
}

.diary-content :deep(p) {
  margin: 4px 0;
}

.diary-content :deep(ul),
.diary-content :deep(ol) {
  padding-left: 16px;
  margin: 4px 0;
}

.diary-content :deep(li) {
  margin: 2px 0;
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
    gap: 10px;
    padding: 0;
  }
  
  .day-item {
    padding: 14px;
    border-radius: 8px;
    border-left-width: 4px;
  }
  
  .day-item:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .day-header {
    margin-bottom: 10px;
    padding-bottom: 10px;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .day-info {
    flex: 1;
    min-width: 60px;
  }
  
  .day-number {
    font-size: 24px;
    font-weight: 700;
  }
  
  .day-week {
    font-size: 14px;
    color: #666;
  }
  
  .day-color {
    width: 22px;
    height: 22px;
  }
  
  .edit-btn,
  .add-btn-small {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }
  
  .edit-btn svg,
  .add-btn-small svg {
    width: 16px;
    height: 16px;
  }
  
  .diary-preview {
    padding: 12px;
    border-radius: 6px;
  }
  
  .diary-title {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #1a1a1a;
  }
  
  .diary-summary {
    font-size: 15px;
    line-height: 1.6;
    color: #444;
    margin-bottom: 8px;
  }
  
  .market-info {
    padding: 10px;
    margin-top: 10px;
    border-radius: 4px;
  }
  
  .market-item {
    font-size: 15px;
    margin-bottom: 5px;
    gap: 8px;
    align-items: center;
  }
  
  .market-item:last-child {
    margin-bottom: 0;
  }
  
  .market-label {
    min-width: 40px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
  }
  
  .market-value {
    flex: 1;
    color: #222;
    font-weight: 500;
  }
  
  .market-value.up {
    color: #ff4444;
  }
  
  .market-value.down {
    color: #00c853;
  }
  
  .diary-tags {
    margin-top: 10px;
    gap: 6px;
  }
  
  .tag {
    font-size: 11px;
    padding: 3px 7px;
  }
  
  .diary-images {
    margin-top: 6px;
    gap: 4px;
  }
  
  .diary-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
  }
  
  .diary-content {
    font-size: 12px;
    margin-top: 8px;
    padding-top: 8px;
    line-height: 1.6;
  }
  
  .no-diary {
    padding: 16px;
    font-size: 12px;
  }
  
  .image-more {
    width: 40px;
    height: 40px;
    font-size: 11px;
  }
  
  .preview-toolbar {
    top: 10px;
    padding: 6px 12px;
    gap: 4px;
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }
  
  .zoom-level,
  .image-counter {
    font-size: 11px;
    min-width: 40px;
  }
  
  .preview-image {
    max-width: 95%;
    max-height: 65vh;
  }
  
  .close-preview-btn {
    width: 36px;
    height: 36px;
    font-size: 20px;
    top: 10px;
    right: 10px;
  }
}

@media (max-width: 480px) {
  .calendar-list {
    gap: 8px;
  }
  
  .day-item {
    padding: 12px;
    border-radius: 6px;
    border-left-width: 3px;
  }
  
  .day-header {
    margin-bottom: 8px;
    padding-bottom: 8px;
    gap: 8px;
  }
  
  .day-number {
    font-size: 22px;
    font-weight: 700;
  }
  
  .day-week {
    font-size: 13px;
    color: #666;
  }
  
  .day-color {
    width: 20px;
    height: 20px;
  }
  
  .edit-btn,
  .add-btn-small {
    width: 30px;
    height: 30px;
    min-width: 30px;
    min-height: 30px;
  }
  
  .diary-preview {
    padding: 10px;
  }
  
  .diary-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
    color: #1a1a1a;
  }
  
  .diary-summary {
    font-size: 14px;
    line-height: 1.6;
    color: #444;
    margin-bottom: 6px;
  }
  
  .market-info {
    padding: 8px;
    margin-top: 8px;
  }
  
  .market-item {
    font-size: 14px;
    margin-bottom: 4px;
    gap: 6px;
    align-items: center;
  }
  
  .market-label {
    min-width: 36px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
  }
  
  .market-value {
    flex: 1;
    color: #222;
  }
  
  .diary-tags {
    margin-top: 8px;
    gap: 5px;
  }
  
  .tag {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 14px;
  }
  
  .diary-images {
    margin-top: 8px;
    gap: 4px;
  }
  
  .diary-image {
    width: 44px;
    height: 44px;
    border-radius: 4px;
  }
  
  .diary-content {
    font-size: 14px;
    line-height: 1.6;
    margin-top: 8px;
    padding-top: 8px;
    color: #444;
  }
  
  .no-diary {
    padding: 16px;
    font-size: 14px;
    color: #999;
  }
  
  .image-more {
    width: 44px;
    height: 44px;
    font-size: 12px;
  }
  
  .toolbar-btn {
    width: 30px;
    height: 30px;
    min-width: 30px;
    min-height: 30px;
  }
  
  .zoom-level,
  .image-counter {
    font-size: 11px;
    min-width: 38px;
  }
  
  .close-preview-btn {
    width: 34px;
    height: 34px;
    font-size: 19px;
  }
}
</style>
