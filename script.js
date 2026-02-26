// ====================== MOON SALOON script.js – DEPARTURE MODEL ======================
const clickSounds = [new Audio('sounds/ricochet-1.mp3'), new Audio('sounds/ricochet-2.mp3')];
clickSounds.forEach(sound => { sound.preload = 'auto'; sound.volume = 0.85; });
const gameOverSound = new Audio('sounds/ScottySteel.mp3');
gameOverSound.volume = 0.85;
let mousePos = { x: 0, y: 0 };
let score = parseInt(sessionStorage.getItem('score')) || 0;
let scoreEl = null;
let health = parseFloat(sessionStorage.getItem('health')) || 100;
let healthBar = null;
let healthProgress = null;
let gameOverShown = false;

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

function waitForAudio(sound) { /* your exact original function */ 
  return sound.play().then(() => new Promise(resolve => { sound.onended = () => { sound.onended = null; resolve(); }; })).catch(() => Promise.resolve());
}
function waitForAnimation(element, animationName) { /* your exact original */ 
  return new Promise(resolve => { const handler = e => { if (e.animationName === animationName) { element.removeEventListener('animationend', handler); resolve(); }}; element.addEventListener('animationend', handler); setTimeout(resolve, 1200); });
}
function explode(mx, my, hexColor) { /* your exact 30-particle canvas function */ 
  /* paste your full explode() here unchanged */
}
function updateScore(points, x, y) { /* your exact original with health logic */ 
  /* paste full updateScore unchanged */
}
function updateHealthBar() { /* your exact original */ /* paste full */ }
function initHealthBar() { /* your exact */ }
function showFloatingPoints(points, mx, my) { /* your exact canvas particle function */ /* paste full */ }

function generateNav() { /* your original generateNav code here */ }
function generateFooter() { /* your original generateFooter code here */ }

document.addEventListener('DOMContentLoaded', () => {
  score = parseInt(sessionStorage.getItem('score')) || 0;
  generateNav();
  generateFooter();
  scoreEl = document.getElementById('score-value');
  if (scoreEl) {
    scoreEl.textContent = score.toString().padStart(6, '0');
    /* your class logic for score-zero etc. */
  }
  setTimeout(() => { initHealthBar(); updateScore(0); }, 200);

  const saloonSVG = document.getElementById('saloon-svg');
  if (saloonSVG) {  // INDEX ONLY
    document.querySelectorAll('.moonsaloon-prop').forEach(prop => {
      prop.addEventListener('click', e => {
        e.stopImmediatePropagation();
        const rect = prop.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        let hits = parseInt(prop.dataset.hits || '0') + 1;
        prop.dataset.hits = hits;
        const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
        sound.currentTime = 0; sound.play().catch(() => {});
        updateScore(parseInt(prop.dataset.score), x, y);
        explode(x, y, '#00ffcc');
        prop.classList.add('hit'); setTimeout(() => prop.classList.remove('hit'), 160);
        if (hits >= parseInt(prop.dataset.maxHits)) {
          prop.classList.add('destroyed');
          const overlay = document.getElementById('transition-overlay');
          const forwardVideo = document.getElementById('forward-video');
          forwardVideo.src = prop.dataset.forwardVideo;
          forwardVideo.style.display = 'block';
          document.getElementById('reverse-video').style.display = 'none';
          overlay.style.display = 'block';
          const muted = isMobile();
          forwardVideo.muted = muted;
          forwardVideo.volume = muted ? 0 : 0.8;
          forwardVideo.currentTime = 0;
          let safety = setTimeout(() => window.location.href = prop.dataset.link, 1800);
          forwardVideo.onended = () => { clearTimeout(safety); window.location.href = prop.dataset.link; };
          forwardVideo.play().catch(() => window.location.href = prop.dataset.link);
        }
      });
    });
    // Dry fire, timer, etc. – your original code here
  }

  // Reverse doors logic stays on sub-pages (no change needed)
});
