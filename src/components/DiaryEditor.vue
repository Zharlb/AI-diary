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
              <div class="form-group flex-1">
                <label>标题</label>
                <input v-model="form.title" type="text" placeholder="输入标题" class="form-input" />
              </div>
              <div class="form-group">
                <label>重要程度</label>
                <div class="importance-btns">
                  <button 
                    v-for="imp in importanceOptions" 
                    :key="imp.value"
                    :class="['imp-btn', imp.value, { active: form.importance === imp.value }]"
                    @click="form.importance = imp.value"
                  >
                    {{ imp.label }}
                  </button>
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
                <textarea v-model="form.summary" placeholder="输入概要" class="form-textarea short"></textarea>
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
              
              <div class="form-row">
                <div class="form-group market-item">
                  <div class="market-label-row">
                    <label>大盘</label>
                    <div class="color-marks">
                      <button 
                        :class="['mark-btn', 'red', { active: form.marketMark === 'red' }]"
                        @click="form.marketMark = form.marketMark === 'red' ? '' : 'red'"
                      >红</button>
                      <button 
                        :class="['mark-btn', 'green', { active: form.marketMark === 'green' }]"
                        @click="form.marketMark = form.marketMark === 'green' ? '' : 'green'"
                      >绿</button>
                    </div>
                  </div>
                  <div class="quick-input">
                    <input v-model="form.market" type="text" class="form-input" />
                    <div class="quick-options">
                      <button 
                        v-for="opt in quickOptions.market" 
                        :key="opt"
                        :class="['quick-btn', { selected: form.market === opt }]"
                        @click="form.market = opt"
                      >{{ opt }}</button>
                    </div>
                  </div>
                </div>
                <div class="form-group market-item">
                  <div class="market-label-row">
                    <label>量能</label>
                    <div class="color-marks">
                      <button 
                        :class="['mark-btn', 'red', { active: form.volumeMark === 'red' }]"
                        @click="form.volumeMark = form.volumeMark === 'red' ? '' : 'red'"
                      >红</button>
                      <button 
                        :class="['mark-btn', 'green', { active: form.volumeMark === 'green' }]"
                        @click="form.volumeMark = form.volumeMark === 'green' ? '' : 'green'"
                      >绿</button>
                    </div>
                  </div>
                  <div class="quick-input">
                    <input v-model="form.volume" type="text" class="form-input" />
                    <div class="quick-options">
                      <button 
                        v-for="opt in quickOptions.volume" 
                        :key="opt"
                        :class="['quick-btn', { selected: form.volume === opt }]"
                        @click="form.volume = opt"
                      >{{ opt }}</button>
                    </div>
                  </div>
                </div>
                <div class="form-group market-item">
                  <div class="market-label-row">
                    <label>指数</label>
                    <div class="color-marks">
                      <button 
                        :class="['mark-btn', 'red', { active: form.indexMark === 'red' }]"
                        @click="form.indexMark = form.indexMark === 'red' ? '' : 'red'"
                      >红</button>
                      <button 
                        :class="['mark-btn', 'green', { active: form.indexMark === 'green' }]"
                        @click="form.indexMark = form.indexMark === 'green' ? '' : 'green'"
                      >绿</button>
                    </div>
                  </div>
                  <div class="quick-input">
                    <input v-model="form.index" type="text" class="form-input" />
                    <div class="quick-options">
                      <button 
                        v-for="opt in quickOptions.index" 
                        :key="opt"
                        :class="['quick-btn', { selected: form.index === opt }]"
                        @click="form.index = opt"
                      >{{ opt }}</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group market-item">
                  <div class="market-label-row">
                    <label>重点</label>
                    <div class="color-marks">
                      <button 
                        :class="['mark-btn', 'red', { active: form.focusMark === 'red' }]"
                        @click="form.focusMark = form.focusMark === 'red' ? '' : 'red'"
                      >红</button>
                      <button 
                        :class="['mark-btn', 'green', { active: form.focusMark === 'green' }]"
                        @click="form.focusMark = form.focusMark === 'green' ? '' : 'green'"
                      >绿</button>
                    </div>
                  </div>
                  <div class="quick-input">
                    <input v-model="form.focus" type="text" class="form-input" />
                    <div class="quick-options">
                      <button 
                        v-for="opt in quickOptions.focus" 
                        :key="opt"
                        :class="['quick-btn', { selected: form.focus === opt }]"
                        @click="form.focus = opt"
                      >{{ opt }}</button>
                    </div>
                  </div>
                </div>
                <div class="form-group market-item">
                  <div class="market-label-row">
                    <label>预期</label>
                    <div class="color-marks">
                      <button 
                        :class="['mark-btn', 'red', { active: form.expectationMark === 'red' }]"
                        @click="form.expectationMark = form.expectationMark === 'red' ? '' : 'red'"
                      >红</button>
                      <button 
                        :class="['mark-btn', 'green', { active: form.expectationMark === 'green' }]"
                        @click="form.expectationMark = form.expectationMark === 'green' ? '' : 'green'"
                      >绿</button>
                    </div>
                  </div>
                  <div class="quick-input">
                    <input v-model="form.expectation" type="text" class="form-input" />
                    <div class="quick-options">
                      <button 
                        v-for="opt in quickOptions.expectation" 
                        :key="opt"
                        :class="['quick-btn', { selected: form.expectation === opt }]"
                        @click="form.expectation = opt"
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
                    <div v-for="(img, index) in form.images" :key="index" class="image-item">
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
                <div class="editor-tabs">
                  <button 
                    :class="['tab-btn', { active: editorMode === 'edit' }]"
                    @click="editorMode = 'edit'"
                  >编辑</button>
                  <button 
                    :class="['tab-btn', { active: editorMode === 'preview' }]"
                    @click="editorMode = 'preview'"
                  >预览</button>
                </div>
                <div class="rich-editor" v-show="editorMode === 'edit'">
                  <div class="toolbar">
                    <button type="button" @click="execCommand('bold')" title="加粗"><b>B</b></button>
                    <button type="button" @click="execCommand('italic')" title="斜体"><i>I</i></button>
                    <button type="button" @click="execCommand('underline')" title="下划线"><u>U</u></button>
                    <button type="button" @click="execCommand('strikeThrough')" title="删除线"><s>S</s></button>
                    <span class="separator">|</span>
                    <button type="button" @click="execCommand('insertUnorderedList')" title="无序列表">• 列表</button>
                    <button type="button" @click="execCommand('insertOrderedList')" title="有序列表">1. 列表</button>
                  </div>
                  <div 
                    ref="editorRef"
                    contenteditable="true"
                    class="editor-content"
                    @input="handleEditorInput"
                    @paste="handlePaste"
                  ></div>
                </div>
                <div 
                  v-if="editorMode === 'preview'" 
                  class="preview-content"
                  v-html="form.content"
                ></div>
              </div>
            </div>
            
            <div v-if="diary && diary.history" class="history-section">
              <h3>修改记录</h3>
              <div class="history-list">
                <div v-for="(item, index) in diary.history" :key="index" class="history-item">
                  <div class="history-header">
                    <span class="history-time">{{ formatTime(item.time) }}</span>
                    <span class="history-action">{{ item.action }}</span>
                  </div>
                  <div v-if="item.changes && item.changes.length > 0" class="history-changes">
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
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button v-if="isEdit" class="btn btn-danger" @click="handleDelete">删除</button>
            <button class="btn btn-secondary" @click="handleClose">取消</button>
            <button class="btn btn-primary" @click="handleSave">保存</button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, reactive, computed, nextTick } from 'vue'
import { useDiaryStore, formatDate } from '@/stores/diary'

const props = defineProps({
  visible: Boolean,
  day: Object,
  diary: Object
})

const emit = defineEmits(['close', 'saved'])

const store = useDiaryStore()
const quickOptions = computed(() => store.quickOptions)

const editorMode = ref('edit')
const newTag = ref('')
const editorRef = ref(null)
const fileInputRef = ref(null)

const importanceOptions = [
  { value: 'low', label: '普通' },
  { value: 'medium', label: '重要' },
  { value: 'high', label: '非常重要' }
]

const form = reactive({
  title: '',
  summary: '',
  content: '',
  tags: [],
  importance: 'low',
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
  '#ff9f43',
  '#a55eea',
  '#00d2d3',
  '#54a0ff'
]

const isEdit = computed(() => !!props.diary)
const originalDiary = ref(null)

watch(() => props.visible, (val) => {
  if (val) {
    if (props.diary) {
      originalDiary.value = JSON.parse(JSON.stringify(props.diary))
      Object.assign(form, {
        title: props.diary.title || '',
        summary: props.diary.summary || '',
        content: props.diary.content || '',
        tags: [...(props.diary.tags || [])],
        importance: props.diary.importance || 'low',
        color: props.diary.color || '#4080ff',
        market: props.diary.market || '',
        volume: props.diary.volume || '',
        index: props.diary.index || '',
        focus: props.diary.focus || '',
        expectation: props.diary.expectation || '',
        marketMark: props.diary.marketMark || '',
        volumeMark: props.diary.volumeMark || '',
        indexMark: props.diary.indexMark || '',
        focusMark: props.diary.focusMark || '',
        expectationMark: props.diary.expectationMark || '',
        images: [...(props.diary.images || [])]
      })
      nextTick(() => {
        if (editorRef.value) {
          editorRef.value.innerHTML = form.content
        }
      })
    } else {
      originalDiary.value = null
      Object.assign(form, {
        title: '',
        summary: '',
        content: '',
        tags: [],
        importance: 'low',
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
      nextTick(() => {
        if (editorRef.value) {
          editorRef.value.innerHTML = ''
        }
      })
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

const execCommand = (command) => {
  document.execCommand(command, false, null)
  if (editorRef.value) {
    editorRef.value.focus()
  }
}

const handleEditorInput = () => {
  if (editorRef.value) {
    form.content = editorRef.value.innerHTML
  }
}

const handlePaste = (e) => {
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
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

const trackChanges = () => {
  if (!originalDiary.value) return []
  
  const changes = []
  const fields = [
    { key: 'title', label: '标题' },
    { key: 'summary', label: '概要' },
    { key: 'content', label: '内容' },
    { key: 'importance', label: '重要程度' },
    { key: 'color', label: '颜色' },
    { key: 'market', label: '大盘' },
    { key: 'volume', label: '量能' },
    { key: 'index', label: '指数' },
    { key: 'focus', label: '重点' },
    { key: 'expectation', label: '预期' },
    { key: 'marketMark', label: '大盘标记' },
    { key: 'volumeMark', label: '量能标记' },
    { key: 'indexMark', label: '指数标记' },
    { key: 'focusMark', label: '重点标记' },
    { key: 'expectationMark', label: '预期标记' },
    { key: 'tags', label: '标签' }
  ]
  
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
          oldValue: '(已修改)' ,
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
    alert('请输入标题')
    return
  }
  
  const data = {
    ...form,
    date: formatDate(props.day?.date || new Date())
  }
  
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
  if (confirm('确定要删除这篇日记吗？')) {
    store.deleteDiary(props.diary.id)
    emit('saved')
    handleClose()
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

.diary-modal {
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
  max-width: 900px;
  max-height: 90vh;
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

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 9px 11px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
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
}

.form-textarea.short {
  min-height: 55px;
}

.form-textarea:focus {
  border-color: #4080ff;
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

.importance-btns {
  display: flex;
  gap: 4px;
}

.imp-btn {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.imp-btn:hover {
  border-color: #4080ff;
  color: #4080ff;
}

.imp-btn.active.low {
  background: #6bcb77;
  border-color: #6bcb77;
  color: white;
}

.imp-btn.active.medium {
  background: #ffd93d;
  border-color: #ffd93d;
  color: #333;
}

.imp-btn.active.high {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
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
  background: #f8f9fa;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 14px;
}

.market-section h3 {
  font-size: 14px;
  margin: 0 0 11px 0;
  color: #333;
}

.market-item {
  flex: 1;
  min-width: 150px;
}

.market-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-label-row label {
  margin: 0;
}

.color-marks {
  display: flex;
  gap: 4px;
}

.mark-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-btn.red {
  background: #fff;
  color: #ff4444;
  border-color: #ffcccc;
}

.mark-btn.red.active {
  background: #ff4444;
  color: white;
  border-color: #ff4444;
}

.mark-btn.green {
  background: #fff;
  color: #00c853;
  border-color: #ccffcc;
}

.mark-btn.green.active {
  background: #00c853;
  color: white;
  border-color: #00c853;
}

.quick-input {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.quick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
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

.rich-editor {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.toolbar button {
  width: 30px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.toolbar button:hover {
  background: #f0f5ff;
  border-color: #4080ff;
}

.separator {
  color: #ddd;
  line-height: 28px;
}

.editor-content {
  min-height: 150px;
  padding: 12px;
  outline: none;
  font-size: 14px;
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
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.history-time {
  color: #999;
}

.history-action {
  color: #4080ff;
  font-weight: 500;
}

.history-changes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 6px;
  border-top: 1px dashed #e0e0e0;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.change-field {
  color: #666;
  min-width: 60px;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

@media (max-width: 768px) {
  .diary-modal {
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
  
  .form-row {
    gap: 10px;
    margin-bottom: 12px;
  }
  
  .form-group {
    min-width: 100%;
  }
  
  .form-group.flex-1 {
    min-width: 100%;
  }
  
  .market-section {
    padding: 12px;
  }
  
  .market-item {
    min-width: 100%;
  }
  
  .importance-btns {
    flex-wrap: wrap;
  }
  
  .modal-footer {
    padding: 12px 14px;
    gap: 8px;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
