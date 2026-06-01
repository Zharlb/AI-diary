import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const router = new Router();

// 数据存储目录
const DATA_DIR = join(__dirname, 'data');

// 确保数据目录存在
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// 数据文件路径
const DIARIES_FILE = join(DATA_DIR, 'diaries.json');
const OPTIONS_FILE = join(DATA_DIR, 'quickOptions.json');

// 初始化数据文件
const initDataFile = (filePath, defaultData) => {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

// 读取数据
const readData = (filePath, defaultData = []) => {
  try {
    initDataFile(filePath, defaultData);
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
};

// 写入数据
const writeData = (filePath, data) => {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// ============ 日记接口 ============

// 获取所有日记
router.get('/api/diaries', async (ctx) => {
  const diaries = readData(DIARIES_FILE, []);
  ctx.body = { success: true, data: diaries };
});

// 获取单个日记
router.get('/api/diaries/:id', async (ctx) => {
  const diaries = readData(DIARIES_FILE, []);
  const diary = diaries.find(d => d.id === ctx.params.id);
  if (diary) {
    ctx.body = { success: true, data: diary };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
  }
});

// 创建日记
router.post('/api/diaries', async (ctx) => {
  const body = ctx.request.body;
  const diaries = readData(DIARIES_FILE, []);
  
  const newDiary = {
    id: generateId(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  diaries.push(newDiary);
  
  if (writeData(DIARIES_FILE, diaries)) {
    ctx.body = { success: true, data: newDiary };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to save diary' };
  }
});

// 更新日记
router.put('/api/diaries/:id', async (ctx) => {
  const diaries = readData(DIARIES_FILE, []);
  const index = diaries.findIndex(d => d.id === ctx.params.id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
    return;
  }
  
  const updatedDiary = {
    ...diaries[index],
    ...ctx.request.body,
    id: ctx.params.id,
    updatedAt: new Date().toISOString()
  };
  
  diaries[index] = updatedDiary;
  
  if (writeData(DIARIES_FILE, diaries)) {
    ctx.body = { success: true, data: updatedDiary };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update diary' };
  }
});

// 删除日记
router.delete('/api/diaries/:id', async (ctx) => {
  const diaries = readData(DIARIES_FILE, []);
  const filteredDiaries = diaries.filter(d => d.id !== ctx.params.id);
  
  if (filteredDiaries.length === diaries.length) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
    return;
  }
  
  if (writeData(DIARIES_FILE, filteredDiaries)) {
    ctx.body = { success: true };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete diary' };
  }
});

// ============ 快捷选项接口 ============

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
    id: generateId(), // 系统自动生成唯一标识
    name: body.name,
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

// 中间件
app.use(cors());
app.use(bodyParser());

// 路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
