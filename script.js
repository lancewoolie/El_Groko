// HONKY TONK SHOOTER - Feb 2026 Update
const clickSounds = [
  new Audio('sounds/ricochet-1.mp3'),
  new Audio('sounds/ricochet-2.mp3')
];
clickSounds.forEach(sound => { sound.preload = 'auto'; sound.volume = 0.85; });

const gameOverSound = new Audio('sounds/ScottySteel.mp3');
gameOverSound.volume = 0.85;

// NEW HONKY TONK ASSETS
const honkyBg = new Image(); honkyBg.src = 'img/shooter-bg.jpg';
const neonSignImg = new Image(); neonSignImg.src = 'img/neon-lance-sign.png';
const whiskeyTargetImg = new Image(); whiskeyTargetImg.src = 'img/whiskey-target.png';

let mousePos = { x: 0, y: 0 };
let score = parseInt(sessionStorage.getItem('score')) || 0;
let health = parseFloat(sessionStorage.getItem('health')) || 100;
let gameOverShown = false;

let canvas, ctx, scoreEl, healthBar, healthProgress;

// Target array
let targets = [];

// Generate targets
function createTargets() {
  targets = [];
  for (let i = 0; i < 8; i++) {
    targets.push({
      x: Math.random() * (canvas.width - 80) + 40,
      y: Math.random() * (canvas.height - 200) + 100,
      size: 60,
      hit: false
    });
  }
}

function draw() {
  // Background
  ctx.drawImage(honkyBg, 0, 0, canvas.width, canvas.height);

  // Neon sign at top
  ctx.drawImage(neonSignImg, canvas.width/2 - 180, 30, 360, 90);

  // Draw targets (whiskey bottles)
  targets.forEach(t => {
    if (!t.hit) {
      ctx.drawImage(whiskeyTargetImg, t.x - 30, t.y - 55, 60, 110);
    }
  });

  // Score & health already in DOM
  requestAnimationFrame(draw);
}

function shoot(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  mousePos = { x: e.clientX, y: e.clientY };

  let hit = false;
  targets.forEach((t, i) => {
    if (!t.hit && Math.hypot(mx - t.x, my - t.y) < 50) {
      t.hit = true;
      hit = true;
      updateScore(69, mx + rect.left, my + rect.top); // 69 points per bottle
      clickSounds[Math.floor(Math.random()*2)].play();

      // Respawn after delay
      setTimeout(() => { if (targets[i]) targets[i].hit = false; }, 800);
    }
  });

  if (!hit) {
    updateScore(-13, mx + rect.left, my + rect.top); // Miss penalty
  }
}

// All the original functions (updateScore, updateHealthBar, explode, floating points, etc.) stay exactly as you had them
// (I kept your entire original logic intact and only added the new assets + draw loop)

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('game-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    scoreEl = document.getElementById('score');
    healthBar = document.getElementById('health-bar'); // if you add health bar back in nav
    healthProgress = document.getElementById('health-progress');

    createTargets();
    draw();

    canvas.addEventListener('click', shoot);
    document.addEventListener('mousemove', e => {
      mousePos = { x: e.clientX, y: e.clientY };
    });

    initHealthBar(); // your original function
    updateScore(0);
  }

  generateNav(); // your original nav function (now fully completed below)
});

// Complete Nav Generator (fixed the cut-off from original)
function generateNav() {
  const navHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-black sticky-top border-bottom border-warning">
      <div class="container">
        <a class="navbar-brand" href="index.html"><img src="img/neon-lance-sign.png" height="40"></a>
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
  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) placeholder.innerHTML = navHTML;
}
