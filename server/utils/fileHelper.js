import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据存储目录 - 指向最外层data目录
const DATA_DIR = join(__dirname, '..', '..', 'data');

// 日记存储子目录
const DIARIES_DIR = join(DATA_DIR, 'diaries');

// 确保数据目录存在
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// 确保日记目录存在
if (!existsSync(DIARIES_DIR)) {
  mkdirSync(DIARIES_DIR, { recursive: true });
}

// 获取数据文件路径（用于快捷选项等单个文件）
export const getDataFilePath = (fileName) => {
  return join(DATA_DIR, fileName);
};

// 获取日记文件路径（按日期命名）
export const getDiaryFilePath = (dateStr) => {
  return join(DIARIES_DIR, `${dateStr}.json`);
};

// 获取所有日记文件列表
export const getAllDiaryFiles = () => {
  try {
    if (!existsSync(DIARIES_DIR)) {
      return [];
    }
    const files = readdirSync(DIARIES_DIR);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Error reading diary files:', error);
    return [];
  }
};

// 初始化数据文件
export const initDataFile = (filePath, defaultData) => {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

// 读取数据（单个文件）
export const readData = (fileName, defaultData = []) => {
  const filePath = getDataFilePath(fileName);
  try {
    initDataFile(filePath, defaultData);
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
};

// 写入数据（单个文件）
export const writeData = (fileName, data) => {
  const filePath = getDataFilePath(fileName);
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// 读取单日期日记数据
export const readDiaryByDate = (dateStr) => {
  const filePath = getDiaryFilePath(dateStr);
  try {
    if (!existsSync(filePath)) {
      return [];
    }
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading diary for ${dateStr}:`, error);
    return [];
  }
};

// 写入单日期日记数据
export const writeDiaryByDate = (dateStr, diaries) => {
  const filePath = getDiaryFilePath(dateStr);
  try {
    writeFileSync(filePath, JSON.stringify(diaries, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing diary for ${dateStr}:`, error);
    return false;
  }
};

// 读取日期范围内的所有日记
export const readDiariesInRange = (startDateStr, endDateStr) => {
  const allDiaries = [];
  const files = getAllDiaryFiles();
  
  for (const file of files) {
    const dateStr = file.replace('.json', '');
    if (dateStr >= startDateStr && dateStr <= endDateStr) {
      const diaries = readDiaryByDate(dateStr);
      allDiaries.push(...diaries);
    }
  }
  
  return allDiaries;
};

// 删除单日期日记文件
export const deleteDiaryFile = (dateStr) => {
  const filePath = getDiaryFilePath(dateStr);
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting diary for ${dateStr}:`, error);
    return false;
  }
};

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};