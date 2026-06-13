(function () {
    'use strict';

    var API_BASE = (location.hostname === 'localhost' || location.protocol === 'file:')
        ? 'http://localhost:3000/api'
        : 'https://age-calculator-zybq.onrender.com/api';

    var ZODIAC = [
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

    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var CERT_COLORS = { title: [0.6588, 0.3333, 0.9255], section: [0.6588, 0.3333, 0.9255] };

    var $ = function (id) { return document.getElementById(id); };

    var dobInput = $('dob');
    var nameInput = $('userName');
    var calcBtn = $('calculateBtn');
    var resultsSection = $('resultsSection');
    var errorToast = $('errorToast');
    var errorMsg = $('errorMsg');
    var toast = $('toast');
    var toastMsg = $('toastMsg');

    var errorTimer = null;
    var toastTimer = null;
    var liveTimer = null;
    var dobDate = null;
    var userName = '';

    function getSession() {
        try { return JSON.parse(localStorage.getItem('ageMaster_session')); } catch (e) { return null; }
    }

    function isPremium() {
        if (isPremiumUnlocked()) return true;
        var session = getSession();
        if (session && session.email === 'jy306648@gmail.com') {
            localStorage.setItem('ageMaster_premium', 'lifetime');
            return true;
        }
        try {
            var p = localStorage.getItem('ageMaster_premium');
            return (p === 'true' || p === 'lifetime');
        } catch (e) { return false; }
    }

    function isPremiumUnlocked() {
        try {
            var p = localStorage.getItem('ageMaster_premium');
            return (p === 'true' || p === 'lifetime');
        } catch (e) { return false; }
    }

    function init() {
        var session = getSession();
        var profileBtn = $('profileBtn');
        if (session && session.loggedIn) {
            profileBtn.href = 'dashboard.html';
            profileBtn.classList.add('premium-active');
            nameInput.value = session.name || '';
        }

        if (isPremiumUnlocked()) {
            var pdfBadge = document.querySelector('.pdf-btn .pro-badge');
            if (pdfBadge) pdfBadge.style.display = 'none';
        }
    }

    function getZodiac(month, day) {
        for (var i = 0; i < ZODIAC.length; i++) {
            var z = ZODIAC[i];
            var sm = z.start[0], sd = z.start[1];
            var em = z.end[0], ed = z.end[1];
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
        errorTimer = setTimeout(function () { errorToast.classList.remove('show'); }, 3000);
    }

    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
    }

    function formatNumber(n) {
        return n.toLocaleString();
    }

    function updateLiveMeter() {
        if (!dobDate) return;
        var now = new Date();
        var diff = now - dobDate;
        var totalSeconds = Math.floor(diff / 1000);
        var totalMinutes = Math.floor(totalSeconds / 60);
        var totalHours = Math.floor(totalMinutes / 60);
        var totalDays = Math.floor(totalHours / 24);
        $('liveDays').textContent = formatNumber(totalDays);
        $('liveHours').textContent = formatNumber(totalHours);
        $('liveMinutes').textContent = formatNumber(totalMinutes);
        $('liveSeconds').textContent = formatNumber(totalSeconds % 60);
    }

    function calculateAge() {
        errorToast.classList.remove('show');
        clearTimeout(errorTimer);
        var val = dobInput.value;
        if (!val) {
            showError('Please select your date of birth');
            dobInput.focus();
            return;
        }
        dobDate = new Date(val + 'T00:00:00');
        userName = nameInput.value.trim() || 'User';
        var today = new Date();
        if (dobDate >= today) {
            showError('Date of birth must be in the past');
            return;
        }
        var years = today.getFullYear() - dobDate.getFullYear();
        var months = today.getMonth() - dobDate.getMonth();
        var days = today.getDate() - dobDate.getDate();
        if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        var totalDays = Math.floor((today - dobDate) / (1000 * 60 * 60 * 24));
        var totalHours = totalDays * 24;
        var totalMinutes = totalHours * 60;
        $('meterYears').textContent = years;
        $('bdMonths').textContent = months;
        $('bdDays').textContent = days;
        $('bdHours').textContent = formatNumber(totalHours);
        $('bdMinutes').textContent = formatNumber(totalMinutes);
        var circumference = 2 * Math.PI * 62;
        var progress = Math.min(years / 100, 1);
        document.querySelector('.meter-ring-progress').style.strokeDashoffset = circumference * (1 - progress);
        $('birthDay').textContent = DAYS[dobDate.getDay()];
        $('zodiacSign').textContent = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        $('totalDays').textContent = formatNumber(totalDays);
        var thisYearBday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
        var nextBday = thisYearBday;
        if (today > thisYearBday) { nextBday = new Date(today.getFullYear() + 1, dobDate.getMonth(), dobDate.getDate()); }
        var daysUntil = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
        var yearSpan = Math.ceil((nextBday - thisYearBday) / (1000 * 60 * 60 * 24)) || 365;
        var bdayPercent = Math.round(((yearSpan - daysUntil) / yearSpan) * 100);
        if (daysUntil === 0) { $('nextBirthday').textContent = "It's Today!"; }
        else if (daysUntil === 1) { $('nextBirthday').textContent = 'Tomorrow!'; }
        else { $('nextBirthday').textContent = daysUntil + ' days away'; }
        $('countdownFill').style.width = bdayPercent + '%';
        updateLiveMeter();
        if (liveTimer) clearInterval(liveTimer);
        liveTimer = setInterval(updateLiveMeter, 1000);
        resultsSection.classList.add('show');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function openPremiumModal() {
        $('premiumModal').style.display = 'flex';
        document.querySelectorAll('.plan-option').forEach(function (el) { el.classList.remove('selected'); });
        document.querySelector('.plan-option[data-plan="monthly"]').classList.add('selected');
    }

    function closePremiumModal() {
        $('premiumModal').style.display = 'none';
    }


    function generatePDF() {
        if (!dobDate) return;
        var currentName = nameInput.value.trim() || userName || 'User';
        var today = new Date();
        var y = today.getFullYear() - dobDate.getFullYear();
        var m = today.getMonth() - dobDate.getMonth();
        var d = today.getDate() - dobDate.getDate();
        if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        var totalDays = Math.floor((today - dobDate) / 86400000);
        var dobStr = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        var zodiac = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        var bornDay = DAYS[dobDate.getDay()];
        var now = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        var measurer = document.createElement('canvas').getContext('2d');
        function textWidth(text, size) {
            measurer.font = size + 'px Helvetica, Arial, sans-serif';
            return measurer.measureText(text).width;
        }

        var objs = [];
        function obj() { objs.push(''); return objs.length; }
        function setObj(n, content) { objs[n - 1] = content; }

        var catalog = obj();
        var pages = obj();
        var font = obj();
        var page = obj();
        var content = obj();

        var lines = [];
        function ln(text) { lines.push(text); }
        var pdfW = 595;

        var tr = CERT_COLORS.title[0].toFixed(4) + ' ' + CERT_COLORS.title[1].toFixed(4) + ' ' + CERT_COLORS.title[2].toFixed(4);
        var sr = CERT_COLORS.section[0].toFixed(4) + ' ' + CERT_COLORS.section[1].toFixed(4) + ' ' + CERT_COLORS.section[2].toFixed(4);

        var certTitle = 'Age Master Certificate';
        var subtitle = 'Your Life, Precisely Measured';

        ln('BT');
        ln('/F1 26 Tf');
        ln(tr + ' rg');
        var tw28 = textWidth(certTitle, 26);
        ln(((pdfW - tw28) / 2).toFixed(1) + ' 770 Td');
        ln('(' + certTitle + ') Tj');
        ln('ET');

        ln('BT');
        ln('/F1 12 Tf');
        ln('0.4 0.4 0.4 rg');
        var tw13 = textWidth(subtitle, 12);
        ln(((pdfW - tw13) / 2).toFixed(1) + ' 750 Td');
        ln('(' + subtitle + ') Tj');
        ln('ET');

        ln('0.85 0.85 0.85 RG');
        ln('0.6 w');
        ln('40 737 m 560 737 l S');

        function sh(text, yPos) {
            ln('BT');
            ln('/F1 10 Tf');
            ln(sr + ' rg');
            ln('50 ' + yPos + ' Td');
            ln('(' + text + ') Tj');
            ln('ET');
        }

        function dr(label, value, yPos) {
            ln('BT');
            ln('/F1 12 Tf');
            ln('0.5 0.5 0.5 rg');
            ln('50 ' + yPos + ' Td');
            ln('(' + label + ') Tj');
            ln('ET');
            var vw = textWidth(value, 13);
            ln('BT');
            ln('/F1 13 Tf');
            ln('0.1 0.1 0.18 rg');
            ln(((pdfW - 50 - vw).toFixed(1)) + ' ' + yPos + ' Td');
            ln('(' + value + ') Tj');
            ln('ET');
            ln('0.9 0.9 0.9 RG');
            ln('0.3 w');
            ln('50 ' + (yPos - 12) + ' m 560 ' + (yPos - 12) + ' l S');
        }

        sh('PERSONAL DETAILS', 700);
        dr('Name', currentName, 678);
        dr('Date of Birth', dobStr, 648);
        dr('Day of Birth', bornDay, 618);
        dr('Zodiac Sign', zodiac, 588);

        sh('CURRENT AGE', 548);
        dr('Years', String(y), 526);
        dr('Months', String(m), 496);
        dr('Days', String(d), 466);

        sh('LIFE STATS', 426);
        dr('Total Days', formatNumber(totalDays), 404);
        dr('Total Hours', formatNumber(totalDays * 24), 374);
        dr('Total Minutes', formatNumber(totalDays * 24 * 60), 344);

        if (!isPremium()) {
            ln('BT');
            ln('/F1 14 Tf');
            ln('0.8 0.8 0.8 rg');
            var wmText = 'Age Master - Free Version';
            var wmW = textWidth(wmText, 14);
            ln(((pdfW - wmW) / 2).toFixed(1) + ' 460 Td');
            ln('(' + wmText + ') Tj');
            ln('ET');
        }

        ln('0.85 0.85 0.85 RG');
        ln('0.6 w');
        ln('40 320 m 560 320 l S');

        ln('BT');
        ln('/F1 9 Tf');
        ln('0.6 0.6 0.6 rg');
        var footer = 'Generated by Age Master - ' + now;
        var tw9 = textWidth(footer, 9);
        ln(((pdfW - tw9) / 2).toFixed(1) + ' 305 Td');
        ln('(' + footer + ') Tj');
        ln('ET');

        var stream = lines.join('\n');
        setObj(catalog, '<< /Type /Catalog /Pages ' + pages + ' 0 R >>');
        setObj(pages, '<< /Type /Pages /Kids [' + page + ' 0 R] /Count 1 >>');
        setObj(font, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        setObj(page, '<< /Type /Page /Parent ' + pages + ' 0 R /MediaBox [0 0 595 842] /Contents ' + content + ' 0 R /Resources << /Font << /F1 ' + font + ' 0 R >> >> >>');
        setObj(content, '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');

        var pdf = '%PDF-1.4\n';
        var offsetMap = [];
        for (var i = 0; i < objs.length; i++) {
            offsetMap.push(pdf.length);
            pdf += (i + 1) + ' 0 obj\n' + objs[i] + '\nendobj\n\n';
        }
        var xrefStart = pdf.length;
        pdf += 'xref\n';
        pdf += '0 ' + (objs.length + 1) + '\n';
        pdf += '0000000000 65535 f \n';
        for (var j = 0; j < offsetMap.length; j++) {
            pdf += String(offsetMap[j]).padStart(10, '0') + ' 00000 n \n';
        }
        pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + catalog + ' 0 R >>\n';
        pdf += 'startxref\n' + xrefStart + '\n%%EOF';

        var blob = new Blob([pdf], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'AgeMaster_' + currentName.replace(/\s+/g, '_') + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('PDF downloaded!');
    }

    function shareResults() {
        if (!dobDate) return;
        var today = new Date();
        var y = today.getFullYear() - dobDate.getFullYear();
        var m = today.getMonth() - dobDate.getMonth();
        var d = today.getDate() - dobDate.getDate();
        if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        var text = 'Age Master Results\n\n' +
            'Name: ' + userName + '\n' +
            'DOB: ' + dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '\n' +
            'Age: ' + y + ' years, ' + m + ' months, ' + d + ' days\n' +
            'Zodiac: ' + getZodiac(dobDate.getMonth() + 1, dobDate.getDate()) + '\n' +
            'Born on: ' + DAYS[dobDate.getDay()] + '\n\n' +
            'Calculate yours -> apanabro.github.io/age-calculator/';
        if (navigator.share) {
            navigator.share({ title: 'Age Master Results', text: text }).catch(function () {});
        } else {
            copyToClipboard(text);
        }
    }

    function copyResults() {
        if (!dobDate) return;
        var today = new Date();
        var y = today.getFullYear() - dobDate.getFullYear();
        var m = today.getMonth() - dobDate.getMonth();
        var d = today.getDate() - dobDate.getDate();
        if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        var text = 'Age Master: ' + userName + '\n' + y + 'y ' + m + 'm ' + d + 'd\nZodiac: ' + getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        copyToClipboard(text);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { showToast('Copied!'); }).catch(function () { fallbackCopy(text); });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('Copied!'); } catch (e) { showToast('Failed'); }
        document.body.removeChild(ta);
    }

    function showCertPreview() {
        if (!dobDate) return;
        var currentName = nameInput.value.trim() || userName || 'User';
        var today = new Date();
        var y = today.getFullYear() - dobDate.getFullYear();
        var m = today.getMonth() - dobDate.getMonth();
        var d = today.getDate() - dobDate.getDate();
        if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        var totalDays = Math.floor((today - dobDate) / 86400000);
        var dobStr = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        var zodiac = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        var bornDay = DAYS[dobDate.getDay()];

        $('cpName').textContent = currentName;
        $('cpDob').textContent = dobStr;
        $('cpDay').textContent = bornDay;
        $('cpZodiac').textContent = zodiac;
        $('cpYears').textContent = y;
        $('cpMonths').textContent = m;
        $('cpDays').textContent = d;
        $('cpTotalDays').textContent = formatNumber(totalDays);
        $('cpTotalHours').textContent = formatNumber(totalDays * 24);
        $('cpTotalMinutes').textContent = formatNumber(totalDays * 24 * 60);

        $('certPreviewModal').style.display = 'flex';
    }

    calcBtn.addEventListener('click', calculateAge);
    $('shareBtn').addEventListener('click', shareResults);
    $('copyBtn').addEventListener('click', copyResults);
    $('topShareBtn').addEventListener('click', shareResults);

    $('pdfBtn').addEventListener('click', function () {
        if (!dobDate) return;
        if (!isPremium()) { openPremiumModal(); return; }
        showCertPreview();
    });

    document.querySelectorAll('.plan-option').forEach(function (el) {
        el.addEventListener('click', function () {
            document.querySelectorAll('.plan-option').forEach(function (o) { o.classList.remove('selected'); });
            el.classList.add('selected');
        });
    });

    $('unlockBtn').addEventListener('click', function () {
        var selected = document.querySelector('.plan-option.selected');
        var plan = selected ? selected.getAttribute('data-plan') : 'monthly';
        localStorage.setItem('ageMaster_premium', plan === 'single' ? 'true' : 'lifetime');
        closePremiumModal();
        showToast('Premium unlocked!');
        var pdfBadge = document.querySelector('.pdf-btn .pro-badge');
        if (pdfBadge) pdfBadge.style.display = 'none';
    });


    $('closePremiumModal').addEventListener('click', closePremiumModal);
    $('closeHdModal').addEventListener('click', function () { $('hdModal').style.display = 'none'; });
    $('closeCertPreview').addEventListener('click', function () { $('certPreviewModal').style.display = 'none'; });
    $('certDownloadBtn').addEventListener('click', function () { $('certPreviewModal').style.display = 'none'; generatePDF(); });

    $('premiumModal').addEventListener('click', function (e) { if (e.target === $('premiumModal')) closePremiumModal(); });
    $('certPreviewModal').addEventListener('click', function (e) { if (e.target === $('certPreviewModal')) $('certPreviewModal').style.display = 'none'; });
    $('hdModal').addEventListener('click', function (e) { if (e.target === $('hdModal')) $('hdModal').style.display = 'none'; });

    dobInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculateAge(); });
    dobInput.addEventListener('change', function () { if (dobInput.value) calculateAge(); });

    document.querySelectorAll('.nav-item').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.nav-item').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }

    init();
})();
