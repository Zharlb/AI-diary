import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const loginAttempts = ref({})
  const blockedUsers = ref({})

  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  const permissions = computed(() => {
    if (!currentUser.value) return []
    return currentUser.value.permissions || []
  })

  const hasPermission = (permission) => {
    if (isAdmin.value) return true
    return permissions.value.includes(permission)
  }

  const canAccessPage = (pageName) => {
    if (isAdmin.value) return true
    const pagePermissions = {
      'dashboard': ['view_dashboard'],
      'calendar': ['view_calendar'],
      'users': ['manage_users'],
      'settings': ['manage_settings'],
      'quickOptions': ['manage_quickoptions']
    }
    const requiredPermissions = pagePermissions[pageName] || []
    return requiredPermissions.length === 0 || requiredPermissions.some(p => hasPermission(p))
  }

  const login = async (username, password) => {
    const now = Date.now()
    
    if (blockedUsers.value[username]) {
      if (blockedUsers.value[username] > now) {
        const remainingTime = Math.ceil((blockedUsers.value[username] - now) / 1000)
        return { success: false, message: '账户已被锁定，请稍后再试', blocked: true, blockTime: remainingTime }
      } else {
        delete blockedUsers.value[username]
        loginAttempts.value[username] = 0
      }
    }

    const result = await authAPI.login(username, password)
    
    if (result.success) {
      token.value = result.data.token
      currentUser.value = result.data.user
      loginAttempts.value[username] = 0
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(currentUser.value))
      return { success: true }
    } else {
      loginAttempts.value[username] = (loginAttempts.value[username] || 0) + 1
      
      if (loginAttempts.value[username] >= 3) {
        blockedUsers.value[username] = now + 5 * 60 * 1000
        return { success: false, message: '登录失败次数过多，账户已被锁定5分钟', blocked: true, blockTime: 300 }
      } else if (loginAttempts.value[username] >= 2) {
        return { success: false, message: result.message, needSlider: true }
      }
      return { success: false, message: result.message }
    }
  }

  const logout = () => {
    token.value = ''
    currentUser.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    authAPI.logout()
  }

  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Failed to parse saved user:', e)
      }
    }
  }

  const getUserList = async () => {
    if (!hasPermission('manage_users')) {
      return { success: false, message: '无权限' }
    }
    return await authAPI.getUsers()
  }

  const createUser = async (userData) => {
    if (!hasPermission('manage_users')) {
      return { success: false, message: '无权限' }
    }
    return await authAPI.createUser(userData)
  }

  const updateUser = async (userId, userData) => {
    if (!hasPermission('manage_users')) {
      return { success: false, message: '无权限' }
    }
    return await authAPI.updateUser(userId, userData)
  }

  const deleteUser = async (userId) => {
    if (!hasPermission('manage_users')) {
      return { success: false, message: '无权限' }
    }
    if (userId === currentUser.value?.id) {
      return { success: false, message: '不能删除自己的账号' }
    }
    return await authAPI.deleteUser(userId)
  }

  return {
    currentUser,
    token,
    isLoggedIn,
    isAdmin,
    permissions,
    hasPermission,
    canAccessPage,
    login,
    logout,
    initAuth,
    getUserList,
    createUser,
    updateUser,
    deleteUser
  }
})

const authAPI = {
  login: async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      return await response.json()
    } catch (error) {
      console.error('Login API error:', error)
      return { success: false, message: '网络错误' }
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout API error:', error)
    }
  },

  getUsers: async () => {
    try {
      const response = await fetch('/api/auth/users')
      return await response.json()
    } catch (error) {
      console.error('Get users API error:', error)
      return { success: false, message: '网络错误' }
    }
  },

  createUser: async (userData) => {
    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      return await response.json()
    } catch (error) {
      console.error('Create user API error:', error)
      return { success: false, message: '网络错误' }
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      return await response.json()
    } catch (error) {
      console.error('Update user API error:', error)
      return { success: false, message: '网络错误' }
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Delete user API error:', error)
      return { success: false, message: '网络错误' }
    }
  }
}