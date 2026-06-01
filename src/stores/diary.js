import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { diaryAPI, quickOptionsAPI } from '@/api'

export const useDiaryStore = defineStore('diary', () => {
  const diaries = ref([])
  const viewMode = ref('week')
  const quickOptions = ref({})
  const categoryLabels = ref({})
  const currentDate = ref(new Date())
  const isLoading = ref(false)
  const error = ref(null)

  const getDiariesByDate = (date) => {
    const dateStr = formatDate(date)
    return diaries.value.filter(d => d.date === dateStr)
  }

  const fetchDiaries = async () => {
    isLoading.value = true
    error.value = null
    try {
      const result = await diaryAPI.getAll()
      diaries.value = result.data || []
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch diaries:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchQuickOptions = async () => {
    try {
      const result = await quickOptionsAPI.get()
      if (result.data) {
        const categories = result.data.categories || []
        const labels = result.data.labels || {}
        
        quickOptions.value = {}
        categoryLabels.value = labels
        
        categories.forEach(cat => {
          quickOptions.value[cat.id] = []
        })
      }
    } catch (err) {
      console.error('Failed to fetch quick options:', err)
    }
  }

  const addDiary = async (diary) => {
    try {
      const result = await diaryAPI.create(diary)
      if (result.success) {
        diaries.value.push(result.data)
        return result.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to add diary:', err)
    }
    return null
  }

  const updateDiary = async (id, updates, changes = null) => {
    try {
      const existingIndex = diaries.value.findIndex(d => d.id === id)
      const existingDiary = existingIndex !== -1 ? diaries.value[existingIndex] : null
      
      const diaryData = {
        ...updates
      }
      
      if (changes && changes.length > 0) {
        const historyEntry = {
          time: new Date().toISOString(),
          action: '修改',
          changes: changes
        }
        diaryData.history = [
          ...(existingDiary?.history || []),
          historyEntry
        ]
      }
      
      const result = await diaryAPI.update(id, diaryData)
      if (result.success) {
        if (existingIndex !== -1) {
          diaries.value[existingIndex] = result.data
        } else {
          diaries.value.push(result.data)
        }
        return result.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to update diary:', err)
    }
    return null
  }

  const deleteDiary = async (id) => {
    try {
      const result = await diaryAPI.delete(id)
      if (result.success) {
        const index = diaries.value.findIndex(d => d.id === id)
        if (index !== -1) {
          diaries.value.splice(index, 1)
        }
        return true
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete diary:', err)
    }
    return false
  }

  const setViewMode = (mode) => {
    viewMode.value = mode
    localStorage.setItem('calendar_view_mode', mode)
  }

  const addQuickOption = async (categoryId, option) => {
    if (!quickOptions.value[categoryId]) {
      quickOptions.value[categoryId] = []
    }
    if (!quickOptions.value[categoryId].includes(option)) {
      quickOptions.value[categoryId].push(option)
    }
  }

  const removeQuickOption = async (categoryId, option) => {
    if (quickOptions.value[categoryId]) {
      const index = quickOptions.value[categoryId].indexOf(option)
      if (index !== -1) {
        quickOptions.value[categoryId].splice(index, 1)
      }
    }
  }

  const addQuickCategory = async (categoryName, categoryLabel = null) => {
    try {
      const result = await quickOptionsAPI.addCategory({ 
        name: categoryName,
        label: categoryLabel
      })
      if (result.success) {
        const newCategory = result.data
        quickOptions.value[newCategory.id] = []
        if (categoryLabel) {
          categoryLabels.value[categoryLabel] = categoryName
        }
        return newCategory
      }
    } catch (err) {
      console.error('Failed to add category:', err)
    }
    return null
  }

  const updateQuickCategory = async (categoryId, categoryName, categoryLabel = null) => {
    try {
      const result = await quickOptionsAPI.updateCategory(categoryId, {
        name: categoryName,
        label: categoryLabel
      })
      if (result.success) {
        const categories = Object.keys(quickOptions.value)
        const oldCategory = categories.find(k => k === categoryId)
        
        if (oldCategory && oldCategory !== categoryId) {
          quickOptions.value[categoryId] = quickOptions.value[oldCategory] || []
          delete quickOptions.value[oldCategory]
        }
        
        if (categoryLabel) {
          categoryLabels.value[categoryLabel] = categoryName
        }
        return result.data
      }
    } catch (err) {
      console.error('Failed to update category:', err)
    }
    return null
  }

  const removeQuickCategory = async (categoryId) => {
    try {
      const result = await quickOptionsAPI.deleteCategory(categoryId)
      if (result.success) {
        const labels = Object.keys(categoryLabels.value)
        labels.forEach(label => {
          const category = Object.keys(quickOptions.value).find(k => k === categoryId)
          if (category) {
            const oldLabel = Object.keys(categoryLabels.value).find(
              l => categoryLabels.value[l] === categoryId
            )
            if (oldLabel) {
              delete categoryLabels.value[oldLabel]
            }
          }
        })
        delete quickOptions.value[categoryId]
        return true
      }
    } catch (err) {
      console.error('Failed to remove category:', err)
    }
    return false
  }

  const setCurrentDate = (date) => {
    const newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0)
    currentDate.value = newDate
  }

  const initStore = async () => {
    await Promise.all([
      fetchDiaries(),
      fetchQuickOptions()
    ])
    
    const savedViewMode = localStorage.getItem('calendar_view_mode')
    if (savedViewMode) {
      viewMode.value = savedViewMode
    }
  }

  return {
    diaries,
    viewMode,
    quickOptions,
    categoryLabels,
    currentDate,
    isLoading,
    error,
    getDiariesByDate,
    fetchDiaries,
    fetchQuickOptions,
    addDiary,
    updateDiary,
    deleteDiary,
    setViewMode,
    addQuickOption,
    removeQuickOption,
    addQuickCategory,
    updateQuickCategory,
    removeQuickCategory,
    setCurrentDate,
    initStore
  }
})

export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateDisplay(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[d.getDay()]
  return `${year}年${month}月${day}日 周${weekDay}`
}
