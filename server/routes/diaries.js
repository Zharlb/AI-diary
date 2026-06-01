import Router from 'koa-router';
import { readDiaryByDate, writeDiaryByDate, readDiariesInRange, generateId } from '../utils/fileHelper.js';

const router = new Router();

// 获取日期范围内的日记
router.get('/api/diaries', async (ctx) => {
  const { startDate, endDate } = ctx.query;
  
  if (startDate && endDate) {
    const diaries = readDiariesInRange(startDate, endDate);
    ctx.body = { success: true, data: diaries };
  } else {
    ctx.body = { success: true, data: [] };
  }
});

// 获取单个日记
router.get('/api/diaries/:id', async (ctx) => {
  ctx.status = 404;
  ctx.body = { success: false, message: 'Diary not found' };
});

// 创建日记
router.post('/api/diaries', async (ctx) => {
  const body = ctx.request.body;
  
  if (!body.date) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'Date is required' };
    return;
  }
  
  const dateStr = body.date;
  const existingDiaries = readDiaryByDate(dateStr);
  
  const newDiary = {
    id: generateId(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  existingDiaries.push(newDiary);
  
  if (writeDiaryByDate(dateStr, existingDiaries)) {
    ctx.body = { success: true, data: newDiary };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to save diary' };
  }
});

// 更新日记
router.put('/api/diaries/:id', async (ctx) => {
  const body = ctx.request.body;
  
  if (!body.date) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'Date is required' };
    return;
  }
  
  const dateStr = body.date;
  const diaries = readDiaryByDate(dateStr);
  const index = diaries.findIndex(d => d.id === ctx.params.id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
    return;
  }
  
  const updatedDiary = {
    ...diaries[index],
    ...body,
    id: ctx.params.id,
    updatedAt: new Date().toISOString()
  };
  
  diaries[index] = updatedDiary;
  
  if (writeDiaryByDate(dateStr, diaries)) {
    ctx.body = { success: true, data: updatedDiary };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update diary' };
  }
});

// 删除日记
router.delete('/api/diaries/:id', async (ctx) => {
  const { date } = ctx.query;
  
  if (!date) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'Date is required' };
    return;
  }
  
  const dateStr = date;
  const diaries = readDiaryByDate(dateStr);
  const filteredDiaries = diaries.filter(d => d.id !== ctx.params.id);
  
  if (filteredDiaries.length === diaries.length) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
    return;
  }
  
  if (writeDiaryByDate(dateStr, filteredDiaries)) {
    ctx.body = { success: true };
  } else {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete diary' };
  }
});

export default router;