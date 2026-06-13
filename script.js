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

    var CHINESE_ZODIAC = ['Monkey','Rooster','Dog','Pig','Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat'];
    var BIRTHSTONES = ['Garnet','Amethyst','Aquamarine','Diamond','Emerald','Alexandrite','Ruby','Peridot','Sapphire','Opal','Topaz','Tanzanite'];
    var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var CERT_COLORS = { title: [0.6588, 0.3333, 0.9255], section: [0.6588, 0.3333, 0.9255] };

    var $ = function (id) { return document.getElementById(id); };
    var dobInput = $('dob');
    var ageAtDateInput = $('ageAtDate');
    var nameInput = $('userName');
    var calcBtn = $('calculateBtn');
    var resultsSection = $('resultsSection');
    var errorToast = $('errorToast');
    var errorMsg = $('errorMsg');
    var toast = $('toast');
    var toastMsg = $('toastMsg');

    var errorTimer = null, toastTimer = null, liveTimer = null, cdTimer = null;
    var dobDate = null, userName = '', calcAgeAt = null;

    function getSession() { try { return JSON.parse(localStorage.getItem('ageMaster_session')); } catch (e) { return null; } }
    function isPremiumUnlocked() { try { var p = localStorage.getItem('ageMaster_premium'); return (p === 'true' || p === 'lifetime'); } catch (e) { return false; } }
    function isPremium() {
        if (isPremiumUnlocked()) return true;
        var session = getSession();
        if (session && session.email === 'jy306648@gmail.com') { localStorage.setItem('ageMaster_premium', 'lifetime'); return true; }
        return false;
    }

    function init() {
        var session = getSession();
        var profileBtn = $('profileBtn');
        if (session && session.loggedIn) { profileBtn.href = 'dashboard.html'; profileBtn.classList.add('premium-active'); nameInput.value = session.name || ''; }
        if (isPremiumUnlocked()) { var b = document.querySelector('.pdf-btn .pro-badge'); if (b) b.style.display = 'none'; }
    }

    function getZodiac(month, day) {
        for (var i = 0; i < ZODIAC.length; i++) {
            var z = ZODIAC[i], sm = z.start[0], sd = z.start[1], em = z.end[0], ed = z.end[1];
            if (sm === 12) { if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return z.sign; }
            else { if ((month === sm && day >= sd) || (month === em && day <= ed)) return z.sign; }
        }
        return 'Capricorn';
    }

    function getChineseZodiac(year) { return CHINESE_ZODIAC[year % 12]; }
    function getBirthstone(month) { return BIRTHSTONES[month - 1]; }
    function formatNumber(n) { return n.toLocaleString(); }

    function showError(msg) { errorMsg.textContent = msg; errorToast.classList.add('show'); clearTimeout(errorTimer); errorTimer = setTimeout(function () { errorToast.classList.remove('show'); }, 3000); }
    function showToast(msg) { toastMsg.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000); }

    function computeAge(from, to) {
        var y = to.getFullYear() - from.getFullYear();
        var m = to.getMonth() - from.getMonth();
        var d = to.getDate() - from.getDate();
        if (d < 0) { m--; d += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        var totalMs = to - from;
        var totalDays = Math.floor(totalMs / 86400000);
        var totalWeeks = Math.floor(totalDays / 7);
        var totalHours = totalDays * 24;
        var totalMinutes = totalHours * 60;
        var totalSeconds = Math.floor(totalMs / 1000);
        return { years: y, months: m, days: d, totalDays: totalDays, totalWeeks: totalWeeks, totalHours: totalHours, totalMinutes: totalMinutes, totalSeconds: totalSeconds };
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

    function updateCountdown() {
        if (!dobDate) return;
        var now = new Date();
        var thisYearBday = new Date(now.getFullYear(), dobDate.getMonth(), dobDate.getDate());
        var nextBday = now > thisYearBday ? new Date(now.getFullYear() + 1, dobDate.getMonth(), dobDate.getDate()) : thisYearBday;
        var diff = nextBday - now;
        var cdSec = Math.floor(diff / 1000);
        var cdMin = Math.floor(cdSec / 60);
        var cdHrs = Math.floor(cdMin / 60);
        var cdDays = Math.floor(cdHrs / 24);
        $('cdDays').textContent = cdDays;
        $('cdHours').textContent = cdHrs % 24;
        $('cdMinutes').textContent = cdMin % 60;
        $('cdSeconds').textContent = cdSec % 60;
    }

    function calculateAge() {
        errorToast.classList.remove('show');
        clearTimeout(errorTimer);
        var val = dobInput.value;
        if (!val) { showError('Please select your date of birth'); dobInput.focus(); return; }
        dobDate = new Date(val + 'T00:00:00');
        userName = nameInput.value.trim() || 'User';
        var refDate = new Date();
        var ageAtVal = ageAtDateInput.value;
        if (ageAtVal) {
            calcAgeAt = new Date(ageAtVal + 'T00:00:00');
            if (calcAgeAt < dobDate) { showError('Age-at date must be after date of birth'); return; }
            refDate = calcAgeAt;
        } else {
            calcAgeAt = null;
            if (dobDate >= refDate) { showError('Date of birth must be in the past'); return; }
        }

        var age = computeAge(dobDate, refDate);
        $('meterYears').textContent = age.years;
        $('bdYears').textContent = age.years;
        $('bdMonths').textContent = age.months;
        $('bdWeeks').textContent = formatNumber(age.totalWeeks);
        $('bdDays').textContent = age.days;
        $('bdHours').textContent = formatNumber(age.totalHours);
        $('bdMinutes').textContent = formatNumber(age.totalMinutes);
        $('bdSeconds').textContent = formatNumber(age.totalSeconds);

        var circumference = 2 * Math.PI * 62;
        var progress = Math.min(age.years / 100, 1);
        document.querySelector('.meter-ring-progress').style.strokeDashoffset = circumference * (1 - progress);

        $('birthDay').textContent = DAYS[dobDate.getDay()];
        $('zodiacSign').textContent = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        $('chineseZodiac').textContent = getChineseZodiac(dobDate.getFullYear()) + ' (' + getChineseZodiac(dobDate.getFullYear()) + ')';
        $('birthstone').textContent = getBirthstone(dobDate.getMonth() + 1);
        $('totalDays').textContent = formatNumber(age.totalDays);

        // Fun stats
        var weekends = Math.floor(age.totalDays / 7) + (dobDate.getDay() === 0 || dobDate.getDay() === 6 ? 1 : 0);
        $('funWeekends').textContent = formatNumber(Math.floor(age.totalDays * 52 / 365));
        $('funHeartbeats').textContent = '~' + formatNumber(Math.floor(age.totalMinutes * 72));
        $('funBreaths').textContent = '~' + formatNumber(Math.floor(age.totalMinutes * 16));
        $('funMeals').textContent = '~' + formatNumber(Math.floor(age.totalDays * 3));
        $('funSleeps').textContent = formatNumber(age.totalDays);
        $('funBooks').textContent = '~' + formatNumber(Math.floor(age.totalDays * 24 / 8 / 300));

        // Birthday countdown
        var thisYearBday = new Date(refDate.getFullYear(), dobDate.getMonth(), dobDate.getDate());
        var nextBday = refDate > thisYearBday ? new Date(refDate.getFullYear() + 1, dobDate.getMonth(), dobDate.getDate()) : thisYearBday;
        var daysUntil = Math.ceil((nextBday - refDate) / 86400000);
        var yearSpan = Math.ceil((nextBday - thisYearBday) / 86400000) || 365;
        var bdayPercent = Math.round(((yearSpan - daysUntil) / yearSpan) * 100);
        if (daysUntil === 0) { $('nextBirthday').textContent = "It's Today!"; }
        else if (daysUntil === 1) { $('nextBirthday').textContent = 'Tomorrow!'; }
        else { $('nextBirthday').textContent = daysUntil + ' days away'; }
        $('countdownFill').style.width = bdayPercent + '%';

        updateLiveMeter();
        if (liveTimer) clearInterval(liveTimer);
        liveTimer = setInterval(updateLiveMeter, 1000);
        if (cdTimer) clearInterval(cdTimer);
        updateCountdown();
        cdTimer = setInterval(updateCountdown, 1000);

        resultsSection.classList.add('show');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function openPremiumModal() { $('premiumModal').style.display = 'flex'; document.querySelectorAll('.plan-option').forEach(function (el) { el.classList.remove('selected'); }); document.querySelector('.plan-option[data-plan="monthly"]').classList.add('selected'); }
    function closePremiumModal() { $('premiumModal').style.display = 'none'; }

    function generatePDF() {
        if (!dobDate) return;
        var currentName = nameInput.value.trim() || userName || 'User';
        var refDate = calcAgeAt || new Date();
        var age = computeAge(dobDate, refDate);
        var dobStr = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        var refStr = refDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        var zodiac = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        var cnZodiac = getChineseZodiac(dobDate.getFullYear());
        var birthstone = getBirthstone(dobDate.getMonth() + 1);
        var bornDay = DAYS[dobDate.getDay()];
        var now = refDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        var measurer = document.createElement('canvas').getContext('2d');
        function tw(text, size) { measurer.font = size + 'px Helvetica, Arial, sans-serif'; return measurer.measureText(text).width; }

        var objs = [];
        function obj() { objs.push(''); return objs.length; }
        function setObj(n, content) { objs[n - 1] = content; }
        var catalog = obj(), pages = obj(), font = obj(), page = obj(), content = obj();
        var lines = [];
        function ln(text) { lines.push(text); }
        var pdfW = 595;
        var tr = CERT_COLORS.title[0].toFixed(4) + ' ' + CERT_COLORS.title[1].toFixed(4) + ' ' + CERT_COLORS.title[2].toFixed(4);
        var sr = CERT_COLORS.section[0].toFixed(4) + ' ' + CERT_COLORS.section[1].toFixed(4) + ' ' + CERT_COLORS.section[2].toFixed(4);

        ln('BT'); ln('/F1 26 Tf'); ln(tr + ' rg');
        var t = 'Age Master Certificate'; ln(((pdfW - tw(t, 26)) / 2).toFixed(1) + ' 780 Td'); ln('(' + t + ') Tj'); ln('ET');
        ln('BT'); ln('/F1 11 Tf'); ln('0.4 0.4 0.4 rg');
        var sub = calcAgeAt ? 'Age as of ' + refStr : 'Your Life, Precisely Measured';
        ln(((pdfW - tw(sub, 11)) / 2).toFixed(1) + ' 762 Td'); ln('(' + sub + ') Tj'); ln('ET');
        ln('0.85 0.85 0.85 RG'); ln('0.6 w'); ln('40 750 m 560 750 l S');

        function sh(text, yPos) { ln('BT'); ln('/F1 10 Tf'); ln(sr + ' rg'); ln('50 ' + yPos + ' Td'); ln('(' + text + ') Tj'); ln('ET'); }
        function dr(label, value, yPos) {
            ln('BT'); ln('/F1 11 Tf'); ln('0.5 0.5 0.5 rg'); ln('50 ' + yPos + ' Td'); ln('(' + label + ') Tj'); ln('ET');
            var vw = tw(value, 12);
            ln('BT'); ln('/F1 12 Tf'); ln('0.1 0.1 0.18 rg'); ln(((pdfW - 50 - vw).toFixed(1)) + ' ' + yPos + ' Td'); ln('(' + value + ') Tj'); ln('ET');
            ln('0.9 0.9 0.9 RG'); ln('0.3 w'); ln('50 ' + (yPos - 10) + ' m 560 ' + (yPos - 10) + ' l S');
        }

        sh('PERSONAL DETAILS', 728);
        dr('Name', currentName, 710);
        dr('Date of Birth', dobStr, 690);
        dr('Day of Birth', bornDay, 670);
        dr('Zodiac Sign', zodiac, 650);
        dr('Chinese Zodiac', cnZodiac, 630);
        dr('Birthstone', birthstone, 610);

        sh('AGE' + (calcAgeAt ? ' (as of ' + refStr + ')' : ''), 580);
        dr('Years', String(age.years), 562);
        dr('Months', String(age.months), 542);
        dr('Weeks', formatNumber(age.totalWeeks), 522);
        dr('Days', formatNumber(age.totalDays), 502);

        sh('LIFE STATS', 472);
        dr('Total Hours', formatNumber(age.totalHours), 454);
        dr('Total Minutes', formatNumber(age.totalMinutes), 434);
        dr('Total Seconds', formatNumber(age.totalSeconds), 414);

        if (!isPremium()) {
            ln('BT'); ln('/F1 14 Tf'); ln('0.8 0.8 0.8 rg');
            var wm = 'Age Master - Free Version'; ln(((pdfW - tw(wm, 14)) / 2).toFixed(1) + ' 390 Td'); ln('(' + wm + ') Tj'); ln('ET');
        }

        ln('0.85 0.85 0.85 RG'); ln('0.6 w'); ln('40 375 m 560 375 l S');
        ln('BT'); ln('/F1 8 Tf'); ln('0.6 0.6 0.6 rg');
        var footer = 'Generated by Age Master - ' + now; ln(((pdfW - tw(footer, 8)) / 2).toFixed(1) + ' 360 Td'); ln('(' + footer + ') Tj'); ln('ET');

        var stream = lines.join('\n');
        setObj(catalog, '<< /Type /Catalog /Pages ' + pages + ' 0 R >>');
        setObj(pages, '<< /Type /Pages /Kids [' + page + ' 0 R] /Count 1 >>');
        setObj(font, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        setObj(page, '<< /Type /Page /Parent ' + pages + ' 0 R /MediaBox [0 0 595 842] /Contents ' + content + ' 0 R /Resources << /Font << /F1 ' + font + ' 0 R >> >> >>');
        setObj(content, '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');

        var pdf = '%PDF-1.4\n'; var offsetMap = [];
        for (var i = 0; i < objs.length; i++) { offsetMap.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + objs[i] + '\nendobj\n\n'; }
        var xrefStart = pdf.length;
        pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
        for (var j = 0; j < offsetMap.length; j++) { pdf += String(offsetMap[j]).padStart(10, '0') + ' 00000 n \n'; }
        pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + catalog + ' 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF';

        var blob = new Blob([pdf], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url;
        a.download = 'AgeMaster_' + currentName.replace(/\s+/g, '_') + '.pdf';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showToast('PDF downloaded!');
    }

    function shareResults() {
        if (!dobDate) return;
        var refDate = calcAgeAt || new Date();
        var age = computeAge(dobDate, refDate);
        var text = 'Age Master Results\n\nName: ' + userName + '\nDOB: ' + dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
            '\nAge: ' + age.years + ' years, ' + age.months + ' months, ' + age.days + ' days\nWeeks: ' + age.totalWeeks +
            '\nZodiac: ' + getZodiac(dobDate.getMonth() + 1, dobDate.getDate()) +
            '\nChinese Zodiac: ' + getChineseZodiac(dobDate.getFullYear()) +
            '\nBirthstone: ' + getBirthstone(dobDate.getMonth() + 1) +
            '\nBorn on: ' + DAYS[dobDate.getDay()] +
            '\n\nCalculate yours -> apanabro.github.io/age-calculator/';
        if (navigator.share) { navigator.share({ title: 'Age Master Results', text: text }).catch(function () {}); } else { copyToClipboard(text); }
    }

    function copyResults() {
        if (!dobDate) return;
        var refDate = calcAgeAt || new Date();
        var age = computeAge(dobDate, refDate);
        var text = 'Age Master: ' + userName + '\n' + age.years + 'y ' + age.months + 'm ' + age.days + 'd\nWeeks: ' + age.totalWeeks + '\nZodiac: ' + getZodiac(dobDate.getMonth() + 1, dobDate.getDate()) + '\nChinese: ' + getChineseZodiac(dobDate.getFullYear());
        copyToClipboard(text);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { showToast('Copied!'); }).catch(function () { fallbackCopy(text); }); } else { fallbackCopy(text); }
    }
    function fallbackCopy(text) {
        var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showToast('Copied!'); } catch (e) { showToast('Failed'); }
        document.body.removeChild(ta);
    }

    function showCertPreview() {
        if (!dobDate) return;
        var currentName = nameInput.value.trim() || userName || 'User';
        var refDate = calcAgeAt || new Date();
        var age = computeAge(dobDate, refDate);
        $('cpName').textContent = currentName;
        $('cpDob').textContent = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        $('cpDay').textContent = DAYS[dobDate.getDay()];
        $('cpZodiac').textContent = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
        $('cpChineseZodiac').textContent = getChineseZodiac(dobDate.getFullYear());
        $('cpBirthstone').textContent = getBirthstone(dobDate.getMonth() + 1);
        $('cpYears').textContent = age.years;
        $('cpMonths').textContent = age.months;
        $('cpWeeks').textContent = formatNumber(age.totalWeeks);
        $('cpDays').textContent = age.days;
        $('cpTotalDays').textContent = formatNumber(age.totalDays);
        $('cpTotalHours').textContent = formatNumber(age.totalHours);
        $('cpTotalMinutes').textContent = formatNumber(age.totalMinutes);
        $('cpTotalSeconds').textContent = formatNumber(age.totalSeconds);
        $('certPreviewModal').style.display = 'flex';
    }

    // Date Difference Calculator
    function calculateDateDiff() {
        var s = $('dateDiffStart').value, e = $('dateDiffEnd').value;
        if (!s || !e) { $('dateDiffError').classList.add('show'); $('dateDiffErrorMsg').textContent = 'Please select both dates'; clearTimeout(errorTimer); errorTimer = setTimeout(function () { $('dateDiffError').classList.remove('show'); }, 3000); return; }
        var start = new Date(s + 'T00:00:00'), end = new Date(e + 'T00:00:00');
        if (start > end) { var tmp = start; start = end; end = tmp; }
        var age = computeAge(start, end);
        $('ddYears').textContent = age.years;
        $('ddMonths').textContent = age.months;
        $('ddDays').textContent = age.days;
        $('ddTotalDays').textContent = formatNumber(age.totalDays);
        $('ddWeeks').textContent = formatNumber(age.totalWeeks);
        $('ddTotalHours').textContent = formatNumber(age.totalHours);
        $('dateDiffResults').style.display = 'block';
        $('dateDiffResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Tab switching
    $('tabAge').addEventListener('click', function () {
        $('tabAge').classList.add('active'); $('tabDateDiff').classList.remove('active');
        $('tabContentAge').style.display = 'block'; $('tabContentDateDiff').style.display = 'none';
    });
    $('tabDateDiff').addEventListener('click', function () {
        $('tabDateDiff').classList.add('active'); $('tabAge').classList.remove('active');
        $('tabContentDateDiff').style.display = 'block'; $('tabContentAge').style.display = 'none';
    });

    calcBtn.addEventListener('click', calculateAge);
    $('dateDiffBtn').addEventListener('click', calculateDateDiff);
    $('shareBtn').addEventListener('click', shareResults);
    $('copyBtn').addEventListener('click', copyResults);
    $('topShareBtn').addEventListener('click', shareResults);
    $('pdfBtn').addEventListener('click', function () { if (!dobDate) return; if (!isPremium()) { openPremiumModal(); return; } showCertPreview(); });
    document.querySelectorAll('.plan-option').forEach(function (el) { el.addEventListener('click', function () { document.querySelectorAll('.plan-option').forEach(function (o) { o.classList.remove('selected'); }); el.classList.add('selected'); }); });
    $('unlockBtn').addEventListener('click', function () {
        var sel = document.querySelector('.plan-option.selected');
        var plan = sel ? sel.getAttribute('data-plan') : 'monthly';
        localStorage.setItem('ageMaster_premium', plan === 'single' ? 'true' : 'lifetime');
        closePremiumModal(); showToast('Premium unlocked!');
        var b = document.querySelector('.pdf-btn .pro-badge'); if (b) b.style.display = 'none';
    });

    $('closePremiumModal').addEventListener('click', closePremiumModal);
    $('closeCertPreview').addEventListener('click', function () { $('certPreviewModal').style.display = 'none'; });
    $('certDownloadBtn').addEventListener('click', function () { $('certPreviewModal').style.display = 'none'; setTimeout(function () { generatePDF(); }, 100); });
    $('premiumModal').addEventListener('click', function (e) { if (e.target === $('premiumModal')) closePremiumModal(); });
    $('certPreviewModal').addEventListener('click', function (e) { if (e.target === $('certPreviewModal')) $('certPreviewModal').style.display = 'none'; });

    dobInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculateAge(); });
    dobInput.addEventListener('change', function () { if (dobInput.value) calculateAge(); });
    document.querySelectorAll('.nav-item').forEach(function (btn) { btn.addEventListener('click', function () { document.querySelectorAll('.nav-item').forEach(function (b) { b.classList.remove('active'); }); btn.classList.add('active'); }); });

    if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
    init();
})();
