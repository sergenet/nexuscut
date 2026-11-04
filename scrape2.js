const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404 URL:', response.url());
    }
  });
  
  await page.goto('https://nexuscut.io/editor', { waitUntil: 'networkidle0' });
  await browser.close();
})();
