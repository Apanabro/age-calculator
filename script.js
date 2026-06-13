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
        { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
    ];

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const $ = (id) => document.getElementById(id);

    const dobInput = $('dob');
    const calcBtn = $('calculateBtn');
    const pdfBtn = $('pdfBtn');
    const shareBtn = $('shareBtn');
    const copyBtn = $('copyBtn');
    const results = $('results');
    const errorToast = $('errorToast');
    const errorMsg = $('errorMsg');
    const shareToast = $('shareToast');
    const toastMsg = $('toastMsg');

    let errorTimer = null;
    let toastTimer = null;
    let lastResults = null;

    function showError(msg) {
        errorMsg.textContent = msg;
        errorToast.classList.add('show');
        clearTimeout(errorTimer);
        errorTimer = setTimeout(() => errorToast.classList.remove('show'), 3500);
    }

    function hideError() {
        errorToast.classList.remove('show');
        clearTimeout(errorTimer);
    }

    function showToast(msg) {
        toastMsg.textContent = msg;
        shareToast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => shareToast.classList.remove('show'), 2500);
    }

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

    function animateNumber(el, target) {
        const duration = 800;
        const start = performance.now();
        const initial = parseInt(el.textContent) || 0;

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(initial + (target - initial) * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function calculateAge() {
        hideError();
        const val = dobInput.value;

        if (!val) {
            showError('Please select your date of birth');
            dobInput.focus();
            return;
        }

        const dob = new Date(val + 'T00:00:00');
        const today = new Date();

        if (dob >= today) {
            showError('Date of birth must be in the past');
            return;
        }

        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        let days = today.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.floor((today - dob) / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const totalHours = totalDays * 24;
        const totalMinutes = totalHours * 60;

        animateNumber($('ageYears'), years);
        animateNumber($('bdMonths'), months);
        animateNumber($('bdDays'), days);
        animateNumber($('bdHours'), totalHours);
        animateNumber($('bdMinutes'), totalMinutes);

        const progress = Math.min(totalDays / 365.25 / 100, 1);
        const circumference = 2 * Math.PI * 54;
        const offset = circumference * (1 - progress);
        document.querySelector('.ring-progress').style.strokeDashoffset = offset;

        const birthDayName = DAYS[dob.getDay()];
        const zodiac = getZodiac(dob.getMonth() + 1, dob.getDate());

        $('birthDay').textContent = birthDayName;
        $('zodiacSign').textContent = zodiac;
        $('totalDays').textContent = totalDays.toLocaleString();

        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        let nextBirthday = thisYearBirthday;
        if (today > thisYearBirthday) {
            nextBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
        }
        const daysUntilNext = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

        let nextBirthdayText;
        if (daysUntilNext === 0) {
            nextBirthdayText = 'Today!';
        } else if (daysUntilNext === 1) {
            nextBirthdayText = 'Tomorrow';
        } else {
            nextBirthdayText = daysUntilNext + ' days';
        }
        $('nextBirthday').textContent = nextBirthdayText;

        const formattedDob = dob.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        lastResults = {
            dob: formattedDob,
            years, months, days,
            totalDays, totalWeeks, totalHours, totalMinutes,
            birthDayName, zodiac, nextBirthdayText
        };

        results.classList.add('show');
        results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function generatePDF() {
        if (!lastResults) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const w = doc.internal.pageSize.getWidth();
        const h = doc.internal.pageSize.getHeight();

        const grad1 = [124, 92, 255];
        const grad2 = [255, 107, 157];

        for (let i = 0; i < h; i += 0.5) {
            const ratio = i / h;
            const r = Math.round(grad1[0] + (grad2[0] - grad1[0]) * ratio);
            const g = Math.round(grad1[1] + (grad2[1] - grad1[1]) * ratio);
            const b = Math.round(grad1[2] + (grad2[2] - grad1[2]) * ratio);
            doc.setFillColor(r, g, b);
            doc.rect(0, i, w, 0.6, 'F');
        }

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(20, 20, w - 40, h - 40, 8, 8, 'F');

        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.text('Age Certificate', w / 2, 40, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text('Your Life, Precisely Measured', w / 2, 48, { align: 'center' });

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(30, 54, w - 30, 54);

        const leftCol = 35;
        const rightCol = w - 35;
        let y = 66;

        function addRow(label, value) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(140, 140, 140);
            doc.text(label, leftCol, y);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(50, 50, 50);
            doc.text(String(value), rightCol, y, { align: 'right' });
            y += 10;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(124, 92, 255);
        doc.text('Personal Details', leftCol, y);
        y += 10;

        addRow('Date of Birth', lastResults.dob);
        addRow('Day of Birth', lastResults.birthDayName);
        addRow('Zodiac Sign', lastResults.zodiac);

        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(124, 92, 255);
        doc.text('Your Age', leftCol, y);
        y += 10;

        addRow('Years', lastResults.years);
        addRow('Months', lastResults.months);
        addRow('Days', lastResults.days);

        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(124, 92, 255);
        doc.text('Life Stats', leftCol, y);
        y += 10;

        addRow('Total Days', lastResults.totalDays.toLocaleString());
        addRow('Total Weeks', lastResults.totalWeeks.toLocaleString());
        addRow('Total Hours', lastResults.totalHours.toLocaleString());
        addRow('Total Minutes', lastResults.totalMinutes.toLocaleString());

        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 107, 157);
        doc.text('Next Birthday', leftCol, y);
        y += 10;

        addRow('Countdown', lastResults.nextBirthdayText);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(30, y + 4, w - 30, y + 4);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(170, 170, 170);
        doc.text('Generated by Age Calculator', w / 2, h - 26, { align: 'center' });
        doc.text(new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }), w / 2, h - 20, { align: 'center' });

        doc.save('age-certificate.pdf');
        showToast('PDF downloaded!');
    }

    function shareResults() {
        if (!lastResults) return;

        const shareText = `My Age Results\n\n` +
            `Date of Birth: ${lastResults.dob}\n` +
            `Age: ${lastResults.years} years, ${lastResults.months} months, ${lastResults.days} days\n` +
            `Total Days: ${lastResults.totalDays.toLocaleString()}\n` +
            `Zodiac: ${lastResults.zodiac}\n` +
            `Next Birthday: ${lastResults.nextBirthdayText}\n\n` +
            `Calculate yours at Age Calculator`;

        if (navigator.share) {
            navigator.share({
                title: 'My Age Results',
                text: shareText,
            }).then(() => {
                showToast('Shared successfully!');
            }).catch(() => {});
        } else {
            copyToClipboard(shareText);
        }
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        } catch (e) {
            showToast('Could not copy');
        }
        document.body.removeChild(ta);
    }

    function copyResults() {
        if (!lastResults) return;

        const copyText = `My Age Results\n` +
            `DOB: ${lastResults.dob}\n` +
            `Age: ${lastResults.years}y ${lastResults.months}m ${lastResults.days}d\n` +
            `Total: ${lastResults.totalDays.toLocaleString()} days\n` +
            `Zodiac: ${lastResults.zodiac}\n` +
            `Next Birthday: ${lastResults.nextBirthdayText}`;

        copyToClipboard(copyText);
    }

    calcBtn.addEventListener('click', calculateAge);
    pdfBtn.addEventListener('click', generatePDF);
    shareBtn.addEventListener('click', shareResults);
    copyBtn.addEventListener('click', copyResults);

    dobInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') calculateAge();
    });

    dobInput.addEventListener('change', () => {
        if (dobInput.value) {
            calculateAge();
        }
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }
})();
