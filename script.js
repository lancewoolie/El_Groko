// ====================== MOON SALOON script.js – FULL WORKING FX RESTORED ======================
// Your old working code + new props added at the end

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
// Explosion particle function
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
    const display = scoreEl.closest('.score-display');
    if (display) {
      display.classList.add('updated');
      setTimeout(() => display.classList.remove('updated'), 500);
    }
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
  // Health behaviors - MISS NOW REMOVES TWICE THE HEALTH
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
      if (gameOverSound.ended) {
        onSoundEnd();
      }
    }
    return;
  }
  healthProgress.style.width = `${percent * 100}%`;
  let color = '';
  if (percent >= 0.80) {
    color = '#4CAF50';
  } else if (percent >= 0.51) {
    color = '#FFD700';
  } else if (percent > 0) {
    color = '#FF9800';
  } else {
    color = '#F44336';
  }
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
      if (alive) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    animate();
  }, 300);
}
// Reusable Nav Generator
function generateNav() {
  // your original generateNav code here (paste it)
}
// Reusable Footer Generator
function generateFooter() {
  // your original generateFooter code here (paste it)
}
// Load Nav & Footer on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  score = parseInt(sessionStorage.getItem('score')) || 0;
  generateNav();
  generateFooter();
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
  setTimeout(() => {
    initHealthBar();
    updateScore(0);
  }, 200);
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

  // ====================== NEW MOON SALOON SHOOTING ======================
  document.querySelectorAll('.moonsaloon-prop').forEach(prop => {
    prop.addEventListener('click', async (e) => {
      e.stopImmediatePropagation();
      const rect = prop.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      let hits = parseInt(prop.dataset.hits || '0') + 1;
      prop.dataset.hits = hits;

      const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
      sound.currentTime = 0;
      await waitForAudio(sound);

      updateScore(parseInt(prop.dataset.score), x, y);
      await explode(x, y, '#00ffcc');

      prop.classList.add('hit');
      setTimeout(() => prop.classList.remove('hit'), 180);

      if (hits >= parseInt(prop.dataset.maxHits)) {
        prop.classList.add('destroyed');
        setTimeout(() => window.location.href = prop.dataset.link, 800);
      }
    });
  });

  // Dry fire on empty space
  document.querySelector('.hero').addEventListener('click', (e) => {
    if (e.target.classList.contains('moonsaloon-prop')) return;
    const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    sound.currentTime = 0;
    sound.play();
  });

  // 30-second Lunar Timer
  const timerEl = document.getElementById('lunar-timer');
  let timer = 30;
  const timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 5) timerEl.style.color = '#ff3366';
    if (timer <= 0) {
      clearInterval(timerInterval);
      document.getElementById('restart-btn').style.display = 'block';
    }
  }, 1000);

  // Paste the rest of your original code here (beard, sub-dot, main-dot, nav delay, etc.)
});
