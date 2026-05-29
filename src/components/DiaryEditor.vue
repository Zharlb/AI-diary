<template>
  <transition name="modal-fade">
    <div class="diary-modal" v-if="visible">
      <transition name="modal-scale">
        <div class="modal-content" v-if="visible">
          <div class="modal-header">
            <h2>{{ isEdit ? '编辑日记' : '新建日记' }}</h2>
            <button class="close-btn" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group flex-2">
                <label>标题</label>
                <div class="input-with-clear">
                  <input v-model="form.title" type="text" placeholder="输入标题" class="form-input" />
                  <button v-if="form.title" class="clear-btn" @click="form.title = ''">×</button>
                </div>
              </div>
              <div class="form-group">
                <label>颜色标记</label>
                <div class="color-picker">
                  <button 
                    v-for="color in colors" 
                    :key="color"
                    :class="['color-btn', { active: form.color === color }]"
                    :style="{ backgroundColor: color }"
                    @click="form.color = color"
                  ></button>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group flex-1">
                <label>概要</label>
                <div class="textarea-with-clear">
                  <textarea v-model="form.summary" placeholder="输入概要" class="form-textarea short"></textarea>
                  <button v-if="form.summary" class="clear-btn textarea-clear" @click="form.summary = ''">×</button>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>标签</label>
                <div class="tags-container">
                  <div 
                    v-for="tag in form.tags" 
                    :key="tag" 
                    class="tag-item"
                  >
                    {{ tag }}
                    <button @click="removeTag(tag)" class="tag-remove">×</button>
                  </div>
                  <div class="tag-input-wrapper">
                    <input 
                      v-model="newTag" 
                      type="text" 
                      placeholder="添加标签"
                      class="tag-input"
                      @keyup.enter="addTag"
                    />
                    <button @click="addTag" class="tag-add-btn">+</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="market-section">
              <h3>市场记录</h3>
              
              <div class="market-grid">
                <div 
                  v-for="(_, category) in quickOptions" 
                  :key="category"
                  class="market-item"
                >
                  <div class="market-label-row">
                    <div class="market-label-info">
                      <label>{{ categoryLabels[category] || category }}</label>
                      <div class="color-marks">
                        <button 
                          :class="['mark-btn', 'up', { active: form[category + 'Mark'] === 'up' }]"
                          @click="form[category + 'Mark'] = form[category + 'Mark'] === 'up' ? '' : 'up'"
                        ></button>
                        <button 
                          :class="['mark-btn', 'down', { active: form[category + 'Mark'] === 'down' }]"
                          @click="form[category + 'Mark'] = form[category + 'Mark'] === 'down' ? '' : 'down'"
                        ></button>
                      </div>
                    </div>
                  </div>
                  <div class="quick-input">
                    <div class="input-with-clear">
                      <input v-model="form[category]" type="text" class="form-input" placeholder="输入或选择" />
                      <button v-if="form[category]" class="clear-btn" @click="form[category] = ''">×</button>
                    </div>
                    <div class="quick-options">
                      <button 
                        v-for="opt in quickOptions[category]" 
                        :key="opt"
                        :class="['quick-btn', { selected: form[category] === opt }]"
                        @click="form[category] = opt"
                      >{{ opt }}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group flex-1">
                <label>图片上传</label>
                <div class="image-upload-area" @click="triggerFileInput">
                  <input 
                    type="file" 
                    ref="fileInputRef"
                    accept="image/*" 
                    multiple 
                    @change="handleFileSelect"
                    style="display: none;"
                  />
                  <div class="upload-placeholder" v-if="form.images.length === 0">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>点击或拖拽图片到此处上传</span>
                  </div>
                  <div class="image-preview-list" v-else>
                    <div 
                      v-for="(img, index) in form.images" 
                      :key="index" 
                      class="image-item"
                      @click.stop="openPreview(index)"
                    >
                      <img :src="img" alt="" />
                      <button class="remove-image" @click.stop="removeImage(index)">×</button>
                    </div>
                    <div class="add-more-images" @click.stop="triggerFileInput">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group flex-1">
                <label>内容</label>
                <div :class="['editor-tabs', { 'fullscreen': isEditorFullscreen }]">
                  <button 
                    :class="['tab-btn', { active: editorMode === 'edit' }]"
                    @click="editorMode = 'edit'"
                  >编辑</button>
                  <button 
                    :class="['tab-btn', { active: editorMode === 'preview' }]"
                    @click="editorMode = 'preview'"
                  >预览</button>
                  <button 
                    class="tab-btn fullscreen-btn"
                    @click="toggleEditorFullscreen"
                    :title="isEditorFullscreen ? '退出全屏' : '全屏编辑'"
                  >
                    <svg v-if="!isEditorFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
                    </svg>
                  </button>
                </div>
                <div :class="['rich-editor', { 'fullscreen': isEditorFullscreen }]" v-show="editorMode === 'edit'">
                  <QuillEditor 
                    v-model:content="form.content"
                    contentType="html"
                    theme="snow"
                    toolbar="full"
                    placeholder="输入日记内容..."
                    @update:content="handleEditorUpdate"
                  />
                </div>
                <div 
                  v-if="editorMode === 'preview'" 
                  class="preview-content"
                  v-html="form.content"
                ></div>
              </div>
            </div>
            
            <div v-if="diary && diary.history && diary.history.length > 0" class="history-section">
              <h3>修改记录</h3>
              <div class="history-list">
                <div 
                  v-for="(item, index) in reversedHistory" 
                  :key="index" 
                  class="history-item"
                >
                  <div class="history-header" @click="item.action !== '创建' && toggleHistoryItem(index)">
                    <span class="history-time">{{ formatTime(item.time) }}</span>
                    <span class="history-action">{{ item.action }}</span>
                    <button v-if="item.action !== '创建'" class="toggle-btn">
                      {{ expandedHistory[index] ? '▼' : '▶' }}
                    </button>
                  </div>
                  <div v-if="item.changes && item.changes.length > 0" v-show="expandedHistory[index]" class="history-changes">
                    <div v-for="(change, cIndex) in item.changes" :key="cIndex" class="change-item">
                      <span class="change-field">{{ change.field }}</span>
                      <span class="change-detail">
                        <span v-if="change.oldValue" class="old-value">{{ change.oldValue }}</span>
                        <span class="arrow">→</span>
                        <span v-if="change.newValue" class="new-value">{{ change.newValue }}</span>
                        <span v-if="change.position" class="change-position">({{ change.position }})</span>
                      </span>
                    </div>
                  </div>
                  <div v-else-if="item.action !== '创建'" v-show="expandedHistory[index]" class="no-changes">
                    无内容变更
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button v-if="isEdit" class="btn btn-danger btn-icon" @click="handleDelete" title="删除">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <div class="right-buttons">
              <button class="btn btn-secondary" @click="handleClose">取消</button>
              <button class="btn btn-primary" @click="handleSave">保存</button>
            </div>
          </div>
        </div>
      </transition>
      
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
import { ref, watch, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useDiaryStore, formatDate } from '@/stores/diary'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  visible: Boolean,
  day: Object,
  diary: Object
})

const emit = defineEmits(['close', 'saved'])

const store = useDiaryStore()
const quickOptions = computed(() => store.quickOptions)
const categoryLabels = computed(() => store.categoryLabels)

const confirmVisible = ref(false)
const confirmTitle = ref('提示')
const confirmMessage = ref('')
const confirmType = ref('info')
const confirmCallback = ref(null)
const confirmShowCancel = ref(true)

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

const editorMode = ref('edit')
const isEditorFullscreen = ref(false)
const newTag = ref('')
const fileInputRef = ref(null)
const expandedHistory = ref({})
const previewVisible = ref(false)
const previewSrc = ref('')
const previewImages = ref([])
const currentIndex = ref(0)
const scale = ref(1)
const rotation = ref(0)

const toggleEditorFullscreen = () => {
  isEditorFullscreen.value = !isEditorFullscreen.value
}

const form = reactive({
  title: '',
  summary: '',
  content: '',
  tags: [],
  color: '#4080ff',
  market: '',
  volume: '',
  index: '',
  focus: '',
  expectation: '',
  marketMark: '',
  volumeMark: '',
  indexMark: '',
  focusMark: '',
  expectationMark: '',
  images: []
})

const colors = [
  '#4080ff',
  '#ff6b6b',
  '#ffd93d',
  '#6bcb77',
  '#ff9f43'
]

const isEdit = computed(() => !!props.diary)
const originalDiary = ref(null)

const reversedHistory = computed(() => {
  if (!props.diary || !props.diary.history) return []
  return [...props.diary.history].reverse()
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.diary) {
      originalDiary.value = JSON.parse(JSON.stringify(props.diary))
      Object.assign(form, {
        title: props.diary.title || '',
        summary: props.diary.summary || '',
        content: props.diary.content || '',
        tags: [...(props.diary.tags || [])],
        color: props.diary.color || '#4080ff',
        images: [...(props.diary.images || [])]
      })
      Object.keys(quickOptions.value).forEach(category => {
        form[category] = props.diary[category] || ''
        form[category + 'Mark'] = props.diary[category + 'Mark'] || ''
      })
      expandedHistory.value = {}
      if (props.diary.history && props.diary.history.length > 0) {
        expandedHistory.value[0] = true
      }
    } else {
      originalDiary.value = null
      Object.assign(form, {
        title: '',
        summary: '',
        content: '',
        tags: [],
        color: '#4080ff',
        images: []
      })
      Object.keys(quickOptions.value).forEach(category => {
        form[category] = ''
        form[category + 'Mark'] = ''
      })
      expandedHistory.value = {}
    }
    editorMode.value = 'edit'
  }
})

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = form.tags.indexOf(tag)
  if (index !== -1) {
    form.tags.splice(index, 1)
  }
}

const handleEditorUpdate = (content) => {
  form.content = content
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        form.images.push(event.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
  e.target.value = ''
}

const removeImage = (index) => {
  form.images.splice(index, 1)
}

const openPreview = (index) => {
  previewImages.value = form.images
  currentIndex.value = index
  previewSrc.value = form.images[index]
  scale.value = 1
  rotation.value = 0
  previewVisible.value = true
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewVisible.value = false
  document.body.style.overflow = ''
}

const handleWheel = (e) => {
  if (!previewVisible.value) return
  
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.min(Math.max(scale.value + delta, 0.5), 3)
}

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5)
}

const rotateLeft = () => {
  rotation.value -= 90
}

const rotateRight = () => {
  rotation.value += 90
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    previewSrc.value = previewImages.value[currentIndex.value]
    scale.value = 1
    rotation.value = 0
  }
}

const nextImage = () => {
  if (currentIndex.value < previewImages.value.length - 1) {
    currentIndex.value++
    previewSrc.value = previewImages.value[currentIndex.value]
    scale.value = 1
    rotation.value = 0
  }
}

const handleKeydown = (e) => {
  if (!previewVisible.value) return
  
  switch (e.key) {
    case 'Escape':
      closePreview()
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const toggleHistoryItem = (index) => {
  expandedHistory.value[index] = !expandedHistory.value[index]
}

const trackChanges = () => {
  if (!originalDiary.value) return []
  
  const changes = []
  const baseFields = [
    { key: 'title', label: '标题' },
    { key: 'summary', label: '概要' },
    { key: 'content', label: '内容' },
    { key: 'color', label: '颜色' },
    { key: 'tags', label: '标签' }
  ]
  
  const categoryFields = []
  Object.keys(quickOptions.value).forEach(category => {
    const label = categoryLabels.value[category] || category
    categoryFields.push({ key: category, label })
    categoryFields.push({ key: category + 'Mark', label: label + '标记' })
  })
  
  const fields = [...baseFields, ...categoryFields]
  
  fields.forEach(field => {
    const oldVal = originalDiary.value[field.key]
    const newVal = form[field.key]
    
    if (field.key === 'tags') {
      const oldStr = Array.isArray(oldVal) ? oldVal.join(',') : ''
      const newStr = Array.isArray(newVal) ? newVal.join(',') : ''
      if (oldStr !== newStr) {
        changes.push({
          field: field.label,
          oldValue: oldStr || '(空)',
          newValue: newStr || '(空)',
          position: '标签列表'
        })
      }
    } else if (field.key === 'content') {
      if (oldVal !== newVal) {
        changes.push({
          field: field.label,
          oldValue: '(已修改)',
          newValue: '(已修改)',
          position: '富文本内容'
        })
      }
    } else {
      const oldStr = String(oldVal || '')
      const newStr = String(newVal || '')
      if (oldStr !== newStr) {
        changes.push({
          field: field.label,
          oldValue: oldStr || '(空)',
          newValue: newStr || '(空)',
          position: '表单输入'
        })
      }
    }
  })
  
  return changes
}

const formatTime = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleSave = () => {
  if (!form.title.trim()) {
    showConfirm('提示', '请输入标题', 'warning', null, false)
    return
  }
  
  const data = {
    title: form.title,
    summary: form.summary,
    content: form.content,
    tags: [...form.tags],
    color: form.color,
    images: [...form.images],
    date: formatDate(props.day?.date || new Date())
  }
  
  Object.keys(quickOptions.value).forEach(category => {
    data[category] = form[category]
    data[category + 'Mark'] = form[category + 'Mark']
  })
  
  if (props.diary) {
    const changes = trackChanges()
    store.updateDiary(props.diary.id, data, changes.length > 0 ? changes : undefined)
  } else {
    store.addDiary(data)
  }
  
  emit('saved')
  handleClose()
}

const handleDelete = () => {
  showConfirm('删除日记', '确定要删除这篇日记吗？', 'error', () => {
    store.deleteDiary(props.diary.id)
    emit('saved')
    handleClose()
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

.diary-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: auto;
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

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.form-group.flex-1 {
  flex: 1;
  min-width: 200px;
}

.form-group.flex-2 {
  flex: 2;
  min-width: 200px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 9px 30px 9px 11px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.form-input:focus {
  border-color: #4080ff;
}

.form-textarea {
  padding: 11px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 90px;
  transition: border-color 0.2s;
  width: 100%;
}

.form-textarea.short {
  min-height: 55px;
}

.form-textarea:focus {
  border-color: #4080ff;
}

.input-with-clear,
.textarea-with-clear {
  position: relative;
  width: 100%;
}

.input-with-clear .form-input {
  padding-right: 30px;
}

.textarea-with-clear .form-textarea {
  padding-right: 30px;
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: #ccc;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.textarea-clear {
  top: 11px;
  transform: none;
}

.clear-btn:hover {
  background: #999;
}

.color-picker {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.color-btn {
  width: 26px;
  height: 26px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #333;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  background: #e8f4fd;
  color: #4080ff;
  border-radius: 16px;
  font-size: 12px;
}

.tag-remove {
  width: 17px;
  height: 17px;
  border: none;
  background: rgba(64, 128, 255, 0.2);
  border-radius: 50%;
  color: #4080ff;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-input-wrapper {
  display: flex;
  align-items: center;
}

.tag-input {
  padding: 5px 9px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  width: 110px;
}

.tag-add-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: #4080ff;
  color: white;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  margin-left: 4px;
}

.market-section {
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 14px;
}

.market-section h3 {
  font-size: 15px;
  margin: 0 0 12px 0;
  color: #333;
  font-weight: 600;
}

.market-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.market-item {
  width: calc(50% - 5px);
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.market-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.market-label-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.market-label-row label {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.color-marks {
  display: flex;
  gap: 6px;
}

.mark-btn {
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mark-btn.up {
  background: #fff;
  border-color: #ff4444;
}

.mark-btn.up.active {
  background: #ff4444;
  border-color: #ff4444;
}

.mark-btn.down {
  background: #fff;
  border-color: #00c853;
}

.mark-btn.down.active {
  background: #00c853;
  border-color: #00c853;
}

.quick-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-btn {
  padding: 4px 9px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  font-size: 11px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #f0f5ff;
  border-color: #4080ff;
  color: #4080ff;
}

.quick-btn.selected {
  background: #4080ff;
  border-color: #4080ff;
  color: white;
}

.image-upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 100px;
}

.image-upload-area:hover {
  border-color: #4080ff;
  background: #f8f9ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 13px;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-more-images {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.add-more-images:hover {
  border-color: #4080ff;
  color: #4080ff;
}

.editor-tabs {
  display: flex;
  gap: 7px;
  margin-bottom: 7px;
}

.editor-tabs.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  background: white;
  padding: 10px 16px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 0;
}

.tab-btn {
  padding: 5px 14px;
  border: none;
  border-radius: 4px;
  background: #f5f7fa;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #4080ff;
  color: white;
}

.tab-btn.fullscreen-btn {
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.rich-editor {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.rich-editor.fullscreen {
  position: fixed;
  top: 52px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  border: none;
  border-radius: 0;
  background: white;
}

.rich-editor.fullscreen :deep(.ql-toolbar) {
  border-left: none;
  border-right: none;
  border-top: none;
}

.rich-editor.fullscreen :deep(.ql-container) {
  height: calc(100vh - 52px - 42px);
}

.rich-editor.fullscreen :deep(.ql-editor) {
  min-height: calc(100vh - 52px - 42px);
  height: 100%;
}

.rich-editor :deep(.ql-toolbar) {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid #e0e0e0;
}

.rich-editor :deep(.ql-container) {
  border: none;
  font-size: 14px;
}

.rich-editor :deep(.ql-editor) {
  min-height: 150px;
  line-height: 1.6;
}

.preview-content {
  min-height: 150px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  overflow-y: auto;
  max-height: 300px;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.preview-content :deep(li) {
  margin: 4px 0;
}

.preview-content :deep(p) {
  margin: 8px 0;
}

.history-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.history-section h3 {
  font-size: 14px;
  margin: 0 0 11px 0;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-header:hover {
  background: #f0f0f0;
}

.history-time {
  color: #999;
  font-size: 12px;
  flex-shrink: 0;
}

.history-action {
  color: #4080ff;
  font-weight: 500;
  font-size: 12px;
  flex: 1;
}

.toggle-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-changes {
  padding: 0 12px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.change-item:last-child {
  border-bottom: none;
}

.change-field {
  color: #666;
  min-width: 60px;
  flex-shrink: 0;
}

.change-detail {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.old-value {
  color: #ff6b6b;
  text-decoration: line-through;
}

.arrow {
  color: #999;
}

.new-value {
  color: #6bcb77;
  font-weight: 500;
}

.change-position {
  color: #999;
  font-size: 11px;
  font-style: italic;
}

.no-changes {
  padding: 0 10px 10px 10px;
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.modal-footer .right-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4080ff;
  color: white;
}

.btn-primary:hover {
  background: #3070ef;
}

.btn-secondary {
  background: #f5f7fa;
  color: #666;
}

.btn-secondary:hover {
  background: #e8eaed;
}

.btn-danger {
  background: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background: #ee5a5a;
}

.btn-icon {
  padding: 9px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  .diary-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 8px;
    max-height: none;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .modal-content {
    border-radius: 8px;
    max-height: 95vh;
    margin-top: auto;
    margin-bottom: auto;
  }
  
  .modal-header {
    padding: 12px;
    flex-wrap: wrap;
    gap: 8px;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }
  
  .modal-header h2 {
    font-size: 16px;
    flex: 1;
  }
  
  .close-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    font-size: 18px;
  }
  
  .modal-body {
    padding: 12px;
    overflow-y: auto;
    max-height: calc(95vh - 120px);
    -webkit-overflow-scrolling: touch;
  }
  
  .form-row {
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  
  .form-group,
  .form-group.flex-1,
  .form-group.flex-2 {
    min-width: 100%;
  }
  
  .form-group label {
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .form-input {
    font-size: 14px;
    padding: 10px 12px;
    min-height: 40px;
  }
  
  .form-textarea {
    font-size: 14px;
    padding: 10px 12px;
    min-height: 80px;
  }
  
  .form-textarea.short {
    min-height: 50px;
  }
  
  .clear-btn {
    width: 22px;
    height: 22px;
    font-size: 16px;
  }
  
  .color-picker {
    gap: 8px;
  }
  
  .color-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
  
  .tags-container {
    gap: 6px;
  }
  
  .tag-item {
    padding: 4px 10px;
    font-size: 12px;
  }
  
  .tag-remove {
    width: 18px;
    height: 18px;
    font-size: 14px;
  }
  
  .tag-input {
    font-size: 13px;
    padding: 6px 10px;
    width: 120px;
    min-height: 32px;
  }
  
  .tag-add-btn {
    width: 28px;
    height: 32px;
    min-width: 28px;
    min-height: 32px;
    font-size: 16px;
  }
  
  .market-section {
    padding: 10px;
    margin-bottom: 12px;
    border-radius: 6px;
  }
  
  .market-section h3 {
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .market-grid {
    gap: 8px;
  }
  
  .market-item {
    width: 100%;
    padding: 10px;
    background: white;
    border-radius: 6px;
  }
  
  .market-label-row {
    margin-bottom: 6px;
  }
  
  .market-label-row label {
    font-size: 13px;
  }
  
  .mark-btn {
    width: 26px;
    height: 26px;
    min-width: 26px;
    min-height: 26px;
    font-size: 12px;
  }
  
  .quick-options {
    gap: 4px;
  }
  
  .quick-btn {
    padding: 4px 10px;
    font-size: 12px;
    min-height: 28px;
  }
  
  .image-upload-area {
    padding: 12px;
    min-height: 90px;
    border-radius: 6px;
  }
  
  .upload-placeholder {
    font-size: 13px;
    gap: 8px;
  }
  
  .upload-placeholder svg {
    width: 28px;
    height: 28px;
  }
  
  .image-preview-list {
    gap: 8px;
  }
  
  .image-item {
    width: 70px;
    height: 70px;
  }
  
  .remove-image {
    width: 22px;
    height: 22px;
    font-size: 16px;
  }
  
  .add-more-images {
    width: 70px;
    height: 70px;
  }
  
  .editor-tabs {
    gap: 6px;
    margin-bottom: 10px;
  }
  
  .tab-btn {
    padding: 6px 14px;
    font-size: 13px;
    min-height: 28px;
  }
  
  .rich-editor :deep(.ql-toolbar) {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .rich-editor :deep(.ql-editor) {
    min-height: 120px;
    font-size: 14px;
  }
  
  .preview-content {
    font-size: 14px;
    padding: 12px;
    min-height: 120px;
    max-height: 200px;
  }
  
  .history-section {
    margin-top: 12px;
    padding-top: 12px;
  }
  
  .history-section h3 {
    font-size: 13px;
    margin-bottom: 10px;
  }
  
  .history-list {
    max-height: 180px;
  }
  
  .history-header {
    padding: 8px;
    gap: 8px;
  }
  
  .history-time {
    font-size: 12px;
  }
  
  .history-action {
    font-size: 12px;
  }
  
  .toggle-btn {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }
  
  .history-changes {
    padding: 0 8px 8px 8px;
  }
  
  .change-item {
    font-size: 12px;
    gap: 8px;
  }
  
  .change-field {
    min-width: 50px;
    font-size: 11px;
  }
  
  .modal-footer {
    padding: 10px 12px;
    gap: 8px;
    position: sticky;
    bottom: 0;
    background: #fafafa;
    z-index: 10;
  }
  
  .btn {
    padding: 10px 16px;
    font-size: 14px;
    min-height: 40px;
  }
  
  .modal-footer .right-buttons {
    flex: 1;
    justify-content: flex-end;
  }
  
  .modal-footer .right-buttons .btn {
    flex: none;
    width: 80px;
  }
  
  .btn-danger {
    background: #ff6b6b;
  }
  
  .btn-icon {
    padding: 10px 12px;
    flex: none;
    width: 44px;
  }
  
  .preview-toolbar {
    top: 8px;
    padding: 5px 10px;
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
  .diary-modal {
    padding: 4px;
  }
  
  .modal-content {
    border-radius: 6px;
  }
  
  .modal-header {
    padding: 10px;
  }
  
  .modal-header h2 {
    font-size: 15px;
  }
  
  .close-btn {
    width: 30px;
    height: 30px;
  }
  
  .modal-body {
    padding: 10px;
    max-height: calc(95vh - 110px);
  }
  
  .form-row {
    gap: 6px;
    margin-bottom: 10px;
  }
  
  .form-input {
    font-size: 13px;
    padding: 9px 10px;
    min-height: 38px;
  }
  
  .form-textarea {
    font-size: 13px;
    padding: 9px 10px;
    min-height: 70px;
  }
  
  .form-textarea.short {
    min-height: 45px;
  }
  
  .color-btn {
    width: 24px;
    height: 24px;
  }
  
  .tag-item {
    padding: 3px 8px;
    font-size: 11px;
  }
  
  .tag-input {
    font-size: 12px;
    width: 100px;
  }
  
  .market-section {
    padding: 8px;
    margin-bottom: 10px;
  }
  
  .market-item {
    padding: 6px;
    margin-bottom: 6px;
  }
  
  .market-label-row label {
    font-size: 11px;
  }
  
  .mark-btn {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
  
  .quick-btn {
    padding: 3px 8px;
    font-size: 11px;
  }
  
  .image-upload-area {
    padding: 10px;
    min-height: 80px;
  }
  
  .upload-placeholder {
    font-size: 12px;
  }
  
  .upload-placeholder svg {
    width: 24px;
    height: 24px;
  }
  
  .image-item {
    width: 60px;
    height: 60px;
  }
  
  .remove-image {
    width: 20px;
    height: 20px;
  }
  
  .add-more-images {
    width: 60px;
    height: 60px;
  }
  
  .tab-btn {
    padding: 5px 12px;
    font-size: 12px;
  }
  
  .rich-editor :deep(.ql-editor) {
    min-height: 100px;
    font-size: 13px;
  }
  
  .preview-content {
    font-size: 13px;
    padding: 10px;
    min-height: 100px;
  }
  
  .history-list {
    max-height: 150px;
  }
  
  .history-header {
    padding: 6px;
    gap: 6px;
  }
  
  .history-time {
    font-size: 11px;
  }
  
  .history-action {
    font-size: 11px;
  }
  
  .change-item {
    font-size: 11px;
    gap: 6px;
  }
  
  .modal-footer {
    padding: 8px 10px;
    gap: 6px;
  }
  
  .btn {
    padding: 8px 14px;
    font-size: 13px;
    min-height: 36px;
  }
  
  .toolbar-btn {
    width: 28px;
    height: 28px;
  }
  
  .zoom-level,
  .image-counter {
    font-size: 10px;
    min-width: 35px;
  }
  
  .close-preview-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }
}
</style>
