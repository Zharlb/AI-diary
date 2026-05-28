<template>
  <div class="quick-options-modal" v-if="visible" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>管理快捷选项</h2>
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-for="(options, category) in quickOptions" :key="category" class="category-section">
          <div class="category-header">
            <h3>{{ categoryLabels[category] }}</h3>
            <div class="add-option">
              <input 
                v-model="newOptions[category]" 
                type="text" 
                :placeholder="`添加${categoryLabels[category]}`"
                class="option-input"
                @keyup.enter="addOption(category)"
              />
              <button @click="addOption(category)" class="add-btn">+</button>
            </div>
          </div>
          <div class="options-list">
            <div 
              v-for="option in options" 
              :key="option" 
              class="option-item"
            >
              <span>{{ option }}</span>
              <button @click="removeOption(category, option)" class="remove-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>import { reactive } from 'vue';
import { useDiaryStore } from '@/stores/diary';
const props = defineProps({
 visible: Boolean
});
const emit = defineEmits(['close']);
const store = useDiaryStore();
const quickOptions = store.quickOptions;
const categoryLabels = {
 market: '大盘',
 volume: '量能',
 index: '指数',
 focus: '重点',
 expectation: '预期'
};
const newOptions = reactive({
 market: '',
 volume: '',
 index: '',
 focus: '',
 expectation: ''
});
const addOption = (category) => {
 const option = newOptions[category].trim();
 if (option) {
 store.addQuickOption(category, option);
 newOptions[category] = '';
 }
};
const removeOption = (category, option) => {
 if (confirm(`确定要删除 "${option}" 吗？`)) {
 store.removeQuickOption(category, option);
 }
};
const handleClose = () => {
 emit('close');
};
</script>

<style scoped>
.quick-options-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
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

.close-btn:hover {
  background: #e8eaed;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.category-section {
  margin-bottom: 24px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-header h3 {
  margin: 0;
  font-size: 15px;
  color: #333;
}

.add-option {
  display: flex;
  gap: 8px;
}

.option-input {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  width: 150px;
}

.add-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: #4080ff;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
}

.remove-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #ff6b6b;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f5f7fa;
  color: #666;
}

.btn-secondary:hover {
  background: #e8eaed;
}
</style>