/* ═══════════════════════════════════════════════════════════
   PULPO AZUL — « La Descente » v2
   Vanilla JS, no dependencies.

   v1 — the dive:
   - Interpolates the background through the water column
   - Depth meter (meters + cursor + active section)
   - Station reveals, bubbles, marine snow, octopus mascot

   v2 — the craft layer:
   - Pressure typography: Fraunces variable axes follow the depth
   - Dive light: the cursor carries a lamp below ~12 m
   - Pulpo, the dive buddy: cruises the open-water gaps, darts
     away when you scroll fast, enforces a decompression stop on
     speed-ascents, presents the donation tiers, dances on #merci
   - Quote bubbles: kids' voices floating in the gaps
   - The living seabed: one posidonia blade per donor
   - Breath ritual on the way down, « Remonter » on the way up
   - Night dive: automatic after 21 h, toggleable — plankton glows
   - Ambient sound: generated brown noise + bubble blips, muffled
     by depth (Web Audio, no assets, off by default)

   Under prefers-reduced-motion the scroll choreography is skipped
   (the CSS gradient fallback shows the whole page), but content
   features — night mode, meadow, quotes, sound — stay available.
   ═══════════════════════════════════════════════════════════ */

(function () {
'use strict';

function slice(x) { return Array.prototype.slice.call(x); }

var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var body = document.body;

/* ── water columns — keep DAY in sync with :root in styles.css ── */
var DAY_STOPS   = ['#FFEFC2', '#9FDDE4', '#4FB3CE', '#1E6F9F', '#0E3D66', '#071F38'];
var NIGHT_STOPS = ['#101E3E', '#0E2A50', '#0D335A', '#0A2746', '#061830', '#030B18'];
var MAX_DEPTH = 32;

var night = false;
try {
  var storedNight = localStorage.getItem('pulpo-night');
  var hour = new Date().getHours();
  night = storedNight !== null ? storedNight === '1' : (hour >= 21 || hour < 7);
} catch (e) { night = false; }

function hexToRgb(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
var rgbCache = (night ? NIGHT_STOPS : DAY_STOPS).map(hexToRgb);

function waterAt(t) { /* t in [0,1] → interpolated rgb() through the column */
  var seg = Math.min(rgbCache.length - 2, Math.floor(t * (rgbCache.length - 1)));
  var lt = t * (rgbCache.length - 1) - seg;
  var a = rgbCache[seg], b = rgbCache[seg + 1];
  return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * lt) + ',' +
                  Math.round(a[1] + (b[1] - a[1]) * lt) + ',' +
                  Math.round(a[2] + (b[2] - a[2]) * lt) + ')';
}

function applyWaterStatic() { /* reduced-motion: paint the whole column at once */
  body.style.background = night ? 'linear-gradient(180deg,' + NIGHT_STOPS.join(',') + ')' : '';
}

/* ── elements ── */
var meter    = document.querySelector('.depth-meter');
var cursor   = document.querySelector('.dm-cursor');
var rail     = document.querySelector('.dm-rail');
var readout  = document.getElementById('dm-value');
var rays     = document.querySelector('.rays');
var snow     = document.querySelector('.snow');
var vignette = document.querySelector('.vignette');
var torch    = document.querySelector('.torch');
var plxEls   = slice(document.querySelectorAll('[data-plx]'));
var links    = slice(document.querySelectorAll('.depth-meter a'));
var stations = slice(document.querySelectorAll('.station'));

var W = window.innerWidth, H = window.innerHeight;

/* geometry cache (parallax + buddy zones) */
var plxCache = [], stationGeo = [];
function cacheGeometry() {
  W = window.innerWidth; H = window.innerHeight;
  plxCache = plxEls.map(function (el) {
    var prev = el.style.transform; el.style.transform = '';
    var top = el.getBoundingClientRect().top + window.scrollY;
    el.style.transform = prev;
    return { el: el, top: top, f: parseFloat(el.getAttribute('data-plx')) || 0.15 };
  });
  stationGeo = stations.map(function (s) {
    var top = s.getBoundingClientRect().top + window.scrollY;
    return { el: s, id: s.id || '', top: top, bottom: top + s.offsetHeight };
  });
}

/* ── pressure typography ─────────────────────────────────
   Fraunces variable axes follow the depth: the display type
   grows lighter and harder as the water presses in. */
var pressEls = slice(document.querySelectorAll('h1, h2, .statement, .amount, .foot-mark'));
var lastFvs = '';
function pressure(t) {
  var wght = Math.round(900 - t * 270); /* 900 → 630 */
  var soft = Math.round(100 - t * 60);  /* 100 → 40  */
  var fvs = "'SOFT' " + soft + ", 'wght' " + wght;
  if (fvs === lastFvs) return;
  lastFvs = fvs;
  for (var i = 0; i < pressEls.length; i++) pressEls[i].style.fontVariationSettings = fvs;
}

/* ── dive light ── */
var tx = W / 2, ty = H * 0.42;
var finePointer = window.matchMedia('(pointer: fine)').matches;
if (finePointer) {
  window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
}
function torchUpdate(t) {
  if (!torch) return;
  var amt = Math.max(0, Math.min(0.85, (t - 0.36) * 2.6));
  torch.style.opacity = String(amt);
  if (amt > 0 && finePointer) {
    torch.style.setProperty('--tx', tx + 'px');
    torch.style.setProperty('--ty', ty + 'px');
  }
}

/* ── Pulpo, the dive buddy ── */
var OCTO_SVG =
'<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
+ '<g fill="none" stroke="#E8734A" stroke-width="11" stroke-linecap="round">'
+ '<path d="M58 112 C 46 136 34 148 22 156"/>'
+ '<path d="M74 116 C 66 142 58 158 48 170"/>'
+ '<path d="M90 118 C 86 146 82 164 76 178"/>'
+ '<path d="M110 118 C 114 146 118 164 124 178"/>'
+ '<path d="M126 116 C 134 142 142 158 152 170"/>'
+ '<path d="M142 112 C 154 136 166 148 178 156"/>'
+ '</g>'
+ '<path d="M100 16 C 62 16 46 48 46 78 C 46 102 64 114 100 114 C 136 114 154 102 154 78 C 154 48 138 16 100 16 Z" fill="#E8734A"/>'
+ '<circle cx="80" cy="72" r="13" fill="#FFFDF6"/>'
+ '<circle cx="120" cy="72" r="13" fill="#FFFDF6"/>'
+ '<circle cx="83" cy="75" r="6" fill="#12283A"/>'
+ '<circle cx="117" cy="75" r="6" fill="#12283A"/>'
+ '<circle cx="85" cy="73" r="2" fill="#FFFDF6"/>'
+ '<circle cx="119" cy="73" r="2" fill="#FFFDF6"/>'
+ '<circle class="octo-blush" cx="62" cy="90" r="6" fill="#FF9D8A" opacity="0"/>'
+ '<circle class="octo-blush" cx="138" cy="90" r="6" fill="#FF9D8A" opacity="0"/>'
+ '<g class="octo-wave" fill="none" stroke="#E8734A" stroke-width="11" stroke-linecap="round">'
+ '<path d="M100 116 C 100 142 98 158 96 172 C 95 182 102 188 110 184"/>'
+ '</g>'
+ '</svg>';

var buddy = document.createElement('div');
buddy.className = 'buddy';
buddy.setAttribute('aria-hidden', 'true');
buddy.innerHTML = OCTO_SVG;
buddy.style.opacity = '0';

var bX = W * 0.85, bY = H * 0.4, bO = 0, bS = 0.95, bFlip = 1;
var vel = 0, lastY = window.scrollY;
var decoLock = false, decoDone = false, partyUntil = 0;
try { decoDone = !!sessionStorage.getItem('pulpo-deco'); } catch (e) { decoDone = false; }

function exciteBuddy() {
  if (!buddy.parentNode) return;
  buddy.classList.remove('excited');
  void buddy.offsetWidth; /* restart the animation */
  buddy.classList.add('excited');
}

function buddyUpdate(t, now) {
  if (!buddy.parentNode) return;
  var target = { x: bX, y: bY, o: 0, s: 0.95 };
  var small = W < 700;
  var mid = window.scrollY + H / 2;
  var stationIdx = -1, gapsAbove = 0;
  for (var i = 0; i < stationGeo.length; i++) {
    var g = stationGeo[i];
    if (mid >= g.top && mid <= g.bottom) stationIdx = i;
    if (g.bottom < mid) gapsAbove++;
  }
  var inGap = stationIdx === -1;
  var presenting = stationIdx >= 0 && stationGeo[stationIdx].id === 'soutenir';

  if (now < partyUntil) {
    target = { x: W * 0.66, y: H * 0.40, o: 1, s: 1.15 };
    if (Math.floor(now / 900) !== Math.floor((now - 16) / 900)) exciteBuddy();
  } else if (decoLock) {
    target = { x: W / 2 - 70, y: H * 0.58, o: 1, s: 1.2 };
  } else if (Math.abs(vel) > 42) {
    target.o = 0; /* dart away: fast fade, hold position */
  } else if (presenting && !small) {
    target = { x: W * 0.80, y: H * 0.58, o: 1, s: 1.08 };
  } else if (inGap && !small) {
    var side = gapsAbove % 2;
    target = { x: side ? W * 0.84 : W * 0.05, y: H * (0.36 + 0.05 * Math.sin(now / 900)), o: 1, s: 0.95 };
  }

  bX += (target.x - bX) * 0.07;
  bY += (target.y - bY) * 0.07;
  bS += (target.s - bS) * 0.07;
  bO += (target.o - bO) * (target.o > bO ? 0.045 : 0.16);
  if (target.x < bX - 3) bFlip = -1; else if (target.x > bX + 3) bFlip = 1;

  buddy.style.opacity = bO.toFixed(3);
  buddy.style.transform = 'translate(' + bX.toFixed(1) + 'px,' + bY.toFixed(1) + 'px) scale(' + (bS * bFlip).toFixed(3) + ',' + bS.toFixed(3) + ')';
}

/* ── decompression stop ── */
var decoCard = document.createElement('div');
decoCard.className = 'deco-card';
decoCard.setAttribute('role', 'alert');
decoCard.innerHTML =
  '<svg class="deco-ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24"/></svg>' +
  '<p class="deco-title">Palier de décompression</p>' +
  '<p>Même les plongeurs pressés s\'arrêtent ici — trois secondes, le temps de regarder autour de soi.</p>' +
  '<button class="deco-skip" type="button">Continuer la remontée</button>';
var prevOverflow = '';

function endDeco() {
  if (!decoLock) return;
  decoLock = false;
  document.documentElement.style.overflow = prevOverflow;
  decoCard.classList.remove('show');
  document.removeEventListener('keydown', decoKey);
}
function decoKey(e) { if (e.key === 'Escape') endDeco(); }
function startDeco() {
  decoLock = true; decoDone = true;
  try { sessionStorage.setItem('pulpo-deco', '1'); } catch (e) {}
  prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  decoCard.classList.add('show');
  decoCard.querySelector('.deco-skip').focus();
  document.addEventListener('keydown', decoKey);
  setTimeout(endDeco, 3400);
}
decoCard.querySelector('.deco-skip').addEventListener('click', endDeco);

function maybeDeco(t) {
  if (decoDone || decoLock) return;
  if (vel < -48 && t > 0.45 && t < 0.92) startDeco();
}

/* ── quote bubbles ── */
var quotePop = null, quoteTimer = null;
function hideQuote() {
  if (quotePop) { var q = quotePop; q.classList.remove('show'); setTimeout(function () { if (q.parentNode) q.parentNode.removeChild(q); }, 400); quotePop = null; }
  if (quoteTimer) { clearTimeout(quoteTimer); quoteTimer = null; }
}
function bindQuotes() {
  slice(document.querySelectorAll('.q-bubble')).forEach(function (q) {
    q.addEventListener('click', function () {
      hideQuote();
      var r = q.getBoundingClientRect();
      var pop = document.createElement('div');
      pop.className = 'quote-pop';
      pop.textContent = q.getAttribute('data-quote');
      body.appendChild(pop);
      var pw = Math.min(280, W - 32);
      var left = Math.max(16, Math.min(W - pw - 16, r.left - pw / 2 + r.width / 2));
      var top = r.top - 16 - pop.offsetHeight;
      if (top < 12) top = r.bottom + 16;
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      quotePop = pop;
      requestAnimationFrame(function () { pop.classList.add('show'); });
      quoteTimer = setTimeout(hideQuote, 6000);
    });
  });
  window.addEventListener('scroll', hideQuote, { passive: true });
}

/* ── the living seabed ───────────────────────────────────
   One posidonia blade per donor. In production, replace the
   data-donors fallback with a JSON file updated by your
   payment webhook:
     fetch('donors.json').then(function(r){return r.json();})
       .then(function(d){ buildMeadow(d.count); })
       .catch(function(){ buildMeadow(FALLBACK); });
   ─────────────────────────────────────────────────────── */
var seabed = document.querySelector('.seabed');
var meadowSvg = document.getElementById('meadow');
function buildMeadow(count) {
  if (!meadowSvg) return;
  var donated = false;
  try { donated = !!localStorage.getItem('pulpo-donated'); } catch (e) { donated = false; }
  if (donated) count += 1;
  var MAXB = 130, n = Math.max(1, Math.min(count, MAXB));
  var NS = 'http://www.w3.org/2000/svg';
  var frag = document.createDocumentFragment();
  for (var i = 0; i < n; i++) {
    var x = 24 + 1392 * (n === 1 ? 0.5 : i / (n - 1)) + (Math.random() * 18 - 9);
    var hgt = 55 + Math.random() * 135;
    var bend = Math.random() * 70 - 35;
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M' + x.toFixed(1) + ' 220 C ' + (x + bend * 0.3).toFixed(1) + ' ' + (220 - hgt * 0.5).toFixed(1) + ', ' + (x + bend).toFixed(1) + ' ' + (220 - hgt * 0.8).toFixed(1) + ', ' + (x + bend * 1.25).toFixed(1) + ' ' + (220 - hgt).toFixed(1));
    p.setAttribute('class', 'blade' + (donated && i === n - 1 ? ' blade-yours' : ''));
    p.style.animationDuration = (3.6 + Math.random() * 3.2).toFixed(2) + 's';
    p.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
    frag.appendChild(p);
  }
  meadowSvg.appendChild(frag);
  var cap = document.getElementById('meadow-count');
  if (cap) cap.textContent = String(count);
}

/* ── toast ── */
var toastEl = document.querySelector('.toast');
var toastTimer = null;
function toast(msg, withShare) {
  if (!toastEl) return;
  toastEl.innerHTML = '';
  toastEl.appendChild(document.createTextNode(msg));
  if (withShare) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Partager';
    b.addEventListener('click', function () {
      var data = { title: document.title, text: 'Plongez avec Pulpo Azul — des sorties en mer pour les enfants.', url: location.href.split(/[?#]/)[0] };
      if (navigator.share) { navigator.share(data).catch(function () {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(data.url); b.textContent = 'Lien copié !'; }
    });
    toastEl.appendChild(b);
  }
  toastEl.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 9000);
}

/* ── breath ritual ── */
function bindBreath() {
  var breathBtn = document.getElementById('breath-btn');
  var overlay = document.querySelector('.breath-overlay');
  if (!breathBtn || !overlay || reduced) return;
  breathBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var done = false;
    overlay.classList.add('breathe');
    var cancel = function () {
      if (done) return; done = true;
      overlay.classList.remove('breathe');
      window.removeEventListener('scroll', cancel, true);
    };
    var finish = function () {
      if (done) return; done = true;
      overlay.classList.remove('breathe');
      window.removeEventListener('scroll', cancel, true);
      var target = document.getElementById('sorties');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('scroll', cancel, true);
    setTimeout(finish, 1950);
  });
}

/* ── the ascent ── */
var maxT = 0, ascentToasted = false;
function bindAscent() {
  var btn = document.getElementById('ascent-btn');
  if (btn) btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
}
function ascentWatch(t) {
  if (t > maxT) maxT = t;
  if (!ascentToasted && maxT > 0.97 && t < 0.03) {
    ascentToasted = true;
    toast('Belle remontée — le ciel vous attendait. Partagez la plongée ?', true);
  }
}

/* ── night dive ── */
var nightBtn = document.getElementById('night-toggle');
function applyNight() {
  rgbCache = (night ? NIGHT_STOPS : DAY_STOPS).map(hexToRgb);
  body.classList.toggle('night', night);
  if (nightBtn) nightBtn.setAttribute('aria-pressed', String(night));
  if (reduced) applyWaterStatic(); else update();
}
function bindToggles() {
  if (nightBtn) nightBtn.addEventListener('click', function () {
    night = !night;
    try { localStorage.setItem('pulpo-night', night ? '1' : '0'); } catch (e) {}
    applyNight();
  });
  if (soundBtn) soundBtn.addEventListener('click', function () {
    if (!actx && !initAudio()) return;
    soundOn = !soundOn;
    actx.resume();
    master.gain.setTargetAtTime(soundOn ? 0.11 : 0, actx.currentTime, 0.7);
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    if (soundOn) scheduleBlips(); else if (blipTimer) clearTimeout(blipTimer);
  });
}

/* ── ambient sound (generated, no assets) ── */
var soundBtn = document.getElementById('sound-toggle');
var actx = null, master = null, lowpass = null, soundOn = false, blipTimer = null, currentT = 0;

function noiseBuffer(ctx) {
  var len = Math.floor(ctx.sampleRate * 2.5);
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0), last = 0;
  for (var i = 0; i < len; i++) {
    var white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    d[i] = last * 3.0;
  }
  return buf;
}
function initAudio() {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  actx = new AC();
  var src = actx.createBufferSource();
  src.buffer = noiseBuffer(actx); src.loop = true;
  lowpass = actx.createBiquadFilter();
  lowpass.type = 'lowpass'; lowpass.frequency.value = 820; lowpass.Q.value = 0.5;
  master = actx.createGain(); master.gain.value = 0;
  src.connect(lowpass); lowpass.connect(master); master.connect(actx.destination);
  src.start();
  var lfo = actx.createOscillator(), lfoGain = actx.createGain();
  lfo.frequency.value = 0.09; lfoGain.gain.value = 0.035;
  lfo.connect(lfoGain); lfoGain.connect(master.gain); lfo.start();
  return true;
}
function blip() {
  if (!soundOn || !actx || currentT < 0.08) return;
  var o = actx.createOscillator(), g = actx.createGain(), now = actx.currentTime;
  var f = 460 + Math.random() * 420;
  o.type = 'sine';
  o.frequency.setValueAtTime(f, now);
  o.frequency.exponentialRampToValueAtTime(f * 1.9, now + 0.14);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.045, now + 0.025);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  o.connect(g); g.connect(actx.destination);
  o.start(now); o.stop(now + 0.26);
}
function scheduleBlips() {
  if (!soundOn) return;
  blipTimer = setTimeout(function () { blip(); scheduleBlips(); }, 3200 + Math.random() * 5600);
}
function soundUpdate(t) {
  currentT = t;
  if (lowpass) lowpass.frequency.value = 860 - t * 640; /* the deep muffles the world */
}

/* ── scroll loop (rAF-throttled) ── */
var ticking = false;
function onScroll() {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
}
function update() {
  ticking = false;
  var max = document.documentElement.scrollHeight - window.innerHeight;
  var t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

  vel = vel * 0.82 + (window.scrollY - lastY) * 0.18;
  lastY = window.scrollY;

  /* 1. water color */
  body.style.background = waterAt(t);

  /* 2. depth readout + cursor */
  readout.textContent = String(Math.round(t * MAX_DEPTH));
  var railH = rail.offsetHeight || rail.offsetWidth;
  if (rail.offsetHeight > rail.offsetWidth) {
    cursor.style.top = (t * (railH - 8)) + 'px';
    cursor.style.left = '-3px';
  } else {
    cursor.style.left = (t * (railH - 8)) + 'px';
    cursor.style.top = '-3px';
  }

  /* 3. sunlight fades with depth (dimmer at night) */
  rays.style.opacity = String((night ? 0.45 : 1) * Math.max(0, 1 - t * 3.2));

  /* 4. meter legibility near the bright surface */
  meter.classList.toggle('on-light', !night && t < 0.12);

  /* 5. marine snow / 6. pressure vignette */
  snow.style.opacity = String(Math.max(0, Math.min(0.9, (t - 0.45) * 2.4)));
  vignette.style.opacity = String(Math.min(1, Math.max(0, (t - 0.2) * 1.15)));

  /* v2 systems */
  torchUpdate(t);
  pressure(t);
  soundUpdate(t);
  maybeDeco(t);
  ascentWatch(t);
  buddyUpdate(t, Date.now());

  /* 7. parallax silhouettes */
  var vhHalf = window.innerHeight / 2;
  for (var i = 0; i < plxCache.length; i++) {
    var p = plxCache[i];
    var delta = (window.scrollY + vhHalf - p.top) * p.f;
    p.el.style.transform = 'translateY(' + delta.toFixed(1) + 'px)';
  }
}

/* ── station reveals + active section ── */
function bindReveals() {
  var toReveal = [];
  stations.forEach(function (s) {
    slice(s.querySelectorAll('.wrap > *')).forEach(function (el) {
      el.classList.add('reveal');
      toReveal.push(el);
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  toReveal.forEach(function (el) { io.observe(el); });

  var secIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || !e.target.id) return;
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  stations.forEach(function (s) { if (s.id) secIO.observe(s); });
}

/* ── ambient bubbles + marine snow ── */
function spawnBubbles() {
  var host = document.querySelector('.bubbles');
  if (!host) return;
  var N = window.innerWidth < 700 ? 8 : 14;
  for (var i = 0; i < N; i++) {
    var b = document.createElement('i');
    b.className = 'bubble';
    var size = 5 + Math.random() * 12;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = (Math.random() * 100) + 'vw';
    b.style.setProperty('--sway', (Math.random() * 44 - 22) + 'px');
    b.style.animationDuration = (9 + Math.random() * 12) + 's';
    b.style.animationDelay = (-Math.random() * 14) + 's';
    host.appendChild(b);
  }
}
function spawnFlakes() {
  if (!snow) return;
  var NF = window.innerWidth < 700 ? 14 : 26;
  for (var f = 0; f < NF; f++) {
    var fl = document.createElement('i');
    fl.className = 'flake';
    var fs = 1.5 + Math.random() * 2.6;
    fl.style.width = fs + 'px';
    fl.style.height = fs + 'px';
    fl.style.left = (Math.random() * 100) + 'vw';
    fl.style.opacity = String(0.35 + Math.random() * 0.5);
    fl.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
    fl.style.animationDuration = (16 + Math.random() * 22) + 's';
    fl.style.animationDelay = (-Math.random() * 30) + 's';
    snow.appendChild(fl);
  }
}

/* ── tier hover → Pulpo reacts ── */
function bindTiers() {
  slice(document.querySelectorAll('.tiers li')).forEach(function (li) {
    li.addEventListener('mouseenter', exciteBuddy);
  });
}

/* ═══ init ═══ */
if (!reduced) body.classList.add('live');
body.classList.toggle('night', night);
if (nightBtn) nightBtn.setAttribute('aria-pressed', String(night));
if (reduced) applyWaterStatic();

/* the mascot in the mission section (static content — always injected) */
var slot = document.querySelector('[data-octo]');
if (slot) slot.innerHTML = OCTO_SVG;

/* thank-you state (#merci after a donation) — before the meadow
   so the golden blade is included */
if (/[?#&]merci/.test(location.href)) {
  try { localStorage.setItem('pulpo-donated', '1'); } catch (e) {}
  if (!reduced) partyUntil = Date.now() + 4500;
  setTimeout(function () { toast('Merci ! Pulpo danse pour vous.', true); }, 900);
}

buildMeadow(parseInt((seabed && seabed.getAttribute('data-donors')) || '41', 10) || 41);
bindQuotes();
bindTiers();
bindBreath();
bindAscent();
bindToggles();

if (!reduced) {
  body.appendChild(buddy);
  body.appendChild(decoCard);
  spawnBubbles();
  spawnFlakes();
  bindReveals();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { cacheGeometry(); onScroll(); });
  cacheGeometry();
  update();
  window.addEventListener('load', function () { cacheGeometry(); update(); });
}

})();
