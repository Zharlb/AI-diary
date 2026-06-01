import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', '..', 'data');
const DIARIES_DIR = join(DATA_DIR, 'diaries');

export const getDataFilePath = (fileName) => {
  return join(DATA_DIR, fileName);
};

export const getDiaryFilePath = (date) => {
  return join(DIARIES_DIR, `${date}.json`);
};

export const ensureDiaryDir = () => {
  if (!existsSync(DIARIES_DIR)) {
    mkdirSync(DIARIES_DIR, { recursive: true });
  }
};

export const readData = (fileName, defaultData = []) => {
  const filePath = getDataFilePath(fileName);
  try {
    if (!existsSync(filePath)) {
      return defaultData;
    }
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
};

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

export const readDiaryFile = (date) => {
  const filePath = getDiaryFilePath(date);
  try {
    if (!existsSync(filePath)) {
      return [];
    }
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading diary file ${filePath}:`, error);
    return [];
  }
};

export const writeDiaryFile = (date, diaries) => {
  ensureDiaryDir();
  const filePath = getDiaryFilePath(date);
  try {
    writeFileSync(filePath, JSON.stringify(diaries, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing diary file ${filePath}:`, error);
    return false;
  }
};

export const getAllDiaryDates = () => {
  ensureDiaryDir();
  try {
    const files = readdirSync(DIARIES_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .sort();
  } catch (error) {
    console.error('Error reading diary directory:', error);
    return [];
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
