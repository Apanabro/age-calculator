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

        if (!window.jspdf) {
            showToast('PDF library loading... try again');
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
            s.onload = () => showToast('Ready! Tap PDF again');
            document.head.appendChild(s);
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const w = doc.internal.pageSize.getWidth();
            const h = doc.internal.pageSize.getHeight();

            for (let i = 0; i < h; i += 0.5) {
                const r = Math.round(18 + (236 - 18) * (i / h) * 0.3);
                const g = Math.round(18 + (72 - 18) * (i / h) * 0.3);
                const b = Math.round(34 + (153 - 34) * (i / h) * 0.3);
                doc.setFillColor(r, g, b);
                doc.rect(0, i, w, 0.6, 'F');
            }

            doc.setFillColor(255, 255, 255);
            doc.roundedRect(18, 18, w - 36, h - 36, 6, 6, 'F');

            doc.setTextColor(50, 50, 50);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(26);
            doc.text('Age Master Certificate', w / 2, 38, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(140, 140, 140);
            doc.text('Your Life, Precisely Measured', w / 2, 46, { align: 'center' });

            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.line(28, 52, w - 28, 52);

            const left = 32;
            const right = w - 32;
            let y = 62;

            function row(label, value) {
                doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(150, 150, 150);
                doc.text(label, left, y);
                doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(50, 50, 50);
                doc.text(String(value), right, y, { align: 'right' });
                y += 9;
            }

            function section(title) {
                y += 2;
                doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(168, 85, 247);
                doc.text(title, left, y);
                y += 9;
            }

            const today = new Date();
            const dobStr = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            let years = today.getFullYear() - dobDate.getFullYear();
            let months = today.getMonth() - dobDate.getMonth();
            let days = today.getDate() - dobDate.getDate();
            if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
            if (months < 0) { years--; months += 12; }
            const totalDays = Math.floor((today - dobDate) / 86400000);

            section('Personal Details');
            row('Date of Birth', dobStr);
            row('Day of Birth', DAYS[dobDate.getDay()]);
            row('Zodiac Sign', getZodiac(dobDate.getMonth() + 1, dobDate.getDate()));

            section('Current Age');
            row('Years', years);
            row('Months', months);
            row('Days', days);

            section('Life Stats');
            row('Total Days', formatNumber(totalDays));
            row('Total Hours', formatNumber(totalDays * 24));
            row('Total Minutes', formatNumber(totalDays * 24 * 60));

            doc.setDrawColor(220, 220, 220);
            doc.line(28, y + 4, w - 28, y + 4);

            doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(180, 180, 180);
            doc.text('Generated by Age Master', w / 2, h - 24, { align: 'center' });
            doc.text(today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), w / 2, h - 18, { align: 'center' });

            doc.save('age-master-certificate.pdf');
            showToast('PDF downloaded!');
        } catch (err) {
            showToast('PDF error — try Share instead');
        }
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
