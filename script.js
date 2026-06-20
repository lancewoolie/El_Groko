// Initialize Firebase once (add if not already there)
const firebaseConfig = {
  apiKey: "AIzaSyAJQMdogiDwB0oLf2I_Jp-6NSLTDcXvVcQ",
  projectId: "lance-woolie-webfarm",
  // add other config if needed
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
// =============================================
// MOON SALOON script.js – DEPARTURE MODEL
// =============================================

// Prevent duplicate transition triggers
let transitionAlreadyPlayed = false;

// ====================== AUDIO ======================
const clickSounds = [
  new Audio('sounds/ricochet-1.mp3'),
  new Audio('sounds/ricochet-2.mp3')
];
clickSounds.forEach(sound => { 
  sound.preload = 'auto'; 
  sound.volume = 0.85; 
});

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

function explode(mx, my, hexColor) {
  return new Promise(resolve => {
    const numParticles = 30;
    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    canvas.style.cssText = `position:fixed; left:${mx - size/2}px; top:${my - size/2}px; pointer-events:none; z-index:10000;`;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x: size / 2, y: size / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, decay: 0.02,
        size: Math.random() * 4 + 2,
        color: hexColor
      });
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.98; p.vy *= 0.98;
        p.life -= p.decay;
        if (p.life > 0) {
          alive = true;
          const r = parseInt(p.color.slice(1,3),16);
          const g = parseInt(p.color.slice(3,5),16);
          const b = parseInt(p.color.slice(5,7),16);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.life})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      if (alive) requestAnimationFrame(animate);
      else { canvas.remove(); resolve(); }
    }
    animate();
  });
}

function updateScore(points, x, y) {
  score += points;
  sessionStorage.setItem('score', score.toString());
  if (scoreEl) {
    scoreEl.textContent = score.toString().padStart(6, '0');
    scoreEl.className = '';
    if (score === 0) scoreEl.classList.add('score-zero');
    else if (score < 100) scoreEl.classList.add('score-low');
    else if (score < 1000) scoreEl.classList.add('score-mid');
    else if (score < 2001) scoreEl.classList.add('score-high');
    else scoreEl.classList.add('score-max');
  }
}

function updateHealthBar() {
  if (!healthProgress || !healthBar) return;
  const percent = Math.max(0, Math.min(100, health)) / 100;
  healthProgress.style.width = `${percent * 100}%`;
  let color = percent >= 0.8 ? '#4CAF50' :
              percent >= 0.51 ? '#FFD700' :
              percent > 0 ? '#FF9800' : '#F44336';
  healthProgress.style.backgroundColor = color;
}

function initHealthBar() {
  healthBar = document.getElementById("health-bar");
  healthProgress = document.getElementById("health-progress");
  if (healthBar && healthProgress) updateHealthBar();
}

function generateNav() {
  const navHTML = `... your navbar code ...`; // (keep your existing navHTML)
  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) placeholder.innerHTML = navHTML;

  const currentPage = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').replace('.html','');
    if (href === currentPage) link.classList.add('active');
  });
}

// ====================== MAIN TRANSITION FUNCTION ======================
function playForwardTransition(nextUrl) {
  if (transitionAlreadyPlayed) return;
  transitionAlreadyPlayed = true;

  const overlay = document.getElementById('transition-overlay');
  const forwardVideo = document.getElementById('forward-video');

  if (!overlay || !forwardVideo) {
    window.location.href = nextUrl;
    return;
  }

  overlay.style.display = 'block';
  forwardVideo.currentTime = 0;
  forwardVideo.play().catch(() => {});

  forwardVideo.onended = () => {
    window.location.href = nextUrl;
  };

  setTimeout(() => {
    window.location.href = nextUrl;
  }, 2800);
}

document.addEventListener('DOMContentLoaded', () => {
  generateNav();
  scoreEl = document.getElementById('score-value');
  if (scoreEl) scoreEl.textContent = score.toString().padStart(6, '0');

  setTimeout(() => {
    initHealthBar();
    updateScore(0);
  }, 200);

  // === TRANSITION SETUP ===
  const overlay = document.getElementById('transition-overlay');
  const forwardVideo = document.getElementById('forward-video');
  const reverseVideo = document.getElementById('reverse-video');

  // Sub-page reverse transition on load
  if (reverseVideo && overlay) {
    reverseVideo.currentTime = 0;
    reverseVideo.play().catch(() => {});
    reverseVideo.onended = () => {
      overlay.style.display = 'none';
    };
  }

  // Index page – prop shooting
  const saloonSVG = document.getElementById('saloon-svg');
  if (saloonSVG) {
    document.querySelectorAll('.moonsaloon-prop').forEach(prop => {
      prop.addEventListener('click', e => {
        e.stopImmediatePropagation();
        const rect = prop.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        let hits = parseInt(prop.dataset.hits || '0') + 1;
        prop.dataset.hits = hits;

        const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
        sound.currentTime = 0;
        sound.play().catch(() => {});

        updateScore(parseInt(prop.dataset.score), x, y);
        explode(x, y, '#00ffcc');
        prop.classList.add('hit');
        setTimeout(() => prop.classList.remove('hit'), 160);

        if (hits >= parseInt(prop.dataset.maxHits)) {
          prop.classList.add('destroyed');
          playForwardTransition(prop.dataset.link);
        }
      });
    });
  }
});

document.addEventListener('mousemove', e => {
  mousePos = { x: e.clientX, y: e.clientY };
});
