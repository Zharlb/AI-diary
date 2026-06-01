import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { diaryAPI, quickOptionsAPI } from '@/api'

export const useDiaryStore = defineStore('diary', () => {
  const diaries = ref([])
  const viewMode = ref('week')
  const quickOptions = ref({}) // 保持向后兼容
  const quickOptionsGroups = ref([]) // 新的分组数据结构
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
        // 处理分组结构
        if (result.data.groups) {
          quickOptionsGroups.value = result.data.groups
          
          // 同时更新向后兼容的数据结构
          quickOptions.value = {}
          categoryLabels.value = {}
          
          result.data.groups.forEach(group => {
            group.categories.forEach(cat => {
              quickOptions.value[cat.id] = cat.options || []
              categoryLabels.value[cat.id] = cat.name
            })
          })
        } else {
          // 向后兼容旧数据结构
          const categories = result.data.categories || []
          const labels = result.data.labels || {}
          
          quickOptions.value = {}
          categoryLabels.value = { ...labels }
          
          categories.forEach(cat => {
            quickOptions.value[cat.id] = cat.options || []
            if (cat.name) {
              categoryLabels.value[cat.id] = cat.name
            }
          })
          
          // 自动迁移旧数据到分组结构
          if (categories.length > 0) {
            quickOptionsGroups.value = [{
              id: 'default-group',
              name: '默认分组',
              categories: categories,
              createdAt: new Date().toISOString()
            }]
          }
        }
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

  const addQuickOptionsGroup = async (groupName) => {
    try {
      const result = await quickOptionsAPI.addGroup({ name: groupName })
      if (result.success) {
        quickOptionsGroups.value.push(result.data)
        return result.data
      }
    } catch (err) {
      console.error('Failed to add group:', err)
    }
    return null
  }

  const removeQuickOptionsGroup = async (groupId) => {
    try {
      const result = await quickOptionsAPI.deleteGroup(groupId)
      if (result.success) {
        // 移除分组，同时清理对应的 quickOptions 和 categoryLabels
        const group = quickOptionsGroups.value.find(g => g.id === groupId)
        if (group) {
          group.categories.forEach(cat => {
            delete quickOptions.value[cat.id]
            delete categoryLabels.value[cat.id]
          })
        }
        quickOptionsGroups.value = quickOptionsGroups.value.filter(g => g.id !== groupId)
        return true
      }
    } catch (err) {
      console.error('Failed to remove group:', err)
    }
    return false
  }

  const addQuickCategoryToGroup = async (groupId, categoryName) => {
    try {
      const result = await quickOptionsAPI.addCategoryToGroup(groupId, { name: categoryName })
      if (result.success) {
        const group = quickOptionsGroups.value.find(g => g.id === groupId)
        if (group) {
          group.categories.push(result.data)
          quickOptions.value[result.data.id] = []
          categoryLabels.value[result.data.id] = categoryName
        }
        return result.data
      }
    } catch (err) {
      console.error('Failed to add category to group:', err)
    }
    return null
  }

  const removeQuickCategoryFromGroup = async (groupId, categoryId) => {
    try {
      const result = await quickOptionsAPI.deleteCategoryFromGroup(groupId, categoryId)
      if (result.success) {
        const group = quickOptionsGroups.value.find(g => g.id === groupId)
        if (group) {
          group.categories = group.categories.filter(c => c.id !== categoryId)
          delete quickOptions.value[categoryId]
          delete categoryLabels.value[categoryId]
        }
        return true
      }
    } catch (err) {
      console.error('Failed to remove category from group:', err)
    }
    return false
  }

  const addQuickOption = async (categoryId, option) => {
    try {
      const result = await quickOptionsAPI.addOption(categoryId, option)
      if (result.success) {
        if (!quickOptions.value[categoryId]) {
          quickOptions.value[categoryId] = []
        }
        if (!quickOptions.value[categoryId].includes(option)) {
          quickOptions.value[categoryId].push(option)
        }
        // 同时更新分组数据结构
        for (const group of quickOptionsGroups.value) {
          const category = group.categories.find(c => c.id === categoryId)
          if (category) {
            if (!category.options) {
              category.options = []
            }
            if (!category.options.includes(option)) {
              category.options.push(option)
            }
            break
          }
        }
      }
    } catch (err) {
      console.error('Failed to add quick option:', err)
    }
  }

  const removeQuickOption = async (categoryId, option) => {
    try {
      const result = await quickOptionsAPI.removeOption(categoryId, option)
      if (result.success) {
        if (quickOptions.value[categoryId]) {
          const index = quickOptions.value[categoryId].indexOf(option)
          if (index !== -1) {
            quickOptions.value[categoryId].splice(index, 1)
          }
        }
        // 同时更新分组数据结构
        for (const group of quickOptionsGroups.value) {
          const category = group.categories.find(c => c.id === categoryId)
          if (category && category.options) {
            const optIndex = category.options.indexOf(option)
            if (optIndex !== -1) {
              category.options.splice(optIndex, 1)
            }
            break
          }
        }
      }
    } catch (err) {
      console.error('Failed to remove quick option:', err)
    }
  }

  // 保持向后兼容的方法
  const addQuickCategory = async (categoryName, categoryLabel = null) => {
    try {
      // 默认添加到第一个分组或创建默认分组
      let defaultGroup = quickOptionsGroups.value[0]
      if (!defaultGroup) {
        defaultGroup = await addQuickOptionsGroup('默认分组')
      }
      if (defaultGroup) {
        return await addQuickCategoryToGroup(defaultGroup.id, categoryName)
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
        if (categoryLabel) {
          categoryLabels.value[categoryLabel] = categoryName
        }
        // 更新分组数据结构中的类别
        for (const group of quickOptionsGroups.value) {
          const category = group.categories.find(c => c.id === categoryId)
          if (category) {
            category.name = categoryName
            categoryLabels.value[categoryId] = categoryName
            break
          }
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
      // 查找类别所属的分组
      let groupId = null
      for (const group of quickOptionsGroups.value) {
        if (group.categories.find(c => c.id === categoryId)) {
          groupId = group.id
          break
        }
      }
      if (groupId) {
        return await removeQuickCategoryFromGroup(groupId, categoryId)
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
    quickOptionsGroups,
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
    addQuickOptionsGroup,
    removeQuickOptionsGroup,
    addQuickCategoryToGroup,
    removeQuickCategoryFromGroup,
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
