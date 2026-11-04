const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER PAGE ERROR:', error.message));
  
  await page.goto('https://nexuscut.io/editor', { waitUntil: 'networkidle0' });
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('BODY TEXT:', bodyText);
  
  await browser.close();
})();
