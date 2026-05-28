<template>
  <div class="diary-modal" v-if="visible" @click.self="handleClose">
    <div class="modal-content">
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
            <select v-model="form.importance" class="form-select">
              <option value="low">普通</option>
              <option value="medium">重要</option>
              <option value="high">非常重要</option>
            </select>
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
            <div class="form-group">
              <label>大盘</label>
              <div class="quick-input">
                <input v-model="form.market" type="text" class="form-input" />
                <div class="quick-options">
                  <button 
                    v-for="opt in quickOptions.market" 
                    :key="opt"
                    class="quick-btn"
                    @click="form.market = opt"
                  >{{ opt }}</button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>量能</label>
              <div class="quick-input">
                <input v-model="form.volume" type="text" class="form-input" />
                <div class="quick-options">
                  <button 
                    v-for="opt in quickOptions.volume" 
                    :key="opt"
                    class="quick-btn"
                    @click="form.volume = opt"
                  >{{ opt }}</button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>指数</label>
              <div class="quick-input">
                <input v-model="form.index" type="text" class="form-input" />
                <div class="quick-options">
                  <button 
                    v-for="opt in quickOptions.index" 
                    :key="opt"
                    class="quick-btn"
                    @click="form.index = opt"
                  >{{ opt }}</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>重点</label>
              <div class="quick-input">
                <input v-model="form.focus" type="text" class="form-input" />
                <div class="quick-options">
                  <button 
                    v-for="opt in quickOptions.focus" 
                    :key="opt"
                    class="quick-btn"
                    @click="form.focus = opt"
                  >{{ opt }}</button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>预期</label>
              <div class="quick-input">
                <input v-model="form.expectation" type="text" class="form-input" />
                <div class="quick-options">
                  <button 
                    v-for="opt in quickOptions.expectation" 
                    :key="opt"
                    class="quick-btn"
                    @click="form.expectation = opt"
                  >{{ opt }}</button>
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
            <textarea 
              v-model="form.content" 
              placeholder="输入日记内容..." 
              class="form-textarea"
              :class="{ hidden: editorMode === 'preview' }"
            ></textarea>
            <div 
              v-if="editorMode === 'preview'" 
              class="preview-content"
              v-html="renderPreview()"
            ></div>
          </div>
        </div>
        
        <div v-if="diary && diary.history" class="history-section">
          <h3>修改记录</h3>
          <div class="history-list">
            <div v-for="(item, index) in diary.history" :key="index" class="history-item">
              <span class="history-time">{{ formatTime(item.time) }}</span>
              <span class="history-action">{{ item.action }}</span>
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
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
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
  expectation: ''
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

watch(() => props.visible, (val) => {
  if (val) {
    if (props.diary) {
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
        expectation: props.diary.expectation || ''
      })
    } else {
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
        expectation: ''
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

const renderPreview = () => {
  let html = form.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  return html
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
    store.updateDiary(props.diary.id, data)
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
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

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.flex-1 {
  flex: 1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #4080ff;
}

.form-select {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  border-color: #4080ff;
}

.form-textarea {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}

.form-textarea.short {
  min-height: 60px;
}

.form-textarea:focus {
  border-color: #4080ff;
}

.form-textarea.hidden {
  display: none;
}

.color-picker {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 28px;
  height: 28px;
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
  gap: 8px;
  align-items: center;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #e8f4fd;
  color: #4080ff;
  border-radius: 16px;
  font-size: 13px;
}

.tag-remove {
  width: 18px;
  height: 18px;
  border: none;
  background: rgba(64, 128, 255, 0.2);
  border-radius: 50%;
  color: #4080ff;
  font-size: 14px;
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
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  width: 120px;
}

.tag-add-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #4080ff;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-left: 4px;
}

.market-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.market-section h3 {
  font-size: 15px;
  margin: 0 0 12px 0;
  color: #333;
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
  padding: 4px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #f0f5ff;
  border-color: #4080ff;
  color: #4080ff;
}

.editor-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #f5f7fa;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #4080ff;
  color: white;
}

.preview-content {
  min-height: 100px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.history-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.history-section h3 {
  font-size: 15px;
  margin: 0 0 12px 0;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.history-time {
  color: #999;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
</style>