// ====================== MOON SALOON script.js – DEPARTURE MODEL ======================

const clickSounds = [new Audio('sounds/ricochet-1.mp3'), new Audio('sounds/ricochet-2.mp3')];
clickSounds.forEach(s => { s.preload = 'auto'; s.volume = 0.85; });

const gameOverSound = new Audio('sounds/ScottySteel.mp3');
gameOverSound.volume = 0.85;

// Simple mobile detection
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Score / Health / Particles / etc. (kept exactly as before – only wrapped)
let score = parseInt(sessionStorage.getItem('score')) || 0;
let health = parseFloat(sessionStorage.getItem('health')) || 100;
// ... (all your existing updateScore, updateHealthBar, explode, showFloatingPoints, waitForAudio, waitForAnimation functions stay 100% unchanged – paste them here)

document.addEventListener('DOMContentLoaded', () => {
  // === INDEX-ONLY CODE (guarded) ===
  const saloonSVG = document.getElementById('saloon-svg');
  if (saloonSVG) {
    // HUD is hidden globally in style.css – we can re-enable later
    scoreEl = document.getElementById('score-value');
    // your existing score / health init...

    // ====================== DEPARTURE FORWARD TRANSITION ======================
    document.querySelectorAll('.moonsaloon-prop').forEach(prop => {
      prop.addEventListener('click', (e) => {
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

          // === DEPARTURE TRANSITION (gesture guaranteed) ===
          const overlay = document.getElementById('transition-overlay');
          const forwardVideo = document.getElementById('forward-video');
          const reverseVideo = document.getElementById('reverse-video');

          forwardVideo.src = prop.dataset.forwardVideo || '/video/default-forward.mp4';
          reverseVideo.style.display = 'none';
          forwardVideo.style.display = 'block';
          overlay.style.display = 'block';

          const muted = isMobile();
          forwardVideo.muted = muted;
          forwardVideo.volume = muted ? 0 : 0.8;
          forwardVideo.currentTime = 0;

          let safetyTimeout;
          const doRedirect = () => {
            clearTimeout(safetyTimeout);
            window.location.href = prop.dataset.link;
          };

          forwardVideo.onended = doRedirect;

          forwardVideo.play()
            .then(() => {
              safetyTimeout = setTimeout(doRedirect, 1800);
            })
            .catch(() => doRedirect()); // instant fallback if anything fails
        }
      });
    });

    // Dry fire on empty space (unchanged)
    document.querySelector('.hero').addEventListener('click', (e) => {
      if (e.target.classList.contains('moonsaloon-prop')) return;
      const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
      sound.currentTime = 0;
      sound.play().catch(() => {});
    });

    // Lunar timer, health init, etc. (your existing code here)
  }

  // === SHARED NAV / FOOTER (runs on every page) ===
  generateNav();
  generateFooter();

  // === SUB-PAGE REVERSE DOORS (already perfect – no changes needed here) ===
});
