<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
      </div>

      <div class="login-form" @keydown="handleKeydown">
        <div class="form-group">
          <label for="username">账号</label>
          <input 
            id="username"
            v-model="form.username" 
            type="text" 
            placeholder="请输入账号"
            :disabled="isBlocked"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            :disabled="isBlocked"
            class="form-input"
          />
        </div>

        <div class="form-group" v-if="showSlider">
          <label>滑块验证</label>
          <div class="slider-container" @mousedown="startDrag" @touchstart="startDrag">
            <div class="slider-track">
              <div class="slider-progress" :style="{ width: sliderProgress + '%' }"></div>
            </div>
            <div 
              class="slider-handle" 
              :class="{ dragging: isDragging }"
              :style="{ left: sliderProgress + '%' }"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </div>
          </div>
          <p class="slider-hint" v-if="!sliderSuccess && sliderProgress > 0 && !isDragging">请完成滑块验证</p>
        </div>

        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>

        <div class="blocked-message" v-if="isBlocked">
          <p>账户已被锁定，请 {{ Math.ceil(remainingTime / 60) }} 分钟后再试</p>
          <p class="countdown">{{ formatTime(remainingTime) }}</p>
        </div>

        <button 
          class="login-btn" 
          @click="handleLogin"
          :disabled="isBlocked || !form.username || !form.password || (showSlider && !sliderSuccess)"
        >
          {{ isBlocked ? '已锁定' : '登 录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !isBlocked.value) {
    handleLogin()
  }
}

const showSlider = ref(false)
const isDragging = ref(false)
const sliderProgress = ref(0)
const sliderSuccess = ref(false)
const errorMessage = ref('')
const isBlocked = ref(false)
const remainingTime = ref(0)
let countdownTimer = null

const startDrag = (e) => {
  if (isBlocked.value) return
  
  isDragging.value = true
  const slider = e.currentTarget
  const trackWidth = slider.offsetWidth
  const handleWidth = slider.querySelector('.slider-handle').offsetWidth
  
  const moveHandler = (e) => {
    if (!isDragging.value) return
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const rect = slider.getBoundingClientRect()
    let x = clientX - rect.left - handleWidth / 2
    x = Math.max(0, Math.min(x, trackWidth - handleWidth))
    sliderProgress.value = (x / (trackWidth - handleWidth)) * 100
  }
  
  const endHandler = () => {
    isDragging.value = false
    if (sliderProgress.value >= 95) {
      sliderSuccess.value = true
      showSlider.value = false
    } else {
      sliderProgress.value = 0
    }
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', endHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('touchend', endHandler)
  }
  
  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', endHandler)
  document.addEventListener('touchmove', moveHandler)
  document.addEventListener('touchend', endHandler)
}

const handleLogin = async () => {
  if (!form.username || !form.password) {
    errorMessage.value = '请输入账号和密码'
    return
  }
  
  errorMessage.value = ''
  const result = await store.login(form.username, form.password)
  
  if (result.success) {
    await router.push('/')
  } else {
    errorMessage.value = result.message
    if (result.needSlider) {
      showSlider.value = true
      sliderSuccess.value = false
      sliderProgress.value = 0
    }
    if (result.blocked) {
      isBlocked.value = true
      remainingTime.value = result.blockTime || 300
      startCountdown()
    }
  }
}

const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      isBlocked.value = false
      clearInterval(countdownTimer)
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 40px 20px 20px;
  background: linear-gradient(135deg, #4080ff 0%, #6a9dff 100%);
}

.logo-icon {
  color: white;
  display: inline-flex;
  padding: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

.login-form {
  padding: 30px 24px;
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

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #4080ff;
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 128, 255, 0.1);
}

.form-input::placeholder {
  color: #aaa;
}

.form-input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.slider-container {
  position: relative;
  height: 44px;
  background: #f0f0f0;
  border-radius: 22px;
  cursor: pointer;
  overflow: hidden;
}

.slider-track {
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  height: 32px;
  background: #e0e0e0;
  border-radius: 16px;
}

.slider-progress {
  height: 100%;
  background: linear-gradient(90deg, #4080ff, #6a9dff);
  border-radius: 16px;
  transition: width 0.1s ease;
}

.slider-handle {
  position: absolute;
  top: 4px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transform: translateX(-50%);
  transition: box-shadow 0.2s;
  color: #4080ff;
}

.slider-handle.dragging {
  box-shadow: 0 4px 16px rgba(64, 128, 255, 0.4);
}

.slider-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: #ff6b6b;
}

.error-message {
  padding: 12px 16px;
  background: #ffebee;
  border-radius: 8px;
  color: #c62828;
  font-size: 13px;
  margin-bottom: 16px;
}

.blocked-message {
  padding: 18px;
  background: #fff3e0;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 16px;
}

.blocked-message p {
  margin: 0 0 10px;
  color: #e65100;
  font-size: 14px;
}

.blocked-message .countdown {
  font-size: 28px;
  font-weight: 600;
  color: #e65100;
  margin-bottom: 0 !important;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4080ff 0%, #6a9dff 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 128, 255, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .login-container {
    border-radius: 16px;
  }

  .login-header {
    padding: 30px 16px 15px;
  }

  .logo-icon {
    padding: 12px;
  }

  .logo-icon svg {
    width: 40px;
    height: 40px;
  }

  .login-form {
    padding: 20px 16px;
  }

  .form-input {
    padding: 10px 12px;
  }
}
</style>