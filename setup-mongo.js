const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const PROFILE = path.join(process.env.TEMP, 'chrome-profile-copy');

(async () => {
    console.log('\n=== MongoDB Atlas - Using Your Chrome Profile ===\n');

    const context = await chromium.launchPersistentContext(PROFILE, {
        headless: false,
        channel: 'chrome',
        viewport: null,
        args: ['--no-first-run', '--disable-blink-features=AutomationControlled', '--profile-directory=Default']
    });
    const page = context.pages()[0] || await context.newPage();

    try {
        console.log('[1] Opening MongoDB Atlas with your profile...');
        await page.goto('https://cloud.mongodb.com/v2#/org/all/projects', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(8000);
        console.log('  URL:', page.url().substring(0, 100));

        const curUrl = page.url();
        if (curUrl.includes('login') || curUrl.includes('account.mongodb.com') || curUrl.includes('accounts.google.com')) {
            console.log('\n  >>> Need Google sign-in. Click your account! <<<');
            console.log('  >>> Waiting 5 minutes... <<<\n');

            for (let i = 0; i < 60; i++) {
                await page.waitForTimeout(5000);
                const u = page.url();
                if (u.includes('cloud.mongodb.com') && !u.includes('login') && !u.includes('account.')) {
                    console.log('  Signed in!');
                    break;
                }
                if (i % 6 === 0 && i > 0) console.log('  Waiting... (' + (i * 5) + 's)');
            }
        }

        await page.waitForTimeout(5000);
        console.log('\n[2] URL:', page.url().substring(0, 100));

        if (page.url().includes('login') || page.url().includes('account.')) {
            console.log('  Still on login. Trying signup...');
            await page.goto('https://cloud.mongodb.com/v2#/register', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(8000);
            console.log('  URL:', page.url().substring(0, 100));
        }

        console.log('\n[3] Looking for Build a Database...');
        for (let i = 0; i < 40; i++) {
            try {
                const found = await page.evaluate(() => {
                    const els = document.querySelectorAll('a, button, div[role="button"], span');
                    for (const el of els) {
                        const t = (el.textContent || '').trim();
                        if (t.includes('Build a Database') || t === 'Build Database' || t.includes('New Cluster') || t === 'Create') {
                            el.click();
                            return t;
                        }
                    }
                    return '';
                });
                if (found) { console.log('  Clicked:', found); break; }
            } catch (e) {}
            if (i % 10 === 0 && i > 0) console.log('  Attempt', i + 1, '...');
            await page.waitForTimeout(3000);
        }
        await page.waitForTimeout(5000);
        console.log('  URL:', page.url().substring(0, 100));

        console.log('[4] Selecting M0 Free...');
        try {
            await page.evaluate(() => {
                const allEls = document.querySelectorAll('*');
                for (const el of allEls) {
                    const t = (el.textContent || '').trim();
                    if (t === 'M0' || t === 'Free' || t === 'M0 FREE' || t === 'Shared (Free)' || (t.includes('Free') && t.length < 20 && t.includes('M0'))) {
                        (el.closest('button, a, label, div[role="button"], input') || el).click();
                        return;
                    }
                }
            });
        } catch (e) {}
        await page.waitForTimeout(3000);

        console.log('[5] Region Mumbai...');
        try {
            await page.evaluate(() => {
                const allEls = document.querySelectorAll('*');
                for (const el of allEls) {
                    const t = (el.textContent || '').trim();
                    if (t.includes('Mumbai') || t.includes('ap-south')) {
                        (el.closest('button, a, label, option') || el).click();
                        return;
                    }
                }
            });
        } catch (e) {}
        await page.waitForTimeout(3000);

        console.log('[6] Create Deployment...');
        for (let i = 0; i < 15; i++) {
            try {
                const found = await page.evaluate(() => {
                    const btns = document.querySelectorAll('button, a');
                    for (const btn of btns) {
                        const t = (btn.textContent || '').trim();
                        if (t.includes('Create Deployment') || t === 'Create') { btn.click(); return t; }
                    }
                    return '';
                });
                if (found) { console.log('  Clicked:', found); break; }
            } catch (e) {}
            await page.waitForTimeout(3000);
        }
        await page.waitForTimeout(10000);
        console.log('  URL:', page.url().substring(0, 100));

        console.log('[7] Database user...');
        await page.waitForTimeout(5000);
        try {
            await page.evaluate(() => {
                const inputs = document.querySelectorAll('input');
                for (const inp of inputs) {
                    const closest = inp.closest('div, label, fieldset');
                    const text = closest ? closest.textContent.toLowerCase() : '';
                    const ph = (inp.placeholder || '').toLowerCase();
                    if (text.includes('user') || ph.includes('user')) {
                        const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                        nativeSet.call(inp, 'agemaster');
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if ((text.includes('pass') || ph.includes('pass') || inp.type === 'password') && !text.includes('confirm')) {
                        const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                        nativeSet.call(inp, 'AgeMaster2024!');
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        } catch (e) {}
        await page.waitForTimeout(2000);
        try {
            await page.evaluate(() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    const t = (btn.textContent || '').trim();
                    if (t.includes('Create User') || t.includes('Create Database User') || t === 'Save') { btn.click(); return; }
                }
            });
        } catch (e) {}
        await page.waitForTimeout(5000);

        console.log('[8] IP whitelist...');
        try {
            await page.evaluate(() => {
                const allEls = document.querySelectorAll('*');
                for (const el of allEls) {
                    const t = (el.textContent || '').trim();
                    if (t.includes('Allow Access from Anywhere') || t === '0.0.0.0/0') {
                        (el.closest('button, a, label') || el).click(); return;
                    }
                }
            });
        } catch (e) {}
        await page.waitForTimeout(3000);
        try {
            await page.evaluate(() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    const t = (btn.textContent || '').trim();
                    if (t.includes('Finish') || t.includes('Close') || t.includes('Done') || t.includes('Confirm')) { btn.click(); return; }
                }
            });
        } catch (e) {}
        await page.waitForTimeout(10000);

        console.log('[9] Connection string...');
        await page.goto('https://cloud.mongodb.com/v2', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(10000);

        for (let i = 0; i < 20; i++) {
            try {
                const found = await page.evaluate(() => {
                    const els = document.querySelectorAll('button, a');
                    for (const el of els) {
                        const t = (el.textContent || '').trim();
                        if (t === 'Connect' || t === 'Connect to cluster') { el.click(); return t; }
                    }
                    return '';
                });
                if (found) { console.log('  Clicked:', found); break; }
            } catch (e) {}
            await page.waitForTimeout(3000);
        }
        await page.waitForTimeout(5000);

        try {
            await page.evaluate(() => {
                const els = document.querySelectorAll('button, a, div, span');
                for (const el of els) {
                    const t = (el.textContent || '').trim();
                    if (t === 'Drivers' || t.includes('Connect using drivers')) { el.click(); return; }
                }
            });
        } catch (e) {}
        await page.waitForTimeout(8000);

        let connStr = '';
        try {
            connStr = await page.evaluate(() => {
                const allEls = document.querySelectorAll('*');
                for (const el of allEls) {
                    const text = el.value || el.textContent || el.innerText || '';
                    const match = text.match(/mongodb(\+srv)?:\/\/[^\s"'<>\\]+/);
                    if (match && match[0].length > 30) return match[0];
                }
                return '';
            });
        } catch (e) {}

        if (!connStr) {
            try {
                const btns = await page.$$('button');
                for (const btn of btns) {
                    const t = await btn.textContent().catch(() => '');
                    if (t && t.toLowerCase().includes('copy')) { await btn.click(); await page.waitForTimeout(1000); break; }
                }
                connStr = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
            } catch (e) {}
        }

        if (connStr && connStr.includes('mongodb')) {
            console.log('\n*** CONNECTION STRING OBTAINED! ***');
            console.log('  ', connStr.substring(0, 80) + '...\n');
            fs.writeFileSync(path.join(__dirname, '.env'), 'MONGODB_URI=' + connStr + '\nDB_NAME=age_master\nPORT=3000\n');
            console.log('  Saved to .env');

            try {
                const client = new MongoClient(connStr);
                await client.connect();
                const db = client.db('age_master');
                await db.collection('users').createIndex({ email: 1 }, { unique: true });
                console.log('  CONNECTED! DB ready.');
                await client.close();
                console.log('\n=== COMPLETE! Run: node server.js ===\n');
            } catch (e) { console.log('  Test:', e.message); }
        } else {
            console.log('\n>>> Check browser for connection string');
        }

    } catch (e) { console.error('Error:', e.message); }
    finally {
        try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch(e) {}
        await context.close().catch(() => {});
        process.exit(0);
    }
})();
