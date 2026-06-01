import Router from 'koa-router';
import { readData, writeData, generateId } from '../utils/fileHelper.js';

const router = new Router();
const DIARIES_FILE = 'diaries.json';

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

export default router;
