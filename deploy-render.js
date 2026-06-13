const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false, channel: 'chrome' });
    const page = await browser.newPage();

    console.log('Opening Render.com...');
    await page.goto('https://dashboard.render.com/register', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    console.log('URL:', page.url().substring(0, 80));
    console.log('CLICK "Sign in with GitHub" in the browser NOW!');

    for (let i = 0; i < 120; i++) {
        await page.waitForTimeout(3000);
        const u = page.url();
        if (u.includes('dashboard.render.com') && !u.includes('register') && !u.includes('login')) {
            console.log('Logged in!');
            break;
        }
        if (i % 10 === 0 && i > 0) console.log('Waiting for login... (' + (i*3) + 's)');
    }

    console.log('URL:', page.url().substring(0, 80));
    await page.waitForTimeout(3000);

    console.log('Clicking New + ...');
    for (let i = 0; i < 20; i++) {
        try {
            const found = await page.evaluate(() => {
                const els = document.querySelectorAll('button, a, span');
                for (const el of els) {
                    const t = (el.textContent || '').trim();
                    if (t === 'New +' || t === 'New' || t.includes('New Environment') || t.includes('Create a new')) {
                        el.click(); return t;
                    }
                }
                return '';
            });
            if (found) { console.log('Clicked:', found); break; }
        } catch (e) {}
        await page.waitForTimeout(2000);
    }
    await page.waitForTimeout(3000);

    console.log('Clicking Web Service...');
    for (let i = 0; i < 15; i++) {
        try {
            const found = await page.evaluate(() => {
                const els = document.querySelectorAll('button, a, div, span');
                for (const el of els) {
                    const t = (el.textContent || '').trim();
                    if (t.includes('Web Service') || t.includes('Web App') || t === 'Web') {
                        el.click(); return t;
                    }
                }
                return '';
            });
            if (found) { console.log('Clicked:', found); break; }
        } catch (e) {}
        await page.waitForTimeout(2000);
    }
    await page.waitForTimeout(5000);

    console.log('Looking for Apanabro/age-calculator repo...');
    for (let i = 0; i < 20; i++) {
        try {
            const found = await page.evaluate(() => {
                const els = document.querySelectorAll('button, a, div, span, tr, td');
                for (const el of els) {
                    const t = (el.textContent || '').trim();
                    if (t.includes('age-calculator') || t.includes('Apanabro')) {
                        el.click(); return t;
                    }
                }
                return '';
            });
            if (found) { console.log('Selected repo:', found); break; }
        } catch (e) {}
        await page.waitForTimeout(2000);
    }
    await page.waitForTimeout(5000);

    console.log('Looking for Connect button...');
    for (let i = 0; i < 10; i++) {
        try {
            const found = await page.evaluate(() => {
                const btns = document.querySelectorAll('button, a');
                for (const btn of btns) {
                    const t = (btn.textContent || '').trim();
                    if (t.includes('Connect') || t.includes('Create') || t.includes('Deploy')) {
                        btn.click(); return t;
                    }
                }
                return '';
            });
            if (found) { console.log('Clicked:', found); break; }
        } catch (e) {}
        await page.waitForTimeout(2000);
    }
    await page.waitForTimeout(5000);

    console.log('Setting build/start commands...');
    try {
        const inputs = await page.$$('input, textarea');
        for (const inp of inputs) {
            const val = await inp.inputValue().catch(() => '');
            if (val === 'npm run start' || val === 'npm start') {
                await inp.fill('node server.js');
                console.log('Set start command');
            }
            if (val.includes('npm') && val.includes('install')) {
                await inp.fill('npm install');
                console.log('Set build command');
            }
        }
    } catch (e) {}
    await page.waitForTimeout(2000);

    console.log('Clicking Create Web Service...');
    for (let i = 0; i < 15; i++) {
        try {
            const found = await page.evaluate(() => {
                const btns = document.querySelectorAll('button, a');
                for (const btn of btns) {
                    const t = (btn.textContent || '').trim();
                    if (t.includes('Create Web Service') || t.includes('Deploy') || t.includes('Create')) {
                        btn.click(); return t;
                    }
                }
                return '';
            });
            if (found) { console.log('Clicked:', found); break; }
        } catch (e) {}
        await page.waitForTimeout(2000);
    }

    console.log('\nDeploying! Watch the browser for progress.');
    console.log('The URL will be shown in the browser dashboard.');
    console.log('Keeping browser open for 60 seconds...\n');

    for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(3000);
        const u = page.url();
        console.log('  [' + (i*3) + 's] URL:', u.substring(0, 80));
    }

    await browser.close();
})();
