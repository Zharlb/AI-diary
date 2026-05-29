<template>
  <transition name="modal-fade">
    <div class="quick-options-modal" v-if="visible" @click.self="handleClose">
      <transition name="modal-scale">
        <div class="modal-content" v-if="visible">
          <div class="modal-header">
            <h2>管理快捷选项</h2>
            <button class="close-btn" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="add-category-section">
              <div class="add-category-header">
                <h3>添加新类别</h3>
              </div>
              <div class="add-category-inputs">
                <input 
                  v-model="newCategoryKey" 
                  type="text" 
                  placeholder="输入类别标识（如：market）"
                  class="category-key-input"
                />
                <input 
                  v-model="newCategoryLabel" 
                  type="text" 
                  placeholder="输入类别名称（如：大盘）"
                  class="category-label-input"
                />
                <button @click="addCategory" class="add-category-btn">添加类别</button>
              </div>
            </div>
            
            <div v-for="(options, category) in quickOptions" :key="category" class="category-section">
              <div class="category-header">
                <h3>{{ categoryLabels[category] || category }}</h3>
                <div class="category-actions">
                  <div class="add-option">
                    <input 
                      v-model="newOptions[category]" 
                      type="text" 
                      :placeholder="'添加' + (categoryLabels[category] || category)"
                      class="option-input"
                      @keyup.enter="addOption(category)"
                    />
                    <button @click="addOption(category)" class="add-btn">+</button>
                  </div>
                  <button @click="removeCategory(category)" class="remove-category-btn" title="删除类别">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
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
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useDiaryStore } from '@/stores/diary'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close'])
const store = useDiaryStore()
const quickOptions = store.quickOptions
const categoryLabels = store.categoryLabels

const newOptions = reactive({})
const newCategoryKey = ref('')
const newCategoryLabel = ref('')

const addOption = (category) => {
  const option = newOptions[category]?.trim()
  if (option) {
    store.addQuickOption(category, option)
    newOptions[category] = ''
  }
}

const removeOption = (category, option) => {
  if (confirm(`确定要删除 "${option}" 吗？`)) {
    store.removeQuickOption(category, option)
  }
}

const addCategory = () => {
  const key = newCategoryKey.value.trim()
  const label = newCategoryLabel.value.trim()
  if (key && label) {
    if (quickOptions[key]) {
      alert('该类别标识已存在')
      return
    }
    store.addQuickCategory(key, label)
    newOptions[key] = ''
    newCategoryKey.value = ''
    newCategoryLabel.value = ''
  } else {
    alert('请输入类别标识和名称')
  }
}

const removeCategory = (category) => {
  if (confirm(`确定要删除类别 "${categoryLabels[category] || category}" 及其所有选项吗？`)) {
    store.removeQuickCategory(category)
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

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
  padding: 16px;
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
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 17px;
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
  padding: 16px;
}

.category-section {
  margin-bottom: 20px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.category-header h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.category-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-option {
  display: flex;
  gap: 7px;
  align-items: center;
}

.add-category-section {
  background: #f8f9fa;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px dashed #ddd;
}

.add-category-header {
  margin-bottom: 10px;
}

.add-category-header h3 {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.add-category-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.category-key-input,
.category-label-input {
  padding: 7px 11px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  min-width: 120px;
}

.category-label-input {
  min-width: 140px;
}

.add-category-btn {
  padding: 7px 14px;
  border: none;
  border-radius: 4px;
  background: #6c757d;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-category-btn:hover {
  background: #5a6268;
}

.remove-category-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-category-btn:hover {
  background: #fff5f5;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.option-input {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  width: 140px;
}

.add-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #4080ff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #3070ef;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
}

.remove-btn {
  width: 20px;
  height: 20px;
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
  padding: 14px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
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

@media (max-width: 768px) {
  .quick-options-modal {
    padding: 10px;
  }
  
  .modal-header {
    padding: 14px;
  }
  
  .modal-header h2 {
    font-size: 16px;
  }
  
  .modal-body {
    padding: 14px;
  }
  
  .category-section {
    margin-bottom: 18px;
  }
  
  .category-header {
    gap: 8px;
  }
  
  .option-input {
    width: 120px;
  }
  
  .modal-footer {
    padding: 12px 14px;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>