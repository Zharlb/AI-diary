import Router from 'koa-router';
import { readData, writeData, generateId } from '../utils/fileHelper.js';

const router = new Router();
const OPTIONS_FILE = 'quickOptions.json';

// 获取快捷选项
router.get('/api/quick-options', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  ctx.body = { success: true, data: options };
});

// ==================== 分组相关接口 ====================

// 添加分组
router.post('/api/quick-options/groups', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  if (!options.groups) {
    options.groups = [];
  }
  
  const newGroup = {
    id: generateId(),
    name: body.name,
    categories: [],
    createdAt: new Date().toISOString()
  };
  
  options.groups.push(newGroup);
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: newGroup };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to save group' };
  }
});

// 更新分组
router.put('/api/quick-options/groups/:id', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  const index = options.groups.findIndex(g => g.id === ctx.params.id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Group not found' };
    return;
  }
  
  options.groups[index] = {
    ...options.groups[index],
    name: body.name,
    updatedAt: new Date().toISOString()
  };
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: options.groups[index] };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update group' };
  }
});

// 删除分组
router.delete('/api/quick-options/groups/:id', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  options.groups = options.groups.filter(g => g.id !== ctx.params.id);
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete group' };
  }
});

// ==================== 分组内的类别相关接口 ====================

// 在分组中添加类别
router.post('/api/quick-options/groups/:groupId/categories', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  const groupIndex = options.groups.findIndex(g => g.id === ctx.params.groupId);
  
  if (groupIndex === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Group not found' };
    return;
  }
  
  const newCategory = {
    id: generateId(),
    name: body.name,
    options: [],
    createdAt: new Date().toISOString()
  };
  
  options.groups[groupIndex].categories.push(newCategory);
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: newCategory };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to save category' };
  }
});

// 更新分组内的类别
router.put('/api/quick-options/groups/:groupId/categories/:categoryId', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  const groupIndex = options.groups.findIndex(g => g.id === ctx.params.groupId);
  
  if (groupIndex === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Group not found' };
    return;
  }
  
  const categoryIndex = options.groups[groupIndex].categories.findIndex(
    c => c.id === ctx.params.categoryId
  );
  
  if (categoryIndex === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Category not found' };
    return;
  }
  
  options.groups[groupIndex].categories[categoryIndex] = {
    ...options.groups[groupIndex].categories[categoryIndex],
    name: body.name,
    updatedAt: new Date().toISOString()
  };
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: options.groups[groupIndex].categories[categoryIndex] };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update category' };
  }
});

// 删除分组内的类别
router.delete('/api/quick-options/groups/:groupId/categories/:categoryId', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  const groupIndex = options.groups.findIndex(g => g.id === ctx.params.groupId);
  
  if (groupIndex === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Group not found' };
    return;
  }
  
  options.groups[groupIndex].categories = options.groups[groupIndex].categories.filter(
    c => c.id !== ctx.params.categoryId
  );
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete category' };
  }
});

// ==================== 旧接口 - 保持向后兼容 ====================

// 添加快捷选项类别（旧接口）
router.post('/api/quick-options/categories', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  // 如果有分组结构，添加到第一个分组或创建默认分组
  if (options.groups && options.groups.length > 0) {
    const newCategory = {
      id: generateId(),
      name: body.name,
      options: [],
      createdAt: new Date().toISOString()
    };
    
    options.groups[0].categories.push(newCategory);
    
    if (writeData(OPTIONS_FILE, options)) {
      ctx.body = { success: true, data: newCategory };
    } else {
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to save category' };
    }
  } else {
    // 旧逻辑
    const newCategory = {
      id: generateId(),
      name: body.name,
      options: [],
      createdAt: new Date().toISOString()
    };
    
    options.categories.push(newCategory);
    
    if (body.label) {
      options.labels[body.label] = body.name;
    }
    
    if (writeData(OPTIONS_FILE, options)) {
      ctx.body = { success: true, data: newCategory };
    } else {
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to save category' };
    }
  }
});

// 更新快捷选项类别（旧接口）
router.put('/api/quick-options/categories/:id', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  // 先尝试在分组中查找
  let found = false;
  if (options.groups) {
    for (const group of options.groups) {
      const index = group.categories.findIndex(c => c.id === ctx.params.id);
      if (index !== -1) {
        group.categories[index] = {
          ...group.categories[index],
          name: body.name,
          updatedAt: new Date().toISOString()
        };
        found = true;
        break;
      }
    }
  }
  
  // 如果在分组中没找到，尝试旧结构
  if (!found) {
    const index = options.categories.findIndex(c => c.id === ctx.params.id);
    if (index === -1) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'Category not found' };
      return;
    }
    
    options.categories[index] = {
      ...options.categories[index],
      name: body.name,
      updatedAt: new Date().toISOString()
    };
    
    if (body.label) {
      options.labels[body.label] = body.name;
    }
  }
  
  if (writeData(OPTIONS_FILE, options)) {
    // 尝试返回找到的类别
    let category = null;
    if (options.groups) {
      for (const group of options.groups) {
        category = group.categories.find(c => c.id === ctx.params.id);
        if (category) break;
      }
    }
    if (!category) {
      category = options.categories.find(c => c.id === ctx.params.id);
    }
    ctx.body = { success: true, data: category };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update category' };
  }
});

// 删除快捷选项类别（旧接口）
router.delete('/api/quick-options/categories/:id', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  // 先尝试从分组中删除
  let deleted = false;
  if (options.groups) {
    for (const group of options.groups) {
      const index = group.categories.findIndex(c => c.id === ctx.params.id);
      if (index !== -1) {
        group.categories.splice(index, 1);
        deleted = true;
        break;
      }
    }
  }
  
  // 如果没从分组中删除，尝试旧结构
  if (!deleted) {
    const category = options.categories.find(c => c.id === ctx.params.id);
    if (category && category.label) {
      delete options.labels[category.label];
    }
    options.categories = options.categories.filter(c => c.id !== ctx.params.id);
  }
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete category' };
  }
});

// 添加快捷选项子项
router.post('/api/quick-options/categories/:id/options', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  let category = null;
  
  // 先尝试在分组中查找
  if (options.groups) {
    for (const group of options.groups) {
      category = group.categories.find(c => c.id === ctx.params.id);
      if (category) break;
    }
  }
  
  // 如果没找到，尝试旧结构
  if (!category) {
    category = options.categories.find(c => c.id === ctx.params.id);
  }
  
  if (!category) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Category not found' };
    return;
  }
  
  if (!category.options) {
    category.options = [];
  }
  
  if (!category.options.includes(body.option)) {
    category.options.push(body.option);
  }
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: category.options };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to save option' };
  }
});

// 删除快捷选项子项
router.delete('/api/quick-options/categories/:id/options/:option', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  let category = null;
  
  // 先尝试在分组中查找
  if (options.groups) {
    for (const group of options.groups) {
      category = group.categories.find(c => c.id === ctx.params.id);
      if (category) break;
    }
  }
  
  // 如果没找到，尝试旧结构
  if (!category) {
    category = options.categories.find(c => c.id === ctx.params.id);
  }
  
  if (!category) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Category not found' };
    return;
  }
  
  if (category.options) {
    category.options = category.options.filter(
      opt => opt !== decodeURIComponent(ctx.params.option)
    );
  }
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete option' };
  }
});

// 更新快捷选项标签
router.put('/api/quick-options/labels', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    groups: [],
    categories: [],
    labels: {}
  });
  
  options.labels = { ...options.labels, ...body };
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: options };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update labels' };
  }
});

export default router;
