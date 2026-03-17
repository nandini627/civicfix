const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        
        await page.goto('http://localhost:5174/login', {waitUntil: 'networkidle2'});
        await page.type('input[type="email"]', 'admin@example.com');
        await page.type('input[type="password"]', 'password123'); // or just go to dashboard, but it redirects if not logged in.
        
        // Actually, just going to dashboard should show any import errors in the console!
        console.log('--- going to dashboard ---');
        await page.goto('http://localhost:5174/dashboard', {waitUntil: 'networkidle2'});
        
        console.log('--- going to profile ---');
        await page.goto('http://localhost:5174/profile', {waitUntil: 'networkidle2'});
        
        console.log('--- going to report issue ---');
        await page.goto('http://localhost:5174/report-issue', {waitUntil: 'networkidle2'});
        
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
