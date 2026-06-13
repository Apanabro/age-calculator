(function () {
    'use strict';

    const ZODIAC = [
        { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
        { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
        { sign: 'Pisces', start: [2, 19], end: [3, 20] },
        { sign: 'Aries', start: [3, 21], end: [4, 19] },
        { sign: 'Taurus', start: [4, 20], end: [5, 20] },
        { sign: 'Gemini', start: [5, 21], end: [6, 20] },
        { sign: 'Cancer', start: [6, 21], end: [7, 22] },
        { sign: 'Leo', start: [7, 23], end: [8, 22] },
        { sign: 'Virgo', start: [8, 23], end: [9, 22] },
        { sign: 'Libra', start: [9, 23], end: [10, 22] },
        { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
        { sign: 'Sagittarius', start: [11, 22], end: [12, 21] }
    ];

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const $ = (id) => document.getElementById(id);

    const dobInput = $('dob');
    const calcBtn = $('calculateBtn');
    const resultsSection = $('resultsSection');
    const errorToast = $('errorToast');
    const errorMsg = $('errorMsg');
    const toast = $('toast');
    const toastMsg = $('toastMsg');

    let errorTimer = null;
    let toastTimer = null;
    let liveTimer = null;
    let dobDate = null;

    function getZodiac(month, day) {
        for (const z of ZODIAC) {
            const [sm, sd] = z.start;
            const [em, ed] = z.end;
            if (sm === 12) {
                if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return z.sign;
            } else {
                if ((month === sm && day >= sd) || (month === em && day <= ed)) return z.sign;
            }
        }
        return 'Capricorn';
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorToast.classList.add('show');
        clearTimeout(errorTimer);
        errorTimer = setTimeout(() => errorToast.classList.remove('show'), 3000);
    }

    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    function formatNumber(n) {
        return n.toLocaleString();
    }

    function updateLiveMeter() {
        if (!dobDate) return;

        const now = new Date();
        const diff = now - dobDate;

        const totalSeconds = Math.floor(diff / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        $('liveDays').textContent = formatNumber(totalDays);
        $('liveHours').textContent = formatNumber(totalHours);
        $('liveMinutes').textContent = formatNumber(totalMinutes);
        $('liveSeconds').textContent = formatNumber(totalSeconds % 60);
    }

    function calculateAge() {
        errorToast.classList.remove('show');
        clearTimeout(errorTimer);

        const val = dobInput.value;
        if (!val) {
            showError('Please select your date of birth');
            dobInput.focus();
            return;
        }

        dobDate = new Date(val + 'T00:00:00');
        const today = new Date();

        if (dobDate >= today) {
            showError('Date of birth must be in the past');
            return;
        }

        let years = today.getFullYear() - dobDate.getFullYear();
        let months = today.getMonth() - dobDate.getMonth();
        let days = today.getDate() - dobDate.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.floor((today - dobDate) / (1000 * 60 * 60 * 24));
        const totalHours = totalDays * 24;
        const totalMinutes = totalHours * 60;

        $('meterYears').textContent = years;
        $('bdMonths').textContent = months;
        $('bdDays').textContent = days;
        $('bdHours').textContent = formatNumber(totalHours);
        $('bdMinutes').textContent = formatNumber(totalMinutes);

        const circumference = 2 * Math.PI * 62;
        const progress = Math.min(years / 100, 1);
        document.querySelector('.meter-ring-progress').style.strokeDashoffset = circumference * (1 - progress);

        $('birthDay').textContent = DAYS[dobDate.getDay()];
        $('zodiacSign').textContent = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        $('totalDays').textContent = formatNumber(totalDays);

        const thisYearBday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
        let nextBday = thisYearBday;
        if (today > thisYearBday) {
            nextBday = new Date(today.getFullYear() + 1, dobDate.getMonth(), dobDate.getDate());
        }
        const daysUntil = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
        const yearSpan = Math.ceil((nextBday - thisYearBday) / (1000 * 60 * 60 * 24)) || 365;
        const bdayPercent = Math.round(((yearSpan - daysUntil) / yearSpan) * 100);

        if (daysUntil === 0) {
            $('nextBirthday').textContent = "It's Today!";
        } else if (daysUntil === 1) {
            $('nextBirthday').textContent = 'Tomorrow!';
        } else {
            $('nextBirthday').textContent = daysUntil + ' days away';
        }
        $('countdownFill').style.width = bdayPercent + '%';

        updateLiveMeter();

        if (liveTimer) clearInterval(liveTimer);
        liveTimer = setInterval(updateLiveMeter, 1000);

        resultsSection.classList.add('show');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function generatePDF() {
        if (!dobDate) return;

        const today = new Date();
        let y = today.getFullYear() - dobDate.getFullYear();
        let m = today.getMonth() - dobDate.getMonth();
        let d = today.getDate() - dobDate.getDate();
        if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        const totalDays = Math.floor((today - dobDate) / 86400000);
        const dobStr = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const zodiac = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        const bornDay = DAYS[dobDate.getDay()];
        const now = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast('Pop-up blocked — allow pop-ups for this site');
            return;
        }

        var doc = '<!DOCTYPE html><html><head><title>Age Master Certificate</title>';
        doc += '<meta name="viewport" content="width=device-width,initial-scale=1">';
        doc += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">';
        doc += '<style>';
        doc += '*{margin:0;padding:0;box-sizing:border-box;}';
        doc += 'body{font-family:Inter,-apple-system,sans-serif;background:#f0f0f5;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}';
        doc += '.card{background:#fff;border-radius:20px;padding:48px 40px;max-width:580px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,0.12);}';
        doc += '.card h1{font-size:26px;font-weight:900;text-align:center;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:4px;}';
        doc += '.card .sub{text-align:center;color:#999;font-size:12px;margin-bottom:28px;}';
        doc += '.card hr{border:none;border-top:1px solid #eee;margin:20px 0;}';
        doc += '.card h2{font-size:11px;font-weight:700;color:#a855f7;text-transform:uppercase;letter-spacing:1.5px;margin:24px 0 12px;}';
        doc += '.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f8f8f8;}';
        doc += '.row .lbl{color:#999;font-size:13px;}';
        doc += '.row .val{font-weight:700;font-size:14px;color:#222;}';
        doc += '.footer{text-align:center;color:#ccc;font-size:10px;margin-top:28px;}';
        doc += '.actions{text-align:center;margin-top:24px;}';
        doc += '.btn{padding:14px 40px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;margin:0 8px;}';
        doc += '@media print{body{background:#fff;padding:0;}.card{box-shadow:none;border-radius:0;padding:32px 24px;}.actions{display:none!important;}}';
        doc += '</style></head><body>';
        doc += '<div class="card">';
        doc += '<h1>Age Master Certificate</h1>';
        doc += '<p class="sub">Your Life, Precisely Measured</p><hr>';
        doc += '<h2>Personal Details</h2>';
        doc += '<div class="row"><span class="lbl">Date of Birth</span><span class="val">' + dobStr + '</span></div>';
        doc += '<div class="row"><span class="lbl">Day of Birth</span><span class="val">' + bornDay + '</span></div>';
        doc += '<div class="row"><span class="lbl">Zodiac Sign</span><span class="val">' + zodiac + '</span></div>';
        doc += '<h2>Current Age</h2>';
        doc += '<div class="row"><span class="lbl">Years</span><span class="val">' + y + '</span></div>';
        doc += '<div class="row"><span class="lbl">Months</span><span class="val">' + m + '</span></div>';
        doc += '<div class="row"><span class="lbl">Days</span><span class="val">' + d + '</span></div>';
        doc += '<h2>Life Stats</h2>';
        doc += '<div class="row"><span class="lbl">Total Days</span><span class="val">' + formatNumber(totalDays) + '</span></div>';
        doc += '<div class="row"><span class="lbl">Total Hours</span><span class="val">' + formatNumber(totalDays * 24) + '</span></div>';
        doc += '<div class="row"><span class="lbl">Total Minutes</span><span class="val">' + formatNumber(totalDays * 24 * 60) + '</span></div>';
        doc += '<hr>';
        doc += '<p class="footer">Generated by Age Master &bull; ' + now + '</p>';
        doc += '<div class="actions">';
        doc += '<button class="btn" onclick="window.print()">Save as PDF</button>';
        doc += '<button class="btn" onclick="window.close()" style="background:#666;">Close</button>';
        doc += '</div>';
        doc += '</div></body></html>';

        printWindow.document.write(doc);
        printWindow.document.close();
    }

    function shareResults() {
        if (!dobDate) return;
        const today = new Date();
        let y = today.getFullYear() - dobDate.getFullYear();
        let m = today.getMonth() - dobDate.getMonth();
        let d = today.getDate() - dobDate.getDate();
        if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }

        const text = `Age Master Results\n\n` +
            `DOB: ${dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n` +
            `Age: ${y} years, ${m} months, ${d} days\n` +
            `Zodiac: ${getZodiac(dobDate.getMonth() + 1, dobDate.getDate())}\n` +
            `Born on: ${DAYS[dobDate.getDay()]}\n\n` +
            `Calculate yours → apanabro.github.io/age-calculator/`;

        if (navigator.share) {
            navigator.share({ title: 'Age Master Results', text }).catch(() => {});
        } else {
            copyToClipboard(text);
        }
    }

    function copyResults() {
        if (!dobDate) return;
        const today = new Date();
        let y = today.getFullYear() - dobDate.getFullYear();
        let m = today.getMonth() - dobDate.getMonth();
        let d = today.getDate() - dobDate.getDate();
        if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }

        const text = `Age Master:\n${y}y ${m}m ${d}d\nZodiac: ${getZodiac(dobDate.getMonth() + 1, dobDate.getDate())}`;
        copyToClipboard(text);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('Copied!'); } catch (e) { showToast('Failed'); }
        document.body.removeChild(ta);
    }

    calcBtn.addEventListener('click', calculateAge);
    $('pdfBtn').addEventListener('click', generatePDF);
    $('shareBtn').addEventListener('click', shareResults);
    $('copyBtn').addEventListener('click', copyResults);
    $('topShareBtn').addEventListener('click', shareResults);

    dobInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') calculateAge(); });
    dobInput.addEventListener('change', () => { if (dobInput.value) calculateAge(); });

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
})();
