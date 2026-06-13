(function () {
    'use strict';

    const ZODIAC = [
        { sign: 'Capricorn', emoji: 'Capricorn', start: [12, 22], end: [1, 19] },
        { sign: 'Aquarius', emoji: 'Aquarius', start: [1, 20], end: [2, 18] },
        { sign: 'Pisces', emoji: 'Pisces', start: [2, 19], end: [3, 20] },
        { sign: 'Aries', emoji: 'Aries', start: [3, 21], end: [4, 19] },
        { sign: 'Taurus', emoji: 'Taurus', start: [4, 20], end: [5, 20] },
        { sign: 'Gemini', emoji: 'Gemini', start: [5, 21], end: [6, 20] },
        { sign: 'Cancer', emoji: 'Cancer', start: [6, 21], end: [7, 22] },
        { sign: 'Leo', emoji: 'Leo', start: [7, 23], end: [8, 22] },
        { sign: 'Virgo', emoji: 'Virgo', start: [8, 23], end: [9, 22] },
        { sign: 'Libra', emoji: 'Libra', start: [9, 23], end: [10, 22] },
        { sign: 'Scorpio', emoji: 'Scorpio', start: [10, 23], end: [11, 21] },
        { sign: 'Sagittarius', emoji: 'Sagittarius', start: [11, 22], end: [12, 21] },
    ];

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const $ = (id) => document.getElementById(id);

    const dobInput = $('dob');
    const calcBtn = $('calculateBtn');
    const results = $('results');
    const errorToast = $('errorToast');
    const errorMsg = $('errorMsg');

    let errorTimer = null;

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

        $('birthDay').textContent = DAYS[dob.getDay()];
        $('zodiacSign').textContent = getZodiac(dob.getMonth() + 1, dob.getDate());

        $('totalDays').textContent = totalDays.toLocaleString();

        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        let nextBirthday = thisYearBirthday;
        if (today > thisYearBirthday) {
            nextBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
        }
        const daysUntilNext = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

        if (daysUntilNext === 0) {
            $('nextBirthday').textContent = 'Today!';
        } else if (daysUntilNext === 1) {
            $('nextBirthday').textContent = 'Tomorrow';
        } else {
            $('nextBirthday').textContent = daysUntilNext + ' days';
        }

        results.classList.add('show');
        results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    calcBtn.addEventListener('click', calculateAge);

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
