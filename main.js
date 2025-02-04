import fs from 'node:fs/promises';
import path from 'node:path';
const INDEX_PATH = './data/index.json';

async function readJson(filePath) {
  console.log('starting to read', filePath);
  try {
    const data = await fs.readFile(path.resolve(filePath), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Hello world');

  const data = await readJson(INDEX_PATH);

  console.log(data);
}

main();
