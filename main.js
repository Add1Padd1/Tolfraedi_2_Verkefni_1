import fs from 'node:fs/promises';
import path, { parse } from 'node:path';
import _ from 'lodash';

const INDEX_PATH = './data/index.json';
const CORRUPT_PATH = './data/corrupt.json';
const CSS_PATH = './data/css.json';
const HTML_PATH = './data/html.json';
const JS_PATH = './data/js.json';

const DATA_FOLDER = './data';
const VALID_FILES = ['corrupt.json', 'css.json', 'html.json', 'js.json'];

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
      const fileName = path.basename(item.file);
      if (VALID_FILES.includes(fileName)) {
        const filePath = path.join(DATA_FOLDER, fileName);
        const fileData = await readJson(filePath);
        console.log('fileData', fileData);
        if (
          fileData &&
          typeof fileData === 'object' &&
          'questions' in fileData &&
          fileData.questions !== null &&
          Array.isArray(fileData.questions)
        ) {
          const htmlFile = item.file.replace('.json', '.html');
          html += `<div class="link-container"><a href="${htmlFile}" class="link">${item.title}</a></div>\n`;
        } else {
          console.error(`Invalid or missing questions in file ${fileName}`);
        }
      } else {
        console.error(`File ${fileName} is not a valid data file`);
      }
    } else {
      console.error('Invalid data', item);
    }
  }

  const htmlContent = `
  <!doctype html>
  <html>
    <head>
    <meta charset="utf-8" />
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        font-family: Arial, sans-serif;
      }
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 600px;
      }
      .link-container {
        width: 100%;
        margin: 10px 0;
      }
      .link {
        display: block;
        width: 100%;
        padding: 20px;
        text-align: center;
        text-decoration: none;
        color: black;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 5px;
        transition: background-color 0.3s;
      }
      .link:hover {
        background-color: #e0e0e0;
      }
    </style>
    <title>v1</title>
    </head>
    <body>
      <div class="container">
        ${html}
      </div>
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
      content += `<div class="question-container">\n`;
      content += `<p class="question">${_.escape(item.question)}</p>\n`;
      for (const answer of item.answers) {
        if (answer.answer) {
          content += `<label class="answer"><input type="radio" name="question-${_.escape(
            item.question
          )}" value="${_.escape(answer.answer)}" data-correct="${
            answer.correct
          }"> ${_.escape(answer.answer)}</label><br>\n`;
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
    <meta charset="utf-8" />
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        font-family: Arial, sans-serif;
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 600px;
      }

      .link {
        display: block;
        width: 100%;
        padding: 20px;
        text-align: center;
        text-decoration: none;
        color: black;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 5px;
        transition: background-color 0.3s;
      }
      .link:hover {
        background-color: #e0e0e0;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 20px;
      }

      .title {
        text-align: center;
        flex: 1;
      }

      .quiz-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      } 

      .question-container {
        width: 100%;
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
      }

      .question {
        margin-bottom: 10px;
        font-weight: bold;
      }

      .answer {
        display: block;
        margin-bottom: 5px;
      }

      .submit-button, .again-button {
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .submit-button:hover, .again-button:hover {
        background-color: #0056b3;
      }

      .submit-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    </style>
    <title>${title}</title>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1 class="title">${title}</h1>
          <h2><a href="./index.html" class="link">Til baka</a></h2>
        </header>
        <form id="quiz-form" class="quiz-form">
          ${content}
          <button type="button" id="submit-button" class="submit-button" disabled>Submit</button>
          <button type="button" id="again-button" class="again-button" style="display: none;">Again</button>
        </form>
      </div>
      <script>
        function checkAllQuestionsAnswered() {
          const questions = document.querySelectorAll('.question-container');
          let allAnswered = true;
          questions.forEach(question => {
            const selectedAnswer = question.querySelector('input[type="radio"]:checked');
            if (!selectedAnswer) {
              allAnswered = false;
            }
          });
          document.getElementById('submit-button').disabled = !allAnswered;
        }

        document.querySelectorAll('input[type="radio"]').forEach(radio => {
          radio.addEventListener('change', checkAllQuestionsAnswered);
        });

        document.getElementById('submit-button').addEventListener('click', function() {
          const questions = document.querySelectorAll('.question-container');
          questions.forEach(question => {
            const selectedAnswer = question.querySelector('input[type="radio"]:checked');
            if (selectedAnswer) {
              const isCorrect = selectedAnswer.getAttribute('data-correct') === 'true';
              selectedAnswer.parentElement.style.color = isCorrect ? 'green' : 'red';
            }
          });
          // Hide the submit button
          this.style.display = 'none';
          // Show the again button
          document.getElementById('again-button').style.display = 'block';
        });

        document.getElementById('again-button').addEventListener('click', function() {
          // Uncheck all radio buttons
          const radios = document.querySelectorAll('input[type="radio"]');
          radios.forEach(radio => {
            radio.checked = false;
            radio.parentElement.style.color = ''; // Reset color
          });
          // Hide the again button
          this.style.display = 'none';
          // Show the submit button
          document.getElementById('submit-button').style.display = 'block';
          document.getElementById('submit-button').disabled = true; // Disable submit button again
        });

        // Initial check to ensure the submit button is disabled if not all questions are answered
        checkAllQuestionsAnswered();
      </script>
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
