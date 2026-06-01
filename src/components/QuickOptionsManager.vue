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
            <div class="tabs-container">
              <div class="tabs-header">
                <button 
                  v-for="group in groups" 
                  :key="group.id"
                  :class="['tab-btn', { active: activeGroupId === group.id }]"
                  @click="activeGroupId = group.id"
                >
                  {{ group.name }}
                  <button 
                    v-if="groups.length > 1" 
                    @click.stop="removeGroup(group.id)" 
                    class="tab-close-btn"
                    title="删除分组"
                  >×</button>
                </button>
                <button 
                  v-if="groups.length < maxGroups"
                  class="tab-btn add-tab-btn" 
                  @click="showAddGroup = true"
                >+</button>
              </div>
              
              <div v-if="showAddGroup" class="add-group-row">
                <input 
                  ref="addGroupInput"
                  v-model="newGroupName" 
                  type="text" 
                  placeholder="输入分组名称"
                  class="group-name-input"
                  @keyup.enter="addGroup"
                  @keyup.escape="showAddGroup = false"
                />
                <button @click="addGroup" class="add-group-btn">确定</button>
                <button @click="cancelAddGroup" class="cancel-btn">取消</button>
              </div>
            </div>
            
            <div v-if="currentGroup" class="group-content">
              <div class="category-list">
                <div v-for="category in currentGroup.categories" :key="category.id" class="category-card">
                  <div class="category-header-row">
                    <span class="category-name">{{ category.name }}</span>
                    <button @click="removeCategory(currentGroup.id, category.id)" class="category-delete-btn" title="删除类别">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="options-area">
                    <div class="options-display">
                      <div 
                        v-for="option in category.options" 
                        :key="option" 
                        class="option-tag"
                      >
                        {{ option }}
                        <button @click="removeOption(currentGroup.id, category.id, option)" class="option-remove">×</button>
                      </div>
                      <div v-if="category.options.length === 0" class="empty-options">
                        暂无选项，点击下方添加
                      </div>
                    </div>
                    
                    <div class="add-option-row">
                      <input 
                        v-model="newOptions[category.id]" 
                        type="text" 
                        placeholder="添加选项"
                        class="option-input"
                        @keyup.enter="addOption(category.id)"
                      />
                      <button @click="addOption(category.id)" class="add-option-btn">+</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="add-category-row">
                <input 
                  v-model="newCategoryNames[currentGroup.id]" 
                  type="text" 
                  placeholder="添加新类别"
                  class="category-input"
                  @keyup.enter="addCategory(currentGroup.id)"
                />
                <button @click="addCategory(currentGroup.id)" class="add-category-btn">+ 添加类别</button>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <p>暂无分组，请创建一个</p>
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
import { reactive, ref, computed, watch, nextTick } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close'])
const store = useDiaryStore()

const groups = computed(() => {
  return store.quickOptionsGroups || []
})

const activeGroupId = ref('')
const showAddGroup = ref(false)
const maxGroups = 10
const addGroupInput = ref(null)

const currentGroup = computed(() => {
  return groups.value.find(g => g.id === activeGroupId.value)
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

watch(groups, (newGroups) => {
  if (newGroups.length > 0 && !activeGroupId.value) {
    activeGroupId.value = newGroups[0].id
  }
}, { immediate: true })

watch(() => props.visible, async (val) => {
  if (val && showAddGroup.value) {
    await nextTick()
    try {
      if (addGroupInput.value) {
        addGroupInput.value.focus()
      }
    } catch (e) {
      console.warn('Failed to focus input:', e)
    }
  }
})

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
  
  const result = await store.addQuickOptionsGroup(name)
  if (result) {
    activeGroupId.value = result.id
  }
  newGroupName.value = ''
  showAddGroup.value = false
}

const cancelAddGroup = () => {
  newGroupName.value = ''
  showAddGroup.value = false
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
  padding: 0;
}

.tabs-container {
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.tabs-header {
  display: flex;
  gap: 4px;
  padding: 10px 16px;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab-btn:hover {
  background: #e8eaed;
}

.tab-btn.active {
  background: white;
  color: #4080ff;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.tab-close-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: #eee;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tab-close-btn:hover {
  background: #ff6b6b;
  color: white;
}

.add-tab-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 18px;
  color: #4080ff;
}

.add-tab-btn:hover {
  background: rgba(64, 128, 255, 0.1);
}

.add-group-row {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #eee;
  align-items: center;
}

.add-group-row .group-name-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #4080ff;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.add-group-row .add-group-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: #4080ff;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.cancel-btn {
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #f5f7fa;
}

.group-content {
  padding: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #eee;
}

.category-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.category-delete-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.category-delete-btn:hover {
  background: #fff5f5;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.options-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.options-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  border: 1px solid #eee;
}

.option-remove {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.option-remove:hover {
  background: #ff6b6b;
  color: white;
}

.empty-options {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.add-option-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-option-row .option-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
}

.add-option-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #4080ff;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-option-btn:hover {
  background: #3070ef;
}

.add-category-row {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #ddd;
}

.add-category-row .category-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px dashed #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: #fafafa;
}

.add-category-btn {
  padding: 8px 16px;
  border: 1px dashed #4080ff;
  border-radius: 6px;
  background: rgba(64, 128, 255, 0.05);
  color: #4080ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-category-btn:hover {
  background: rgba(64, 128, 255, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state svg {
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
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
    padding: 12px;
  }
  
  .modal-header h2 {
    font-size: 16px;
  }
  
  .tabs-header {
    padding: 8px 12px;
  }
  
  .tab-btn {
    padding: 7px 12px;
    font-size: 13px;
  }
  
  .add-group-row {
    padding: 10px 12px;
    flex-wrap: wrap;
  }
  
  .add-group-row .group-name-input {
    width: 100%;
    order: 1;
  }
  
  .add-group-row .add-group-btn,
  .add-group-row .cancel-btn {
    order: 2;
  }
  
  .group-content {
    padding: 12px;
  }
  
  .category-card {
    padding: 12px;
  }
  
  .add-category-row {
    flex-wrap: wrap;
  }
  
  .add-category-row .category-input {
    width: 100%;
  }
  
  .modal-footer {
    padding: 12px;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
