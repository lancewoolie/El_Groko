// ====================== MOON SALOON script.js – FULL FINAL ======================
const clickSounds = [new Audio('sounds/ricochet-1.mp3'), new Audio('sounds/ricochet-2.mp3')];
clickSounds.forEach(s => { s.preload='auto'; s.volume=0.85; });
const dryFireSound = new Audio('sounds/dry-click.mp3');
dryFireSound.volume = 0.6;

let score = parseInt(sessionStorage.getItem('score')) || 0;
let health = parseInt(sessionStorage.getItem('health')) || 100;
let timer = 30;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  generateNav();
  generateFooter();
  scoreEl = document.getElementById('score-value');
  initHealthBar();
  updateScore(0);

  // ALL SHOOTABLE PROPS
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
      await sound.play();

      updateScore(parseInt(prop.dataset.score), x, y);
      explode(x, y, '#00ffcc');

      prop.classList.add('hit');
      setTimeout(() => prop.classList.remove('hit'), 180);

      if (hits >= parseInt(prop.dataset.maxHits)) {
        prop.classList.add('destroyed');
        setTimeout(() => window.location.href = prop.dataset.link, 800);
      }
    });
  });

  // Dry fire
  document.querySelector('.hero').addEventListener('click', (e) => {
    if (e.target.classList.contains('moonsaloon-prop')) return;
    dryFireSound.currentTime = 0;
    dryFireSound.play();
  });

  // Timer
  const timerEl = document.getElementById('lunar-timer');
  timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 5) timerEl.style.color = '#ff3366';
    if (timer <= 0) {
      clearInterval(timerInterval);
      document.getElementById('restart-btn').style.display = 'block';
    }
  }, 1000);

  // Paste ALL your original sub-dot, main-dot, beard, Crazy Arms, etc. code here (unchanged)
});
