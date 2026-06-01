import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据存储目录
const DATA_DIR = join(__dirname, '..', 'data');

// 确保数据目录存在
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// 获取数据文件路径
export const getDataFilePath = (fileName) => {
  return join(DATA_DIR, fileName);
};

// 初始化数据文件
export const initDataFile = (filePath, defaultData) => {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

// 读取数据
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

// 写入数据
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

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
