
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

function waitForAudio(sound) {
  return sound.play().then(() => new Promise(resolve => {
    sound.onended = () => {
      sound.onended = null;
      resolve();
    };
  })).catch(() => Promise.resolve());
}

function waitForAnimation(element, animationName) {
  return new Promise(resolve => {
    const handler = e => {
      if (e.animationName === animationName) {
        element.removeEventListener('animationend', handler);
        resolve();
      }
    };
    element.addEventListener('animationend', handler);
    setTimeout(resolve, 1200);
  });
}

function explode(mx, my, hexColor) {
  return new Promise(resolve => {
    const numParticles = 30;
    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    canvas.style.cssText = `
      position: fixed;
      left: ${mx - size / 2}px;
      top: ${my - size / 2}px;
      pointer-events: none;
      z-index: 10000;
    `;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x: size / 2,
        y: size / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02,
        size: Math.random() * 4 + 2,
        color: hexColor
      });
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay;
        if (p.life > 0) {
          alive = true;
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.life})`;
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
    const displayText = score.toString().padStart(6, '0');
    scoreEl.textContent = displayText;
    const display = scoreEl.closest('.score-display');
    if (display) {
      display.classList.add('updated');
      setTimeout(() => display.classList.remove('updated'), 500);
    }
    scoreEl.className = '';
    if (score === 0) scoreEl.classList.add('score-zero');
    else if (score < 100) scoreEl.classList.add('score-low');
    else if (score < 1000) scoreEl.classList.add('score-mid');
    else if (score < 2001) scoreEl.classList.add('score-high');
    else scoreEl.classList.add('score-max');
  }
  if (x !== undefined && y !== undefined) showFloatingPoints(points, x, y);
  if (points === 69) {
    health = Math.max(0, health - 26);
    sessionStorage.setItem('health', health.toString());
    updateHealthBar();
  } else {
    health = Math.min(100, health + 4);
    sessionStorage.setItem('health', health.toString());
    updateHealthBar();
  }
}

function updateHealthBar() {
  if (!healthProgress || !healthBar) return;
  const percent = health / 100;
  const healthDisplay = healthBar.closest('.health-display');
  if (percent <= 0) {
    if (!gameOverShown) {
      gameOverSound.play().catch(err => console.log('Game over sound failed:', err));
      gameOverShown = true;
      healthBar.innerHTML = '';
      const gameOverText = document.createElement('div');
      gameOverText.textContent = 'GAME OVER';
      gameOverText.style.cssText = 'color: #F44336; font-size: 12px; font-weight: bold; text-align: center; line-height: 12px; padding: 0 5px;';
      healthBar.appendChild(gameOverText);
      const onSoundEnd = async () => {
        const healthRect = healthBar.getBoundingClientRect();
        const healthX = healthRect.left + healthRect.width / 2;
        const healthY = healthRect.top + healthRect.height / 2;
        await explode(healthX, healthY, '#FF4500');
        healthBar.innerHTML = '<div id="health-progress"></div>';
        healthProgress = document.getElementById('health-progress');
        health = 100;
        score = 0;
        sessionStorage.setItem('health', '100');
        sessionStorage.setItem('score', '0');
        gameOverShown = false;
        if (scoreEl) {
          scoreEl.textContent = '000000';
          scoreEl.classList.remove('score-low', 'score-mid', 'score-high', 'score-max');
          scoreEl.classList.add('score-zero');
        }
        updateHealthBar();
      };
      gameOverSound.onended = onSoundEnd;
      if (gameOverSound.ended) onSoundEnd();
    }
    return;
  }
  healthProgress.style.width = `${percent * 100}%`;
  let color = '';
  if (percent >= 0.80) color = '#4CAF50';
  else if (percent >= 0.51) color = '#FFD700';
  else if (percent > 0) color = '#FF9800';
  else color = '#F44336';
  healthProgress.style.backgroundColor = color;
  if (percent < 0.1) {
    if (healthDisplay) healthDisplay.classList.add('low-health');
  } else {
    if (healthDisplay) healthDisplay.classList.remove('low-health');
  }
  if (healthDisplay) {
    healthDisplay.classList.add('updated');
    setTimeout(() => healthDisplay.classList.remove('updated'), 500);
  }
}

function initHealthBar() {
  healthBar = document.getElementById("health-bar");
  healthProgress = document.getElementById("health-progress");
  if (!healthBar || !healthProgress) return;
  updateHealthBar();
}

function showFloatingPoints(points, mx, my) {
  let color = '#FFD700';
  if (points < 100) color = 'rgba(255, 165, 0, 0.8)';
  else if (points < 1000) color = '#FFA500';
  else if (points < 2001) color = '#FF4500';
  else color = '#00FFFF';
  const canvas = document.createElement('canvas');
  const size = 200;
  const fontSize = 36;
  canvas.width = size;
  canvas.height = size / 2;
  canvas.style.cssText = `
    position: fixed;
    left: ${mx - size / 2}px;
    top: ${my - size / 4 - 20}px;
    pointer-events: none;
    z-index: 10000;
  `;
  const ctx = canvas.getContext('2d');
  ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${points}`, size / 2, size / 4);
  ctx.textShadow = `0 0 3px ${color}`;
  document.body.appendChild(canvas);
  setTimeout(() => {
    const imageData = ctx.getImageData(0, 0, size, size / 2);
    const particles = [];
    for (let py = 0; py < size / 2; py += 2) {
      for (let px = 0; px < size; px += 2) {
        const i = (py * size + px) * 4;
        if (imageData.data[i + 3] > 128) {
          particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 1,
            life: 1,
            decay: 0.015,
            size: 2,
            color: color
          });
        }
      }
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const canvasRect = canvas.getBoundingClientRect();
      let alive = false;
      particles.forEach(p => {
        const dx = mousePos.x - (canvasRect.left + p.x);
        const dy = mousePos.y - (canvasRect.top + p.y);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = 0.8 / (dist + 1);
          p.vx += dx * force * 0.1;
          p.vy += dy * force * 0.1;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= p.decay;
        if (p.life > 0) {
          alive = true;
          ctx.fillStyle = p.color.replace(/[\d.]+(?=\))/, (m) => (parseFloat(m) * p.life).toFixed(2));
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      });
      if (alive) requestAnimationFrame(animate);
      else canvas.remove();
    }
    animate();
  }, 300);
}

function generateNav() {
  let navHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" style="position: fixed !important; top: 0; left: 0; right: 0; z-index: 1000 !important;">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img src="/img/BEARDsmall.png" alt="Lance Woolie" style="height: 20px;"> Lance Woolie
        </a>
        <div class="score-header mx-auto d-flex justify-content-center align-items-center gap-3">
          <div class="health-display">
            <div class="health-bar">
              <div id="health-bar">
                <div id="health-progress"></div>
              </div>
            </div>
          </div>
          <div class="score-display">
            <span class="score-label">Score</span> <span id="score-value">000000</span>
          </div>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="music.html">Music</a></li>
            <li class="nav-item"><a class="nav-link" href="events.html">Events</a></li>
            <li class="nav-item"><a class="nav-link" href="origins.html">Origins</a></li>
            <li class="nav-item"><a class="nav-link" href="merch.html">Merch</a></li>
            <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = navHTML;
  const navItems = tempDiv.querySelectorAll('.nav-item a[href]');
  navItems.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = (currentPage === 'index' && href === 'index.html') || href.includes(currentPage);
    if (isActive) link.closest('.nav-item').classList.add('active');
  });
  navHTML = tempDiv.innerHTML;
  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) {
    placeholder.innerHTML = navHTML;
    const myCollapse = document.getElementById('navbarNav');
    if (myCollapse) {
      const existingCollapse = bootstrap.Collapse.getInstance(myCollapse);
      if (existingCollapse) existingCollapse.dispose();
      new bootstrap.Collapse(myCollapse, { toggle: false });
    }
  } else {
    const newNav = document.createElement('div');
    newNav.innerHTML = navHTML;
    document.body.insertBefore(newNav, document.body.firstChild);
    const myCollapse = document.getElementById('navbarNav');
    if (myCollapse) {
      const existingCollapse = bootstrap.Collapse.getInstance(myCollapse);
      if (existingCollapse) existingCollapse.dispose();
      new bootstrap.Collapse(myCollapse, { toggle: false });
    }
  }
}

function generateFooter() {
  const footerHTML = `
    <footer class="footer bg-dark text-light py-1" style="position: fixed !important; bottom: 0; left: 0; right: 0; z-index: 1001 !important; border-top: 1px solid #0074D9;">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-4 d-flex align-items-center">
            <a href="contact.html" class="text-light me-3">Contact</a>
            <div class="weapon-select">
              <select id="weapon-dropdown">
                <option selected>Laser sights (lv 1)</option>
                <option disabled>2x Barrel Shogun (lv 2)</option>
                <option disabled>Bazooka (lv 3)</option>
              </select>
            </div>
          </div>
          <div class="col-md-4 text-center">
            <div class="cowboy-hat-icon mb-1" id="cowboy-hat">🤠</div>
            <p class="mb-0 small">© 2025 Lance Woolie. All rights reserved.</p>
          </div>
          <div class="col-md-4 text-end">
            <a href="https://x.com/LanceWoolie" target="_blank" class="me-3" title="X (Twitter)" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;" rel="noopener">
              <img src="https://cdn.simpleicons.org/x/ffffff/24.svg" alt="X" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.facebook.com/lancewooliemusic/" target="_blank" class="me-3" title="Facebook" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;" rel="noopener">
              <img src="https://cdn.simpleicons.org/facebook/ffffff/24.svg" alt="Facebook" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.tiktok.com/@lancewoolie" target="_blank" class="me-3" title="TikTok" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;" rel="noopener">
              <img src="https://cdn.simpleicons.org/tiktok/ffffff/24.svg" alt="TikTok" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.youtube.com/channel/UC9NUm7_BejCwctJ9u6dps7g" target="_blank" class="me-3" title="YouTube" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;" rel="noopener">
              <img src="https://cdn.simpleicons.org/youtube/ffffff/24.svg" alt="YouTube" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.instagram.com/lancewoolie/" target="_blank" title="Instagram" style="display: inline-block; width: 24px; height: 24px;" rel="noopener">
              <img src="https://cdn.simpleicons.org/instagram/ffffff/24.svg" alt="Instagram" style="width: 24px; height: 24px;">
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
  let placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.id = 'footer-placeholder';
    document.body.appendChild(placeholder);
  }
  placeholder.innerHTML = footerHTML;
  const footer = placeholder.querySelector('.footer');
  if (footer) footer.style.zIndex = '1002';
  const cowboyHat = document.getElementById('cowboy-hat');
  if (cowboyHat) {
    cowboyHat.textContent = '🤠';
    const surprises = [
      () => { cowboyHat.textContent = '🪕'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
      () => { cowboyHat.style.color = '#FFD700'; setTimeout(() => cowboyHat.style.color = 'white', 1000); },
      () => { alert('Twang! "Do it." – Lance'); },
      () => { cowboyHat.style.transform = 'rotate(360deg)'; setTimeout(() => cowboyHat.style.transform = 'rotate(0deg)', 500); },
      () => { cowboyHat.textContent = '🌵'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
      () => { window.scrollTo({ top: 0, behavior: 'smooth' }); cowboyHat.textContent = '⬆️'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); }
    ];
    cowboyHat.addEventListener('click', () => surprises[Math.floor(Math.random() * surprises.length)]());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  score = parseInt(sessionStorage.getItem('score')) || 0;
  generateNav();
  // Footer is hidden via CSS – no generateFooter() call needed until re-enabled
  scoreEl = document.getElementById('score-value');
  if (scoreEl) {
    const displayText = score.toString().padStart(6, '0');
    scoreEl.textContent = displayText;
    if (score === 0) scoreEl.classList.add('score-zero');
    else if (score < 100) scoreEl.classList.add('score-low');
    else if (score < 1000) scoreEl.classList.add('score-mid');
    else if (score < 2001) scoreEl.classList.add('score-high');
    else scoreEl.classList.add('score-max');
  }
  setTimeout(() => { initHealthBar(); updateScore(0); }, 200);
  const forwardVideo = document.getElementById('forward-video');
  const overlay = document.getElementById('transition-overlay');
  // Preload on load/refresh (once)
  forwardVideo.preload = 'auto';
  forwardVideo.load(); // Start buffering early
  const saloonSVG = document.getElementById('saloon-svg');
  if (saloonSVG) { // INDEX ONLY
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
          forwardVideo.src = prop.dataset.forwardVideo;
          forwardVideo.currentTime = 0;
          forwardVideo.playbackRate = 1.3; // Speed up slightly
          const muted = isMobile();
          forwardVideo.muted = muted;
          forwardVideo.volume = muted ? 0 : 0.8;
          overlay.style.display = 'block';
          let navSafety = setTimeout(() => window.location.href = prop.dataset.link, 7000); // 7 sec force nav
          forwardVideo.oncanplaythrough = () => {
            forwardVideo.play().catch(() => {
              clearTimeout(navSafety);
              window.location.href = prop.dataset.link;
            });
          };
          forwardVideo.onended = () => {
            clearTimeout(navSafety);
            window.location.href = prop.dataset.link;
          };
        }
      });
    });
    // Dry fire, timer, etc. – your original code here (unchanged)
  }
  // Reverse doors logic stays on sub-pages (no change needed)
});
