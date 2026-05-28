import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'calendar_diary_data'
const VIEW_STORAGE_KEY = 'calendar_view_mode'
const QUICK_OPTIONS_KEY = 'calendar_quick_options'

function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

export const useDiaryStore = defineStore('diary', () => {
  const diaries = ref(loadFromStorage(STORAGE_KEY, []))
  const viewMode = ref(loadFromStorage(VIEW_STORAGE_KEY, 'week'))
  const quickOptions = ref(loadFromStorage(QUICK_OPTIONS_KEY, {
    market: ['高开低走', '低开高走', '震荡上行', '震荡下行', '单边上涨', '单边下跌'],
    volume: ['放量', '缩量', '平量'],
    index: ['上证50', '沪深300', '创业板指', '科创板'],
    focus: ['政策面', '资金面', '技术面', '消息面'],
    expectation: ['看多', '看空', '观望']
  }))

  const currentDate = ref(new Date())

  const getDiariesByDate = (date) => {
    const dateStr = formatDate(date)
    return diaries.value.filter(d => d.date === dateStr)
  }

  const addDiary = (diary) => {
    const newDiary = {
      id: Date.now(),
      ...diary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        time: new Date().toISOString(),
        action: '创建'
      }]
    }
    diaries.value.push(newDiary)
    saveToStorage(STORAGE_KEY, diaries.value)
    return newDiary
  }

  const updateDiary = (id, updates) => {
    const index = diaries.value.findIndex(d => d.id === id)
    if (index !== -1) {
      diaries.value[index] = {
        ...diaries.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        history: [
          ...diaries.value[index].history,
          {
            time: new Date().toISOString(),
            action: '修改'
          }
        ]
      }
      saveToStorage(STORAGE_KEY, diaries.value)
      return diaries.value[index]
    }
    return null
  }

  const deleteDiary = (id) => {
    const index = diaries.value.findIndex(d => d.id === id)
    if (index !== -1) {
      const deleted = diaries.value.splice(index, 1)[0]
      saveToStorage(STORAGE_KEY, diaries.value)
      return deleted
    }
    return null
  }

  const setViewMode = (mode) => {
    viewMode.value = mode
    saveToStorage(VIEW_STORAGE_KEY, mode)
  }

  const addQuickOption = (category, option) => {
    if (!quickOptions.value[category]) {
      quickOptions.value[category] = []
    }
    if (!quickOptions.value[category].includes(option)) {
      quickOptions.value[category].push(option)
      saveToStorage(QUICK_OPTIONS_KEY, quickOptions.value)
    }
  }

  const removeQuickOption = (category, option) => {
    if (quickOptions.value[category]) {
      const index = quickOptions.value[category].indexOf(option)
      if (index !== -1) {
        quickOptions.value[category].splice(index, 1)
        saveToStorage(QUICK_OPTIONS_KEY, quickOptions.value)
      }
    }
  }

  const setCurrentDate = (date) => {
    currentDate.value = new Date(date)
  }

  return {
    diaries,
    viewMode,
    quickOptions,
    currentDate,
    getDiariesByDate,
    addDiary,
    updateDiary,
    deleteDiary,
    setViewMode,
    addQuickOption,
    removeQuickOption,
    setCurrentDate
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