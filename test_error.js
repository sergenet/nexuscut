const { chromium, devices } = require('playwright');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'mobile/dist')));
app.use((req, res) => res.sendFile(path.join(__dirname, 'mobile/dist/index.html')));
const server = app.listen(3005, () => console.log('Server running on port 3005'));

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({...devices['iPhone 12']});
  const page = await context.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });
  
  await page.goto('http://localhost:3005/editor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'C:\\NexusCut\\test_editor_screenshot.png' });
  console.log('Screenshot saved to test_editor_screenshot.png');
  
  await browser.close();
  server.close();
})();
