import Router from 'koa-router';
import { readDiaryFile, writeDiaryFile, getAllDiaryDates, generateId } from '../utils/fileHelper.js';

const router = new Router();

router.get('/api/diaries', async (ctx) => {
  try {
    const dates = getAllDiaryDates();
    let allDiaries = [];
    
    for (const date of dates) {
      const diaries = readDiaryFile(date);
      allDiaries = allDiaries.concat(diaries);
    }
    
    ctx.body = { success: true, data: allDiaries };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to fetch diaries' };
  }
});

router.get('/api/diaries/:id', async (ctx) => {
  try {
    const dates = getAllDiaryDates();
    
    for (const date of dates) {
      const diaries = readDiaryFile(date);
      const diary = diaries.find(d => d.id === ctx.params.id);
      
      if (diary) {
        ctx.body = { success: true, data: diary };
        return;
      }
    }
    
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to fetch diary' };
  }
});

router.post('/api/diaries', async (ctx) => {
  try {
    const body = ctx.request.body;
    const date = body.date;
    
    if (!date) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'Date is required' };
      return;
    }
    
    const diaries = readDiaryFile(date);
    
    const newDiary = {
      id: generateId(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    diaries.push(newDiary);
    
    if (writeDiaryFile(date, diaries)) {
      ctx.body = { success: true, data: newDiary };
    } else {
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to save diary' };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to create diary' };
  }
});

router.put('/api/diaries/:id', async (ctx) => {
  try {
    const dates = getAllDiaryDates();
    const updates = ctx.request.body;
    
    for (const date of dates) {
      const diaries = readDiaryFile(date);
      const index = diaries.findIndex(d => d.id === ctx.params.id);
      
      if (index !== -1) {
        const updatedDiary = {
          ...diaries[index],
          ...updates,
          id: diaries[index].id,
          updatedAt: new Date().toISOString()
        };
        
        diaries[index] = updatedDiary;
        
        if (writeDiaryFile(date, diaries)) {
          ctx.body = { success: true, data: updatedDiary };
        } else {
          ctx.status = 500;
          ctx.body = { success: false, message: 'Failed to update diary' };
        }
        return;
      }
    }
    
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update diary' };
  }
});

router.delete('/api/diaries/:id', async (ctx) => {
  try {
    const dates = getAllDiaryDates();
    
    for (const date of dates) {
      const diaries = readDiaryFile(date);
      const index = diaries.findIndex(d => d.id === ctx.params.id);
      
      if (index !== -1) {
        diaries.splice(index, 1);
        
        if (writeDiaryFile(date, diaries)) {
          ctx.body = { success: true };
        } else {
          ctx.status = 500;
          ctx.body = { success: false, message: 'Failed to delete diary' };
        }
        return;
      }
    }
    
    ctx.status = 404;
    ctx.body = { success: false, message: 'Diary not found' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete diary' };
  }
});

export default router;
