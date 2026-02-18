// Preload click ricochet sounds
const clickSounds = [
  new Audio('sounds/ricochet-1.mp3'),
  new Audio('sounds/ricochet-2.mp3')
];
clickSounds.forEach(sound => {
  sound.preload = 'auto';
  sound.volume = 0.85;
});
// Preload game over sound
const gameOverSound = new Audio('sounds/ScottySteel.mp3');
gameOverSound.volume = 0.85;
// Global mouse position for particle reactivity
let mousePos = { x: 0, y: 0 };
// Score management
let score = 0;
let scoreEl = null;
// Health management for bar
let health = parseFloat(sessionStorage.getItem('health')) || 100;
let healthBar = null;
let healthProgress = null;
let gameOverShown = false;
// Function to wait for audio to finish playing
function waitForAudio(sound) {
  return sound.play().then(() => {
    return new Promise((resolve) => {
      sound.onended = () => {
        sound.onended = null;
        resolve();
      };
    });
  }).catch(err => {
    console.log('Sound play failed:', err);
    return Promise.resolve(); // Proceed without waiting if play fails
  });
}
// Function to wait for animation end
function waitForAnimation(element, animationName) {
  return new Promise((resolve) => {
    const handler = (e) => {
      if (e.animationName === animationName) {
        element.removeEventListener('animationend', handler);
        resolve();
      }
    };
    element.addEventListener('animationend', handler);
    // Fallback timeout
    setTimeout(resolve, 1200);
  });
}
// Explosion particle function (add this for sub-dot hits and game over reset)
function explode(mx, my, hexColor) {
  return new Promise((resolve) => {
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
      if (alive) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
        resolve();
      }
    }
    animate();
  });
}
function updateScore(points, x = undefined, y = undefined) {
  score += points;
  sessionStorage.setItem('score', score.toString());
  if (scoreEl) {
    const displayText = score.toString().padStart(6, '0');
    scoreEl.textContent = displayText;
    // Trigger pulse animation
    const display = scoreEl.closest('.score-display');
    if (display) {
      display.classList.add('updated');
      setTimeout(() => display.classList.remove('updated'), 500);
    }
    // Update total score color class
    scoreEl.className = '';
    if (score === 0) {
      scoreEl.classList.add('score-zero');
    } else if (score < 100) {
      scoreEl.classList.add('score-low');
    } else if (score < 1000) {
      scoreEl.classList.add('score-mid');
    } else if (score < 2001) {
      scoreEl.classList.add('score-high');
    } else {
      scoreEl.classList.add('score-max');
    }
  }
  if (x !== undefined && y !== undefined) {
    showFloatingPoints(points, x, y);
  }
  // Health behaviors
  if (points === 69) {
    health = Math.max(0, health - 13);
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
      gameOverText.style.cssText = 'color: #F44336; font-size: 12px; font-weight: bold; text-align: center; line-height: 12px; padding: 0 5px;'; /* Smaller font and line-height for fit */
      healthBar.appendChild(gameOverText);
      const onSoundEnd = async () => {
        const healthRect = healthBar.getBoundingClientRect();
        const healthX = healthRect.left + healthRect.width / 2;
        const healthY = healthRect.top + healthRect.height / 2;
        await explode(healthX, healthY, '#FF4500'); // Red-orange particles for game over reset
        // Reset to initial state
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
      // Fallback if already ended
      if (gameOverSound.ended) {
        onSoundEnd();
      }
    }
    return;
  }
  healthProgress.style.width = `${percent * 100}%`;
  let color = '';
  if (percent >= 0.80) {
    color = '#4CAF50'; // Green
  } else if (percent >= 0.51) {
    color = '#FFD700'; // Yellow
  } else if (percent > 0) {
    color = '#FF9800'; // Orange
  } else {
    color = '#F44336'; // Red
  }
  healthProgress.style.backgroundColor = color;
  // Blink if low health
  if (percent < 0.1) {
    if (healthDisplay) healthDisplay.classList.add('low-health');
  } else {
    if (healthDisplay) healthDisplay.classList.remove('low-health');
  }
  // Trigger pulse on update
  if (healthDisplay) {
    healthDisplay.classList.add('updated');
    setTimeout(() => healthDisplay.classList.remove('updated'), 500);
  }
}
function initHealthBar() {
  healthBar = document.getElementById("health-bar");
  healthProgress = document.getElementById("health-progress");
  if (!healthBar || !healthProgress) return;
  // Initial update
  updateHealthBar();
}
function showFloatingPoints(points, mx, my) {
  let color = '#FFD700'; // Default
  if (points < 100) color = 'rgba(255, 165, 0, 0.8)'; // Faded orange
  else if (points < 1000) color = '#FFA500'; // Yellow orange
  else if (points < 2001) color = '#FF4500'; // Red yellow (orangered)
  else color = '#00FFFF'; // Cyan
  const canvas = document.createElement('canvas');
  const size = 200;
  const fontSize = 36; // 300% of original 12px
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
  // Delay particle effect by 300ms
  setTimeout(() => {
    // Sample pixels for particles (every 2px for performance)
    const imageData = ctx.getImageData(0, 0, size, size / 2);
    const particles = [];
    for (let py = 0; py < size / 2; py += 2) {
      for (let px = 0; px < size; px += 2) {
        const i = (py * size + px) * 4;
        if (imageData.data[i + 3] > 128) {
          particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 6, // Scatter velocity
            vy: (Math.random() - 0.5) * 6 - 1, // Slight upward bias
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
        // Reactive swarm: attract to cursor if in proximity
        const dx = mousePos.x - (canvasRect.left + p.x);
        const dy = mousePos.y - (canvasRect.top + p.y);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = 0.8 / (dist + 1);
          p.vx += dx * force * 0.1;
          p.vy += dy * force * 0.1;
        }
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97; // Friction
        p.vy *= 0.97;
        p.life -= p.decay;
        if (p.life > 0) {
          alive = true;
          ctx.fillStyle = p.color.replace(/[\d.]+(?=\))/, (m) => (parseFloat(m) * p.life).toFixed(2));
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); // Pixel art style
        }
      });
      if (alive) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    animate();
  }, 300);
}
// Reusable Nav Generator (Updated with Health Progress Bar in Header - Floating)
function generateNav() {
  let navHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" style="position: fixed !important; top: 0; left: 0; right: 0; z-index: 1000 !important;">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img src="/img/BEARDsmall.png" alt="Lance Woolie" style="height: 20px;"> Lance Woolie <!-- Absolute path -->
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
            <span class="score-label">Score</span> <span id="score-value">000000</span> <!-- Removed "Your" -->
          </div>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Music</a>
              <ul class="dropdown-menu horizontal-dropdown">
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/a4glqme" target="_blank">
                  <img src="/img/Ubermenu.jpg" alt="Uber" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;"> <!-- Absolute -->
                  Uber
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/lancewoolietoodrunk" target="_blank">
                  <img src="/img/TooDrunkmenu.jpg" alt="Too Drunk" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;"> <!-- Absolute -->
                  Too Drunk
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/lancewoolieworstenemy" target="_blank">
                  <img src="/img/WorstEnemymenu.jpg" alt="Worst Enemy" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;"> <!-- Absolute -->
                  Worst Enemy
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="music.html">
                  <img src="/img/Fullcatalogmenu.jpg" alt="Full Catalog" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;"> <!-- Absolute -->
                  Full Catalog
                </a></li>
              </ul>
            </li>
            <li class="nav-item"><a class="nav-link" href="events.html">Events</a></li>
            <li class="nav-item"><a class="nav-link" href="origins.html">Origins</a></li>
            <li class="nav-item"><a class="nav-link" href="merch.html">Merch</a></li>
            <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;
  // Auto-Highlight Active Page (Enhanced for Dropdowns)
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = navHTML;
  const navItems = tempDiv.querySelectorAll('.nav-item a[href]');
  navItems.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = (currentPage === 'index' && href === 'index.html') || href.includes(currentPage);
    if (isActive) {
      link.closest('.nav-item').classList.add('active');
    }
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
    // Fallback: Create and insert nav if placeholder missing
    const newNav = document.createElement('div');
    newNav.innerHTML = navHTML;
    document.body.insertBefore(newNav, document.body.firstChild);
    console.log('Nav placeholder missing; created and prepended to body.');
    const myCollapse = document.getElementById('navbarNav');
    if (myCollapse) {
      const existingCollapse = bootstrap.Collapse.getInstance(myCollapse);
      if (existingCollapse) existingCollapse.dispose();
      new bootstrap.Collapse(myCollapse, { toggle: false });
    }
  }
}
// Reusable Footer Generator (Removed Scoreboard, Added Subscribe Raccoon - Floating)
function generateFooter() {
  const footerHTML = `
    <footer class="footer bg-dark text-light py-1" style="position: fixed !important; bottom: 0; left: 0; right: 0; z-index: 1001 !important; border-top: 1px solid #0074D9;">
      <div class="container">
        <!-- Bottom Row: Contact, Copyright, Icons -->
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
            <p class="mb-0 small">&copy; 2025 Lance Woolie. All rights reserved.</p>
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
    // Fallback: Append directly to body if placeholder missing
    placeholder = document.createElement('div');
    placeholder.id = 'footer-placeholder';
    document.body.appendChild(placeholder);
    console.log('Footer placeholder missing; created and appended to body.');
  }
  placeholder.innerHTML = footerHTML;
  // Ensure footer is always on top
  const footer = placeholder.querySelector('.footer');
  if (footer) {
    footer.style.zIndex = '1002';
  }
  // Re-init cowboy hat after insert
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
// Load Nav & Footer on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize score
  score = parseInt(sessionStorage.getItem('score')) || 0;
  generateNav();
  generateFooter();
  // Init score display after nav generation
  scoreEl = document.getElementById('score-value');
  if (scoreEl) {
    const displayText = score.toString().padStart(6, '0');
    scoreEl.textContent = displayText;
    // Set initial color class
    if (score === 0) {
      scoreEl.classList.add('score-zero');
    } else if (score < 100) {
      scoreEl.classList.add('score-low');
    } else if (score < 1000) {
      scoreEl.classList.add('score-mid');
    } else if (score < 2001) {
      scoreEl.classList.add('score-high');
    } else {
      scoreEl.classList.add('score-max');
    }
  }
  // Init health bar after nav (beefier delay + force init)
  setTimeout(() => {
    initHealthBar();
    updateScore(0); // Reset display without adding points
  }, 200);
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  // Add Neon Cursor Toy effect to ORIGINS ONLY (avoids bloat/CSP elsewhere)
  if (currentPage === 'origins') {
    // Add Montserrat font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    // Add neon cursor styles
    const style = document.createElement('style');
    style.textContent = `
      body {
        cursor: none !important;
        touch-action: pan-y;
        overflow-x: hidden;
      }
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    // Load neon cursor module
    const neonScript = document.createElement('script');
    neonScript.type = 'module';
    neonScript.textContent = `
      import { neonCursor } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js'
      neonCursor({
        el: document.body,
        shaderPoints: 16,
        curvePoints: 80,
        curveLerp: 0.5,
        radius1: 5,
        radius2: 30,
        velocityTreshold: 10,
        sleepRadiusX: 100,
        sleepRadiusY: 100,
        sleepTimeCoefX: 0.0025,
        sleepTimeCoefY: 0.0025
      })
    `;
    document.head.appendChild(neonScript);
  }
  // Global sub-dot click handlers (works on index, empty on other pages)
  document.querySelectorAll('.sub-dot').forEach(sub => {
    sub.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const linkHref = sub.href;
      const target = sub.target || '_self';
      const rect = sub.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const subId = sub.dataset.id;
      const container = sub.closest('.dot-container');
      const subDots = sub.closest('.sub-dots');
      const mainDot = container ? container.querySelector('.main-dot') : null;
      const clickedSubDots = JSON.parse(sessionStorage.getItem('clickedSubDots') || '[]');
      let bonusPoints = 0;
      if (container && container.classList.contains('music-container')) {
        bonusPoints = 420;
      }
      if (clickedSubDots.includes(subId)) {
        // Direct navigation if already clicked in session
        if (target === '_blank') {
          window.open(linkHref, '_blank');
        } else {
          window.location.href = linkHref;
        }
      } else {
        // Play ricochet sound and wait
        const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
        sound.currentTime = 0;
        const soundPromise = waitForAudio(sound);
        // Trigger hit animation and wait
        sub.classList.add('hit');
        const animPromise = waitForAnimation(sub, 'hit-shot');
        // Award points and show floating points immediately
        updateScore(1000 + bonusPoints, x, y);
        // Wait for both sound and animation to complete
        await Promise.all([soundPromise, animPromise]);
        // Deploy particle effects
        await explode(x, y, '#FFD700');
        // Reset to non-hover state
        sub.classList.remove('hit');
        if (subDots) subDots.classList.remove('active');
        if (mainDot) mainDot.classList.remove('hidden');
        // Mark as clicked in session
        clickedSubDots.push(subId);
        sessionStorage.setItem('clickedSubDots', JSON.stringify(clickedSubDots));
        // Navigate
        if (target === '_blank') {
          window.open(linkHref, '_blank');
        } else {
          window.location.href = linkHref;
        }
      }
    });
  });
  // Global main-dot click handlers (works on index, empty on other pages)
  document.querySelectorAll('.main-dot').forEach(dot => {
    dot.addEventListener('click', async (e) => {
      e.preventDefault();
      const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
      sound.currentTime = 0;
      await waitForAudio(sound);
      const container = dot.closest('.dot-container');
      let bonusPoints = 0;
      if (container && container.classList.contains('music-container')) {
        bonusPoints = 420;
      }
      updateScore(800 + bonusPoints, e.clientX, e.clientY);
      window.location.href = dot.href;
    });
  });
  // Delay navigation for non-dropdown-toggle nav links with sound completion
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (!link || link.classList.contains('main-dot') || link.classList.contains('sub-dot') || link.getAttribute('data-bs-toggle') === 'dropdown') return;
    e.preventDefault();
    const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    sound.currentTime = 0;
    await waitForAudio(sound);
    let points = 500; // Default for nav links
    const href = link.getAttribute('href');
    if (href === 'merch.html') points = 2500;
    if (link.closest('.dropdown-item')) points = 500;
    if (href && href.includes('#email-subscribe')) points = 1500;
    updateScore(points, e.clientX, e.clientY);
    if (link.target === '_blank') {
      window.open(link.href, '_blank');
    } else {
      window.location.href = link.href;
    }
  });
  // Separate handler for dropdown items
  document.addEventListener('click', async (e) => {
    const dropdownItem = e.target.closest('.dropdown-item a');
    if (!dropdownItem) return;
    e.preventDefault();
    e.stopPropagation();
    const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    sound.currentTime = 0;
    await waitForAudio(sound);
    const points = 500;
    updateScore(points, e.clientX, e.clientY);
    if (dropdownItem.target === '_blank') {
      window.open(dropdownItem.href, '_blank');
    } else {
      window.location.href = dropdownItem.href;
    }
  });
  // YouTube play detection (music page only)
  if (currentPage === 'music') {
    document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').forEach(iframe => {
      if (!iframe.src.includes('enablejsapi=1')) {
        iframe.src += (iframe.src.includes('?') ? '&' : '?') + 'enablejsapi=1';
      }
    });
    window.addEventListener('message', (e) => {
      if (e.origin !== 'https://www.youtube.com') return;
      const data = e.data;
      if (data && data.event === 'onStateChange' && data.data === 1) { // YT.PlayerState.PLAYING
        updateScore(1000, window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  }
  // Site-wide click sound and scoring on all clicks (skip links/buttons handled elsewhere)
  const form = document.getElementById('contact-form');
  document.addEventListener('click', async (e) => {
    if (e.target.closest('a, button')) return;
    const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    sound.currentTime = 0;
    await waitForAudio(sound);
    let points = 69;
    const target = e.target;
    if (form && target.type === 'submit' && form.contains(target)) {
      points = 100;
    }
    if (target.closest('#cowboy-hat')) {
      points = 420;
    }
    updateScore(points, e.clientX, e.clientY);
  });
  // Smooth Scroll for Internal Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  // Index Page Specific: Ricochet Load Animation (post content load, post site shaking, on load of bullet hole dots)
  if (currentPage === 'index') {
    window.addEventListener('load', () => {
      const body = document.body;
      const dots = document.querySelectorAll('.main-dot');
      // Shake the body
      body.classList.add('shake');
      setTimeout(() => {
        // Trigger playback post-shake, synced with bullet hole dots animation
        // ricochetSound.play().catch(e => console.log('Audio play failed:', e)); // Removed as overkill
       
        // Fire first 3 dots quicker (100ms intervals)
        setTimeout(() => animateDot(dots[0]), 0);
        setTimeout(() => animateDot(dots[1]), 100);
        setTimeout(() => animateDot(dots[2]), 200);
       
        // Pause 0.3s (300ms) after the third dot
        setTimeout(() => {
          // Then fire last 2 dots quick like the first 3 (100ms interval)
          animateDot(dots[3]);
          setTimeout(() => animateDot(dots[4]), 100);
        }, 500); // 200 (last first-dot) + 300 pause = 500ms
      }, 1000);
    });
    function animateDot(dot) {
      dot.classList.add('ricochet');
      setTimeout(() => {
        dot.classList.add('visible');
      }, 250);
    }
    // Generic submenu logic for containers (index page only, but safe to run globally)
    document.querySelectorAll('.dot-container').forEach(container => {
      const mainDot = container.querySelector('.main-dot');
      const subDots = container.querySelector('.sub-dots');
      const hasSubs = subDots.children.length > 0;
      let hideTimeout;
      if (!hasSubs) return;
      container.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        mainDot.classList.add('hidden');
        subDots.classList.add('active');
      });
      container.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
          subDots.classList.remove('active');
          mainDot.classList.remove('hidden');
        }, 1000); // Increased timeout for easier navigation
      });
      container.querySelectorAll('.sub-dot').forEach(sub => {
        sub.addEventListener('mouseenter', () => {
          clearTimeout(hideTimeout);
        });
        sub.addEventListener('mouseleave', () => {
          hideTimeout = setTimeout(() => {
            subDots.classList.remove('active');
            mainDot.classList.remove('hidden');
          }, 1000); // Increased timeout
        });
      });
    });
  }

  // CRAZY ARMS POP-UP (shows once per session on index)
  if (currentPage === 'index' && !sessionStorage.getItem('crazyArmsShown')) {
    setTimeout(() => {
      const modal = new bootstrap.Modal(document.getElementById('crazyArmsModal'));
      modal.show();
      sessionStorage.setItem('crazyArmsShown', 'true');
    }, 1500);
  }
});
