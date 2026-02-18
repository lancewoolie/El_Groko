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

// ... ALL YOUR ORIGINAL FUNCTIONS (waitForAudio, waitForAnimation, explode, showFloatingPoints, generateNav, generateFooter, initHealthBar, updateHealthBar, etc.) remain EXACTLY the same ...

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
    if (score === 0) scoreEl.classList.add('score-zero');
    else if (score < 100) scoreEl.classList.add('score-low');
    else if (score < 1000) scoreEl.classList.add('score-mid');
    else if (score < 2001) scoreEl.classList.add('score-high');
    else scoreEl.classList.add('score-max');
  }
  if (x !== undefined && y !== undefined) showFloatingPoints(points, x, y);

  // HEALTH CHANGE - MISS NOW REMOVES TWICE AS MUCH
  if (points === 69) {
    health = Math.max(0, health - 26);   // ←←← DOUBLED FROM 13 TO 26
    sessionStorage.setItem('health', health.toString());
    updateHealthBar();
  } else {
    health = Math.min(100, health + 4);
    sessionStorage.setItem('health', health.toString());
    updateHealthBar();
  }
}

// ... rest of your original code ...

document.addEventListener('DOMContentLoaded', () => {
  // ... all your original DOMContentLoaded code (nav, footer, laser, dots, etc.) ...

  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

  // Beard shoot (your original logic kept, image now handled in HTML)
  let beardProp = document.getElementById('beard-prop');
  if (beardProp && currentPage === 'index') {
    if (sessionStorage.getItem('beardShot') === 'true') {
      document.body.style.backgroundImage = "url('img/NO BEARD COVER.jpg')";
      beardProp.style.opacity = '0';
      beardProp.style.pointerEvents = 'none';
    }
    beardProp.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = beardProp.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
      sound.currentTime = 0;
      await waitForAudio(sound);

      updateScore(6969, x, y);
      await explode(x, y, '#FFD700');

      beardProp.classList.add('beard-hang');
      await waitForAnimation(beardProp, 'hangShake');
      beardProp.classList.add('beard-fall');
      await waitForAnimation(beardProp, 'cartoonFall');

      document.body.style.backgroundImage = "url('img/NO BEARD COVER.jpg')";
      sessionStorage.setItem('beardShot', 'true');
      beardProp.style.opacity = '0';
      beardProp.style.pointerEvents = 'none';
    });
  }

  // NEW: Crazy Arms pop-up (once per session)
  if (currentPage === 'index' && !sessionStorage.getItem('crazyArmsShown')) {
    setTimeout(() => {
      const modal = new bootstrap.Modal(document.getElementById('crazyArmsModal'));
      modal.show();
      sessionStorage.setItem('crazyArmsShown', 'true');
    }, 1500);
  }

  // ... rest of your original code (sub-dot clicks, main-dot clicks, etc.) ...
});
