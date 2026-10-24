'use strict';

/* ==========================================================
   The 8 Planets — script.js
   ========================================================== */

const PLANETS = [
    {
        name: 'Mercury', type: 'Terrestrial planet', img: '2.png', color: '#c4b2a3',
        desc: 'The smallest and fastest planet, Mercury is the closest planet to the Sun and whips around it every 88 Earth days.',
        stats: { distance: 57.9, diameter: 4879, year: [88, 'days'], moons: 0 },
    },
    {
        name: 'Venus', type: 'Terrestrial planet', img: '3.png', color: '#e9b46e',
        desc: 'Spinning in the opposite direction to most planets, Venus is the hottest planet and one of the brightest objects in the night sky.',
        stats: { distance: 108.2, diameter: 12104, year: [225, 'days'], moons: 0 },
    },
    {
        name: 'Earth', type: 'Terrestrial planet', img: '4.png', color: '#4f9dff',
        desc: 'The place we call home. Earth is the third rock from the Sun and the only planet known to host life — and lots of it too!',
        stats: { distance: 149.6, diameter: 12742, year: [365, 'days'], moons: 1 },
    },
    {
        name: 'Mars', type: 'Terrestrial planet', img: '5.png', color: '#ff6a3d',
        desc: 'The red planet is a dusty, cold world with a thin atmosphere, currently explored by NASA’s Curiosity and Perseverance rovers.',
        stats: { distance: 227.9, diameter: 6779, year: [687, 'days'], moons: 2 },
    },
    {
        name: 'Jupiter', type: 'Gas giant', img: '6.png', color: '#e3a46f',
        desc: 'More than twice as massive as all the other planets combined, Jupiter hosts a centuries-old storm that is bigger than Earth.',
        stats: { distance: 778.5, diameter: 139820, year: [11.9, 'years'], moons: 95 },
    },
    {
        name: 'Saturn', type: 'Gas giant', img: '7.png', color: '#e6cc8f',
        desc: 'The most recognizable planet, adorned with a dazzling system of icy rings. Saturn is so light it could float in water.',
        stats: { distance: 1434, diameter: 116460, year: [29.5, 'years'], moons: 274 },
    },
    {
        name: 'Uranus', type: 'Ice giant', img: '8.png', color: '#7ad7e0',
        desc: 'Uranus has a truly unique rotation — it spins on its side at an almost 90-degree angle, unlike any other planet.',
        stats: { distance: 2871, diameter: 50724, year: [84, 'years'], moons: 29 },
    },
    {
        name: 'Neptune', type: 'Ice giant', img: '9.png', color: '#4f74ff',
        desc: 'The most distant planet, Neptune is a cold, dark world nearly 3 billion miles from the Sun, battered by supersonic winds.',
        stats: { distance: 4495, diameter: 49244, year: [164.8, 'years'], moons: 16 },
    },
];

const STAT_META = [
    { key: 'distance', label: 'From the Sun', icon: 'ri-sun-line', unit: 'M km' },
    { key: 'diameter', label: 'Diameter', icon: 'ri-ruler-2-line', unit: 'km' },
    { key: 'year', label: 'One year', icon: 'ri-repeat-2-line' },
    { key: 'moons', label: 'Moons', icon: 'ri-moon-line', unit: '' },
];

const AUTOPLAY_MS = 7000;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');
const $ = (sel) => document.querySelector(sel);

/* ---------- Elements ---------- */
const stage = $('#stage');
const planetEl = $('#planet');
const nameEl = $('#planetName');
const descEl = $('#planetDesc');
const statsEl = $('#stats');
const ghostEl = $('#ghost');
const eyebrowNum = $('#eyebrowNum');
const eyebrowType = $('#eyebrowType');
const counterCurrent = $('#counterCurrent');
const thumbsEl = $('#thumbs');
const indexEl = $('#index');
const progressBar = $('#progressBar');
const autoBtn = $('#autoBtn');

const state = {
    index: 0,
    busy: false,
    autoplay: !reduceMotion,
    elapsed: 0,
    hovering: false,
    statValues: STAT_META.map(() => 0),
};

/* ---------- Build UI ---------- */
function buildNav() {
    PLANETS.forEach((p, i) => {
        const thumb = document.createElement('button');
        thumb.className = 'thumb';
        thumb.setAttribute('role', 'tab');
        thumb.setAttribute('aria-label', p.name);
        thumb.dataset.name = p.name;
        thumb.style.setProperty('--c', p.color);
        thumb.innerHTML = `<img src="${p.img}" alt="">`;
        thumb.addEventListener('click', () => goTo(i));
        thumbsEl.append(thumb);

        const item = document.createElement('button');
        item.className = 'index__item';
        item.innerHTML = `<b>${pad(i + 1)}</b><i></i><span>${p.name}</span>`;
        item.addEventListener('click', () => goTo(i));
        indexEl.append(item);
    });

    statsEl.innerHTML = STAT_META.map((s) => `
        <div class="stat">
            <dt><i class="${s.icon}"></i>${s.label}</dt>
            <dd><span class="stat__value">0</span><small class="stat__unit"></small></dd>
        </div>`).join('');
}

/* ---------- Render ---------- */
function renderText(p, i) {
    eyebrowNum.textContent = pad(i + 1);
    eyebrowType.textContent = p.type;
    counterCurrent.textContent = pad(i + 1);
    descEl.textContent = p.desc;
    document.title = `${p.name} | The 8 Planets`;

    nameEl.innerHTML = [...p.name].map((c, n) => `<span class="ch" style="--i:${n}">${c}</span>`).join('');
    nameEl.setAttribute('aria-label', p.name);

    ghostEl.textContent = p.name;
    restartAnimation(ghostEl, 'is-changing');
    restartAnimation(stage, 'is-swapping');

    document.body.style.setProperty('--accent', p.color);

    thumbsEl.querySelectorAll('.thumb').forEach((t, n) => t.setAttribute('aria-selected', String(n === i)));
    indexEl.querySelectorAll('.index__item').forEach((t, n) => t.setAttribute('aria-current', String(n === i)));
    thumbsEl.children[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });

    animateStats(p);
}

function restartAnimation(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth; // reflow agar animasi bisa diputar ulang
    node.classList.add(cls);
}

function statTarget(p, key) {
    const v = p.stats[key];
    return Array.isArray(v) ? { value: v[0], unit: v[1] } : { value: v };
}

function animateStats(p) {
    const values = statsEl.querySelectorAll('.stat__value');
    const units = statsEl.querySelectorAll('.stat__unit');
    const from = [...state.statValues];
    const targets = STAT_META.map((s) => statTarget(p, s.key));

    STAT_META.forEach((s, n) => { units[n].textContent = targets[n].unit ?? s.unit; });

    const duration = reduceMotion ? 0 : 1400;
    const start = performance.now();
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

    function tick(now) {
        const t = duration ? Math.min(1, (now - start) / duration) : 1;
        const e = easeOutExpo(t);
        targets.forEach(({ value }, n) => {
            const v = from[n] + (value - from[n]) * e;
            const decimals = Number.isInteger(value) ? 0 : 1;
            values[n].textContent = v.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
            state.statValues[n] = v;
        });
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function makePlanetImg(p) {
    const wrap = document.createElement('div');
    wrap.className = 'planet__img';
    wrap.innerHTML = `<img src="${p.img}" alt="${p.name}" draggable="false">`;
    return wrap;
}

/* ---------- Navigation ---------- */
function goTo(i, dir) {
    i = (i + PLANETS.length) % PLANETS.length;
    if (i === state.index || state.busy) return;
    dir = dir ?? (i > state.index ? 1 : -1);
    state.busy = true;
    state.elapsed = 0;

    const old = planetEl.querySelector('.planet__img');
    const next = makePlanetImg(PLANETS[i]);
    planetEl.append(next);
    state.index = i;
    renderText(PLANETS[i], i);

    const duration = reduceMotion ? 1 : 1100;
    const easing = 'cubic-bezier(0.65, 0, 0.35, 1)';

    old?.animate([
        { transform: 'translateX(0) scale(1) rotate(0deg)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translateX(${-dir * 70}%) scale(0.35) rotate(${-dir * 25}deg)`, opacity: 0, filter: 'blur(10px)' },
    ], { duration, easing, fill: 'forwards' }).finished.then(() => old.remove());

    next.animate([
        { transform: `translateX(${dir * 70}%) scale(0.35) rotate(${dir * 25}deg)`, opacity: 0, filter: 'blur(10px)' },
        { transform: 'translateX(0) scale(1) rotate(0deg)', opacity: 1, filter: 'blur(0px)' },
    ], { duration, easing, fill: 'backwards' }).finished.then(() => { state.busy = false; });
}

const next = () => goTo(state.index + 1, 1);
const prev = () => goTo(state.index - 1, -1);

$('#nextBtn').addEventListener('click', next);
$('#prevBtn').addEventListener('click', prev);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') goTo(0, -1);
    else if (e.key === 'End') goTo(PLANETS.length - 1, 1);
    else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); setAutoplay(!state.autoplay); }
    else if (/^[1-8]$/.test(e.key)) goTo(Number(e.key) - 1);
});

// Scroll (hanya di desktop, di mobile halaman bisa di-scroll biasa)
let wheelAcc = 0;
let wheelLock = 0;
window.addEventListener('wheel', (e) => {
    if (window.innerWidth <= 900) return;
    e.preventDefault();
    const now = performance.now();
    if (now < wheelLock) return;
    wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(wheelAcc) > 40) {
        wheelAcc > 0 ? next() : prev();
        wheelAcc = 0;
        wheelLock = now + 1000;
    }
}, { passive: false });

// Swipe / drag
let swipe = null;
stage.addEventListener('pointerdown', (e) => {
    swipe = { x: e.clientX, y: e.clientY };
});
window.addEventListener('pointerup', (e) => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) dx < 0 ? next() : prev();
});
window.addEventListener('pointercancel', () => { swipe = null; });

/* ---------- Autoplay ---------- */
function setAutoplay(on) {
    state.autoplay = on;
    autoBtn.setAttribute('aria-pressed', String(on));
    autoBtn.setAttribute('aria-label', on ? 'Pause autoplay' : 'Start autoplay');
    autoBtn.querySelector('i').className = on ? 'ri-pause-line' : 'ri-play-line';
    if (!on) progressBar.style.transform = 'scaleX(0)';
}

autoBtn.addEventListener('click', () => setAutoplay(!state.autoplay));
stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') state.hovering = true; });
stage.addEventListener('pointerleave', () => { state.hovering = false; });

/* ---------- Parallax, tilt & dust ---------- */
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
const bgStars = $('#bgStars');
const dust = { canvas: $('#dust'), particles: [], w: 0, h: 0 };
dust.ctx = dust.canvas.getContext('2d');

window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / window.innerWidth - 0.5;
    mouse.ty = e.clientY / window.innerHeight - 0.5;
});

function resizeDust() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dust.w = window.innerWidth;
    dust.h = window.innerHeight;
    dust.canvas.width = dust.w * dpr;
    dust.canvas.height = dust.h * dpr;
    dust.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(120, (dust.w * dust.h) / 12000));
    dust.particles = Array.from({ length: count }, () => ({
        x: Math.random() * dust.w,
        y: Math.random() * dust.h,
        r: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 6,
        vy: -(Math.random() * 10 + 3),
        a: Math.random() * 0.6 + 0.2,
        d: Math.random() * 0.8 + 0.2,
    }));
}

function drawDust(dt) {
    const { ctx, w, h } = dust;
    ctx.clearRect(0, 0, w, h);
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#ffffff';
    ctx.fillStyle = accent;
    for (const p of dust.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x - mouse.x * 40 * p.d, p.y - mouse.y * 40 * p.d, p.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

/* ---------- Main loop ---------- */
let last = performance.now();
let dustDrawn = false;

function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 4);
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 4);

    if (!reduceMotion) {
        bgStars.style.transform = `translate(${mouse.x * -30}px, ${mouse.y * -30}px) scale(1.05)`;
        planetEl.style.transform = `rotateY(${mouse.x * 18}deg) rotateX(${mouse.y * -14}deg) translate3d(${mouse.x * 20}px, ${mouse.y * 14}px, 0)`;
        drawDust(dt);
    } else if (!dustDrawn) {
        drawDust(0);
        dustDrawn = true;
    }

    // Autoplay
    const paused = !state.autoplay || state.hovering || document.hidden || state.busy;
    if (!paused) {
        state.elapsed += dt * 1000;
        if (state.elapsed >= AUTOPLAY_MS) next();
    }
    if (state.autoplay) {
        progressBar.style.transform = `scaleX(${Math.min(1, state.elapsed / AUTOPLAY_MS)})`;
    }

    requestAnimationFrame(frame);
}

/* ---------- Start ---------- */
function preload() {
    const loaderPct = $('#loaderPct');
    let done = 0;
    const sources = [...PLANETS.map((p) => p.img), 'bgbgbg.jpg'];
    return Promise.all(sources.map((src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
            done++;
            loaderPct.textContent = `${Math.round((done / sources.length) * 100)}%`;
            resolve();
        };
        img.src = src;
    })));
}

buildNav();
planetEl.append(makePlanetImg(PLANETS[0]));
renderText(PLANETS[0], 0);
setAutoplay(state.autoplay);
resizeDust();
window.addEventListener('resize', resizeDust);
requestAnimationFrame(frame);

preload().then(() => {
    setTimeout(() => {
        $('#loader').classList.add('is-hidden');
        document.body.classList.add('is-ready');
        state.statValues.fill(0); // angka dihitung naik dari nol saat halaman muncul
        renderText(PLANETS[state.index], state.index);
    }, 300);
});
