<template>
  <transition name="modal-fade">
    <div v-if="visible" class="confirm-modal" @click.self="handleCancel">
      <transition name="modal-scale">
        <div v-if="visible" class="modal-content">
          <div class="modal-icon" :class="type">
            <svg v-if="type === 'success'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else-if="type === 'warning'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4M12 17h.01"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <svg v-else-if="type === 'error'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01"/>
            </svg>
          </div>
          <div class="modal-title">{{ title }}</div>
          <div class="modal-message">{{ message }}</div>
          <div class="modal-actions">
            <button v-if="showCancel" class="btn btn-secondary" @click="handleCancel">{{ cancelText }}</button>
            <button class="btn btn-primary" @click="handleConfirm">{{ confirmText }}</button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (val) => ['success', 'warning', 'error', 'info'].includes(val)
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon.success {
  background: #e8f5e9;
  color: #4caf50;
}

.modal-icon.warning {
  background: #fff3e0;
  color: #ff9800;
}

.modal-icon.error {
  background: #ffebee;
  color: #f44336;
}

.modal-icon.info {
  background: #e3f2fd;
  color: #2196f3;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.modal-message {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 90px;
}

.btn-primary {
  background: #4080ff;
  color: white;
}

.btn-primary:hover {
  background: #3070ef;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 24px 20px;
  }
  
  .btn {
    padding: 9px 18px;
    font-size: 13px;
    min-width: 80px;
  }
}
</style>
