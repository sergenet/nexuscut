const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.static(path.join(__dirname, 'mobile/dist')));

// Serve index.html for all other routes to support SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'mobile/dist/index.html'));
});

const server = app.listen(3008, async () => {
  console.log('Server running on port 3008');
  
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3008/editor', { waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: 'test_desktop.png' });
  
  await browser.close();
  server.close();
  console.log("Screenshot saved as test_desktop.png");
});
