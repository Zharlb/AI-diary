<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <button class="add-btn" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14"/>
          <path d="M5 12h14"/>
        </svg>
        新增用户
      </button>
    </div>

    <div class="user-list">
      <div class="list-header">
        <div class="col-username">账号</div>
        <div class="col-name">姓名</div>
        <div class="col-role">角色</div>
        <div class="col-status">状态</div>
        <div class="col-actions">操作</div>
      </div>
      
      <div class="list-body">
        <div 
          v-for="user in userList" 
          :key="user.id" 
          class="list-item"
        >
          <div class="col-username">{{ user.username }}</div>
          <div class="col-name">{{ user.name }}</div>
          <div class="col-role">
            <span :class="['role-tag', user.role]">{{ getRoleName(user.role) }}</span>
          </div>
          <div class="col-status">
            <span :class="['status-tag', user.status]">{{ user.status === 'active' ? '启用' : '禁用' }}</span>
          </div>
          <div class="col-actions">
            <button class="action-btn edit" @click="openEditModal(user)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </button>
            <button 
              class="action-btn delete" 
              @click="handleDelete(user)"
              :disabled="user.id === currentUserId"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="empty-state" v-if="userList.length === 0">
          <p>暂无用户数据</p>
        </div>
      </div>
    </div>

    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
        <transition name="modal-scale">
          <div class="modal-content" v-if="showModal">
            <div class="modal-header">
              <h3>{{ isEdit ? '编辑用户' : '新增用户' }}</h3>
              <button class="close-btn" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18"/>
                  <path d="M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>账号 <span class="required">*</span></label>
                <input 
                  v-model="form.username" 
                  type="text" 
                  placeholder="请输入账号"
                  :disabled="isEdit"
                  :class="['form-input', { error: errors.username }]"
                />
                <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
              </div>
              
              <div class="form-group">
                <label>姓名 <span class="required">*</span></label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  placeholder="请输入姓名"
                  :class="['form-input', { error: errors.name }]"
                />
                <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
              </div>
              
              <div class="form-group" v-if="!isEdit">
                <label>密码 <span class="required">*</span></label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="请输入密码"
                  :class="['form-input', { error: errors.password }]"
                />
                <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
              </div>
              
              <div class="form-group">
                <label>角色 <span class="required">*</span></label>
                <div class="radio-group">
                  <label 
                    :class="['radio-label', { active: form.role === 'user' }]"
                    @click="form.role = 'user'"
                  >
                    <input type="radio" v-model="form.role" value="user" />
                    <span>普通用户</span>
                  </label>
                  <label 
                    :class="['radio-label', { active: form.role === 'admin' }]"
                    @click="form.role = 'admin'"
                  >
                    <input type="radio" v-model="form.role" value="admin" />
                    <span>管理员</span>
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label>状态 <span class="required">*</span></label>
                <div class="radio-group">
                  <label 
                    :class="['radio-label', 'active-green', { active: form.status === 'active' }]"
                    @click="form.status = 'active'"
                  >
                    <input type="radio" v-model="form.status" value="active" />
                    <span>启用</span>
                  </label>
                  <label 
                    :class="['radio-label', 'active-gray', { active: form.status === 'disabled' }]"
                    @click="form.status = 'disabled'"
                  >
                    <input type="radio" v-model="form.status" value="disabled" />
                    <span>禁用</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn btn-cancel" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="handleSave">保存</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const store = useAuthStore()
const userList = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const editingUser = ref(null)
const showConfirm = ref(false)
const deleteTarget = ref(null)

const form = reactive({
  username: '',
  name: '',
  password: '',
  role: 'user',
  status: 'active'
})

const errors = reactive({
  username: '',
  name: '',
  password: ''
})

const currentUserId = ref('')

const getRoleName = (role) => {
  return role === 'admin' ? '管理员' : '普通用户'
}

const validateForm = () => {
  let isValid = true
  errors.username = ''
  errors.name = ''
  errors.password = ''
  
  if (!form.username.trim()) {
    errors.username = '请输入账号'
    isValid = false
  }
  
  if (!form.name.trim()) {
    errors.name = '请输入姓名'
    isValid = false
  }
  
  if (!isEdit.value && !form.password.trim()) {
    errors.password = '请输入密码'
    isValid = false
  }
  
  return isValid
}

const loadUsers = async () => {
  const result = await store.getUserList()
  if (result.success) {
    userList.value = result.data
  }
}

const openAddModal = () => {
  isEdit.value = false
  editingUser.value = null
  form.username = ''
  form.name = ''
  form.password = ''
  form.role = 'user'
  form.status = 'active'
  errors.username = ''
  errors.name = ''
  errors.password = ''
  showModal.value = true
}

const openEditModal = (user) => {
  isEdit.value = true
  editingUser.value = user
  form.username = user.username
  form.name = user.name
  form.password = ''
  form.role = user.role
  form.status = user.status
  errors.username = ''
  errors.name = ''
  errors.password = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  const userData = {
    username: form.username,
    name: form.name,
    role: form.role,
    status: form.status
  }
  
  if (!isEdit.value) {
    userData.password = form.password
  }

  let result
  if (isEdit.value) {
    result = await store.updateUser(editingUser.value.id, userData)
  } else {
    result = await store.createUser(userData)
  }

  if (result.success) {
    closeModal()
    loadUsers()
  } else {
    alert(result.message)
  }
}

const handleDelete = (user) => {
  if (user.id === currentUserId.value) {
    alert('不能删除自己的账号')
    return
  }
  deleteTarget.value = user
  showConfirm.value = true
}

const confirmDelete = async () => {
  if (deleteTarget.value) {
    const result = await store.deleteUser(deleteTarget.value.id)
    if (result.success) {
      loadUsers()
    } else {
      alert(result.message)
    }
  }
  showConfirm.value = false
}

onMounted(async () => {
  if (store.currentUser) {
    currentUserId.value = store.currentUser.id
  }
  await loadUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #4080ff 0%, #6a9dff 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 128, 255, 0.3);
}

.user-list {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.list-header {
  display: flex;
  background: #f5f7fa;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 13px;
  color: #666;
}

.list-item {
  display: flex;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.list-item:hover {
  background: #fafafa;
}

.list-item:last-child {
  border-bottom: none;
}

.col-username, .col-name, .col-role, .col-status, .col-actions {
  flex: 1;
  display: flex;
  align-items: center;
}

.col-username { flex: 1.2; }
.col-name { flex: 1; }
.col-role { flex: 1; }
.col-status { flex: 1; }
.col-actions { 
  flex: 0.8; 
  justify-content: flex-end;
  gap: 8px;
}

.role-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.role-tag.admin {
  background: #ffebee;
  color: #c62828;
}

.role-tag.user {
  background: #e3f2fd;
  color: #1565c0;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-tag.disabled {
  background: #f5f5f5;
  color: #9e9e9e;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1565c0;
}

.action-btn.edit:hover {
  background: #bbdefb;
}

.action-btn.delete {
  background: #ffebee;
  color: #c62828;
}

.action-btn.delete:hover:not(:disabled) {
  background: #ffcdd2;
}

.action-btn.delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}

.modal-overlay {
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
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
}

.modal-body {
  padding: 22px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ff6b6b;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.2s;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #4080ff;
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 128, 255, 0.1);
}

.form-input.error {
  border-color: #ff6b6b;
}

.form-input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.error-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #ff6b6b;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #666;
}

.radio-label input {
  display: none;
}

.radio-label:hover {
  border-color: #4080ff;
}

.radio-label.active {
  border-color: #4080ff;
  background: #e3f2fd;
  color: #4080ff;
}

.radio-label.active-green {
  border-color: #2e7d32;
  background: #e8f5e9;
  color: #2e7d32;
}

.radio-label.active-gray {
  border-color: #9e9e9e;
  background: #f5f5f5;
  color: #9e9e9e;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 22px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(135deg, #4080ff 0%, #6a9dff 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 128, 255, 0.3);
}

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
  transition: all 0.3s ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

@media (max-width: 768px) {
  .user-management {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .list-header {
    display: none;
  }

  .list-item {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }

  .list-item > div {
    flex: 0 0 calc(50% - 4px);
  }

  .col-actions {
    flex: 100%;
    justify-content: flex-start;
  }

  .modal-content {
    margin: 12px;
    border-radius: 12px;
  }

  .radio-group {
    flex-direction: column;
  }
}
</style>