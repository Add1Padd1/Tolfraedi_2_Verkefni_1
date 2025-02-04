import fs from 'node:fs/promises';
import path, { parse } from 'node:path';
const INDEX_PATH = './data/index.json';
/**
 * Les skrá og skilar gögnum eða null.
 * @param {string} filePath Skráin sem á að lesa
 * @returns {Promise<unknown | null>} Les skrá úr `filepath` og skilar innihaldi. Skilar `null` ef villa kom upp
 */
async function readJson(filePath) {
  console.log('starting to read', filePath);
  let data;
  try {
    data = await fs.readFile(path.resolve(filePath), 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }

  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('Error parsing data as JSON');
    return null;
  }
}
/**
 * Skrifa HTML fyrir yfirlit í index.html
 * @param {any} data Gögn til að skrifa
 * @returns {Promise<void>}
 */
async function writeHtml(data) {
  const htmlFilePath = 'dist/index.html';

  let html = '';
  for (const item of data) {
    html += `<li>${item.title}</li>\n`;
  }
  const htmlContent = `
  <!doctype html>
  <html>
    <head>
    <title>v1</title>
    </head>
    <body>
      <ul>
        ${html}
      </ul>
    </body>
  </html>
  `;
  fs.writeFile(htmlFilePath, htmlContent, 'utf8');
}

/**
 *
 * @param {unknown} data
 * @returns {any}
 */
function parseIndexJson(data) {
  return data;
}
/**
 * Keyrir forritið okkar:
 * 1. Sækir gögn
 * 2. Staðfestir gögn (validation)
 * 3. Skrifar út HTML
 */
async function main() {
  const indexJson = await readJson(INDEX_PATH);

  const indexData = parseIndexJson(indexJson);

  writeHtml(indexData);

  console.log(indexData);
}

main();
