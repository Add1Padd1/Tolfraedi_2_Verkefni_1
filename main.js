import fs from 'node:fs/promises';
import path, { parse } from 'node:path';
import _ from 'lodash';
const INDEX_PATH = './data/index.json';
const CORRUPT_PATH = './data/corrupt.json';
const CSS_PATH = './data/css.json';
const HTML_PATH = './data/html.json';
const JS_PATH = './data/js.json';

const cssHtmlFilePath = 'dist/css.html';
const htmlHtmlFilePath = 'dist/html.html';
const jsHtmlFilePath = 'dist/js.html';
const corruptHtmlFilePath = 'dist/corrupt.html';
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
    if (item.title && item.file) {
      const htmlFile = item.file.replace('.json', '.html');
      html += `<li><a href="${htmlFile}">${item.title}</a></li>\n`;
    } else {
      console.error('Invalid data', item);
    }
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
  await fs.writeFile(htmlFilePath, htmlContent, 'utf8');
}

async function writeOtherHtml(data, filepath) {
  let title = `${data.title}`;
  let content = '';
  console.log('writing to', filepath);
  for (const item of data.questions) {
    if (item.question && Array.isArray(item.answers)) {
      console.log('svorin', item.answers);
      content += `<div class="question">\n`;
      content += `<p>${_.escape(item.question)}</p>\n`;
      for (const answer of item.answers) {
        if (answer.answer) {
          content += `<label><input type="checkbox" name="question-${_.escape(
            item.question
          )}" value="${_.escape(answer.answer)}"> ${_.escape(
            answer.answer
          )}</label><br>\n`;
        } else {
          console.error('Invalid answer', answer);
        }
      }
      content += `</div>\n`;
    } else {
      console.error('Invalid data', item);
    }
  }

  const htmlContent = `
  <!doctype html>
  <html>
    <head>
    <title>${title}</title>
    </head>
    <body>
      <form>
        ${content}
        <button type="submit">Submit</button>
      </form>
    </body>
  </html>
  `;
  console.log('HTML content:', htmlContent); // Log the HTML content
  await fs.writeFile(filepath, htmlContent, 'utf8');
  console.log('File written successfully');
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
  const indexData = await readJson(INDEX_PATH);
  if (indexData) {
    await writeHtml(indexData);
  }

  const cssData = await readJson(CSS_PATH);
  if (cssData) {
    await writeOtherHtml(cssData, cssHtmlFilePath);
  }

  const htmlData = await readJson(HTML_PATH);
  if (htmlData) {
    await writeOtherHtml(htmlData, htmlHtmlFilePath);
  }

  const jsData = await readJson(JS_PATH);
  if (jsData) {
    await writeOtherHtml(jsData, jsHtmlFilePath);
  }

  const corruptData = await readJson(CORRUPT_PATH);
  if (corruptData) {
    await writeOtherHtml(corruptData, corruptHtmlFilePath);
  }
}

main();
