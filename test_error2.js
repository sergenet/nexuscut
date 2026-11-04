const { chromium } = require('playwright');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'mobile/dist')));
app.use((req, res) => res.sendFile(path.join(__dirname, 'mobile/dist/index.html')));
const server = app.listen(3006, () => console.log('Server running on port 3006'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page.on('console', msg => console.log(`[CONSOLE] ${msg.text()}`));
  
  await page.goto('http://localhost:3006/editor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'test_desktop.png' });
  
  const layoutInfo = await page.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll('*'));
    const els = allEls.filter(el => window.getComputedStyle(el).flexDirection === 'row' && el.children.length >= 3);
    let res = '';
    els.forEach((el, i) => {
      res += `Row ${i}: ${el.children.length} children\n`;
      Array.from(el.children).forEach((c, j) => {
        const rect = c.getBoundingClientRect();
        res += `  Child ${j}: ${rect.width}x${rect.height} at X=${rect.x}\n`;
      });
    });
    return res || 'No rows found';
  });
  
  console.log('Layout Info:\n', layoutInfo);
  
  await browser.close();
  server.close();
})();
