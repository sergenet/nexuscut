const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.static(path.join(__dirname, 'mobile/dist')));

app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'mobile/dist/index.html'));
  } else {
    next();
  }
});

const server = app.listen(3008, async () => {
  console.log('Server running on port 3008');
  
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    } else {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR (Crash):', error.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  
  console.log('Navigating to editor...');
  await page.goto('http://localhost:3008/editor', { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log(e));
  
  console.log('Waiting 2 seconds to let React crash...');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'test_desktop.png' });
  console.log("Screenshot saved as test_desktop.png");

  await browser.close();
  server.close();
  process.exit(0);
});
