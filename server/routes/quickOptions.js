import Router from 'koa-router';
import { readData, writeData, generateId } from '../utils/fileHelper.js';

const router = new Router();
const OPTIONS_FILE = 'quickOptions.json';

// 获取快捷选项
router.get('/api/quick-options', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    categories: [],
    labels: {}
  });
  ctx.body = { success: true, data: options };
});

// 添加快捷选项类别
router.post('/api/quick-options/categories', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    categories: [],
    labels: {}
  });
  
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
});

// 更新快捷选项类别
router.put('/api/quick-options/categories/:id', async (ctx) => {
  const body = ctx.request.body;
  const options = readData(OPTIONS_FILE, {
    categories: [],
    labels: {}
  });
  
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
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: options.categories[index] };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update category' };
  }
});

// 删除快捷选项类别
router.delete('/api/quick-options/categories/:id', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    categories: [],
    labels: {}
  });
  
  const category = options.categories.find(c => c.id === ctx.params.id);
  if (category && category.label) {
    delete options.labels[category.label];
  }
  
  options.categories = options.categories.filter(c => c.id !== ctx.params.id);
  
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
    categories: [],
    labels: {}
  });
  
  const index = options.categories.findIndex(c => c.id === ctx.params.id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Category not found' };
    return;
  }
  
  if (!options.categories[index].options) {
    options.categories[index].options = [];
  }
  
  if (!options.categories[index].options.includes(body.option)) {
    options.categories[index].options.push(body.option);
  }
  
  if (writeData(OPTIONS_FILE, options)) {
    ctx.body = { success: true, data: options.categories[index].options };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to save option' };
  }
});

// 删除快捷选项子项
router.delete('/api/quick-options/categories/:id/options/:option', async (ctx) => {
  const options = readData(OPTIONS_FILE, {
    categories: [],
    labels: {}
  });
  
  const index = options.categories.findIndex(c => c.id === ctx.params.id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Category not found' };
    return;
  }
  
  if (options.categories[index].options) {
    options.categories[index].options = options.categories[index].options.filter(
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
