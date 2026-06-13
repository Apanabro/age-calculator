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

        var cert = document.getElementById('printCert');
        cert.innerHTML = '' +
            '<h1>Age Master Certificate</h1>' +
            '<p class="psub">Your Life, Precisely Measured</p><hr>' +
            '<h2>Personal Details</h2>' +
            '<div class="prow"><span class="plbl">Date of Birth</span><span class="pval">' + dobStr + '</span></div>' +
            '<div class="prow"><span class="plbl">Day of Birth</span><span class="pval">' + bornDay + '</span></div>' +
            '<div class="prow"><span class="plbl">Zodiac Sign</span><span class="pval">' + zodiac + '</span></div>' +
            '<h2>Current Age</h2>' +
            '<div class="prow"><span class="plbl">Years</span><span class="pval">' + y + '</span></div>' +
            '<div class="prow"><span class="plbl">Months</span><span class="pval">' + m + '</span></div>' +
            '<div class="prow"><span class="plbl">Days</span><span class="pval">' + d + '</span></div>' +
            '<h2>Life Stats</h2>' +
            '<div class="prow"><span class="plbl">Total Days</span><span class="pval">' + formatNumber(totalDays) + '</span></div>' +
            '<div class="prow"><span class="plbl">Total Hours</span><span class="pval">' + formatNumber(totalDays * 24) + '</span></div>' +
            '<div class="prow"><span class="plbl">Total Minutes</span><span class="pval">' + formatNumber(totalDays * 24 * 60) + '</span></div>' +
            '<hr>' +
            '<p class="pfooter">Generated by Age Master &bull; ' + now + '</p>';

        window.print();
        showToast('Choose "Save as PDF" in print dialog');
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
