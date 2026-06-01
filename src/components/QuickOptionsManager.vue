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
            <div class="add-group-section">
              <div class="add-group-header">
                <h3>添加新分组</h3>
              </div>
              <div class="add-group-inputs">
                <input 
                  v-model="newGroupName" 
                  type="text" 
                  placeholder="分组名称"
                  class="group-name-input"
                  @keyup.enter="addGroup"
                />
                <button @click="addGroup" class="add-group-btn">添加</button>
              </div>
            </div>
            
            <div v-for="group in groups" :key="group.id" class="group-section">
              <div class="group-header">
                <h3>{{ group.name }}</h3>
                <div class="group-actions">
                  <div class="add-category">
                    <input 
                      v-model="newCategoryNames[group.id]" 
                      type="text" 
                      :placeholder="'添加类别'"
                      class="category-input"
                      @keyup.enter="addCategory(group.id)"
                    />
                    <button @click="addCategory(group.id)" class="add-btn">+</button>
                  </div>
                  <button @click="removeGroup(group.id)" class="remove-group-btn" title="删除分组">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div v-for="category in group.categories" :key="category.id" class="category-section">
                <div class="category-header">
                  <h4>{{ category.name }}</h4>
                  <div class="category-actions">
                    <div class="add-option">
                      <input 
                        v-model="newOptions[category.id]" 
                        type="text" 
                        :placeholder="'添加选项'"
                        class="option-input"
                        @keyup.enter="addOption(category.id)"
                      />
                      <button @click="addOption(category.id)" class="add-btn">+</button>
                    </div>
                    <button @click="removeCategory(group.id, category.id)" class="remove-category-btn" title="删除类别">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="options-list">
                  <div 
                    v-for="option in category.options" 
                    :key="option" 
                    class="option-item"
                  >
                    <span>{{ option }}</span>
                    <button @click="removeOption(group.id, category.id, option)" class="remove-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
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
  
  <ConfirmModal
    :visible="confirmVisible"
    :title="confirmTitle"
    :message="confirmMessage"
    :type="confirmType"
    :show-cancel="confirmShowCancel"
    @close="confirmVisible = false"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close'])
const store = useDiaryStore()

// 使用计算属性从 store 获取分组数据
const groups = computed(() => {
  return store.quickOptionsGroups || []
})

const newOptions = reactive({})
const newCategoryNames = reactive({})
const newGroupName = ref('')

const confirmVisible = ref(false)
const confirmTitle = ref('提示')
const confirmMessage = ref('')
const confirmType = ref('info')
const confirmCallback = ref(null)
const confirmShowCancel = ref(true)

// 背景锁定功能
const handleTouchMove = (e) => {
  const target = e.target
  const modalContent = document.querySelector('.modal-content')
  
  if (modalContent && modalContent.contains(target)) {
    return
  }
  
  e.preventDefault()
}

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('touchmove', handleTouchMove)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('touchmove', handleTouchMove)
})

const showConfirm = (title, message, type = 'info', callback = null, showCancel = true) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmType.value = type
  confirmCallback.value = callback
  confirmShowCancel.value = showCancel
  confirmVisible.value = true
}

const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
}

const addGroup = async () => {
  const name = newGroupName.value.trim()
  if (!name) {
    showConfirm('提示', '请输入分组名称', 'warning', null, false)
    return
  }
  
  await store.addQuickOptionsGroup(name)
  newGroupName.value = ''
}

const removeGroup = (groupId) => {
  showConfirm('删除分组', '确定要删除该分组及其所有内容吗？', 'error', async () => {
    await store.removeQuickOptionsGroup(groupId)
  })
}

const addCategory = async (groupId) => {
  const name = newCategoryNames[groupId]?.trim()
  if (!name) {
    showConfirm('提示', '请输入类别名称', 'warning', null, false)
    return
  }
  
  await store.addQuickCategoryToGroup(groupId, name)
  newCategoryNames[groupId] = ''
}

const removeCategory = (groupId, categoryId) => {
  showConfirm('删除类别', '确定要删除该类别及其所有选项吗？', 'warning', async () => {
    await store.removeQuickCategoryFromGroup(groupId, categoryId)
  })
}

const addOption = async (categoryId) => {
  const option = newOptions[categoryId]?.trim()
  if (option) {
    await store.addQuickOption(categoryId, option)
    newOptions[categoryId] = ''
  }
}

const removeOption = (groupId, categoryId, option) => {
  showConfirm('删除选项', `确定要删除 "${option}" 吗？`, 'warning', async () => {
    await store.removeQuickOption(categoryId, option)
  })
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
  max-width: 700px;
  max-height: 85vh;
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

.add-group-section {
  background: #f8f9fa;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px dashed #ddd;
}

.add-group-header {
  margin-bottom: 10px;
}

.add-group-header h3 {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.add-group-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.group-name-input {
  padding: 7px 11px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  min-width: 180px;
}

.add-group-btn {
  padding: 7px 14px;
  border: none;
  border-radius: 4px;
  background: #6c757d;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-group-btn:hover {
  background: #5a6268;
}

.group-section {
  background: #fafbfc;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 16px;
}

.group-section:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.group-header h3 {
  margin: 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-category {
  display: flex;
  gap: 6px;
  align-items: center;
}

.category-input {
  padding: 5px 9px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  width: 120px;
}

.remove-group-btn {
  width: 28px;
  height: 28px;
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

.remove-group-btn:hover {
  background: #fff5f5;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.category-section {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #eee;
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
  gap: 8px;
}

.category-header h4 {
  margin: 0;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.category-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-option {
  display: flex;
  gap: 6px;
  align-items: center;
}

.option-input {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  width: 100px;
}

.add-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: #4080ff;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #3070ef;
}

.remove-category-btn {
  width: 24px;
  height: 24px;
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

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
}

.remove-btn {
  width: 18px;
  height: 18px;
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
  
  .group-section {
    margin-bottom: 14px;
  }
  
  .category-section {
    margin-bottom: 10px;
  }
  
  .option-input {
    width: 80px;
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
