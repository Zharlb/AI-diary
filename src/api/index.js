const API_BASE_URL = '';

const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// 日记接口
export const diaryAPI = {
  getAll: () => request('/api/diaries'),
  getById: (id) => request(`/api/diaries/${id}`),
  create: (data) => request('/api/diaries', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/diaries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/diaries/${id}`, { method: 'DELETE' }),
};

// 快捷选项接口
export const quickOptionsAPI = {
  get: () => request('/api/quick-options'),
  
  // 分组相关接口
  addGroup: (data) => request('/api/quick-options/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateGroup: (id, data) => request(`/api/quick-options/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGroup: (id) => request(`/api/quick-options/groups/${id}`, { method: 'DELETE' }),
  
  // 分组内的类别接口
  addCategoryToGroup: (groupId, data) => request(`/api/quick-options/groups/${groupId}/categories`, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  updateCategoryInGroup: (groupId, categoryId, data) => request(`/api/quick-options/groups/${groupId}/categories/${categoryId}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  deleteCategoryFromGroup: (groupId, categoryId) => request(`/api/quick-options/groups/${groupId}/categories/${categoryId}`, { 
    method: 'DELETE' 
  }),
  
  // 旧接口 - 保持向后兼容
  addCategory: (data) => request('/api/quick-options/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/api/quick-options/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/api/quick-options/categories/${id}`, { method: 'DELETE' }),
  updateLabels: (data) => request('/api/quick-options/labels', { method: 'PUT', body: JSON.stringify(data) }),
  addOption: (categoryId, option) => request(`/api/quick-options/categories/${categoryId}/options`, { 
    method: 'POST', 
    body: JSON.stringify({ option }) 
  }),
  removeOption: (categoryId, option) => request(`/api/quick-options/categories/${categoryId}/options/${encodeURIComponent(option)}`, { 
    method: 'DELETE' 
  }),
};
