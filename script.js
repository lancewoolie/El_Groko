// Preload the sound effect early (global, buffers on script load)
const ricochetSound = new Audio('sounds/multiple-ricochets.mp3');
ricochetSound.preload = 'auto';  // Ensures buffering

// Preload click ricochet sounds
const clickSounds = [
  new Audio('sounds/ricochet-1.mp3'),
  new Audio('sounds/ricochet-2.mp3')
];
clickSounds.forEach(sound => sound.preload = 'auto');

// Global mouse position for particle reactivity
let mousePos = { x: 0, y: 0 };

// Score management
let score = 0;
let scoreEl = null;

// Health management for heart bar
let health = parseFloat(sessionStorage.getItem('health')) || 5;
let healthCanvas = null;
let progressLine = null;
let progressLineOuter = null;
let liquidBack = null;
let liquidFront = null;
let particlesLeft = null;
let particlesRight = null;
let bubbleGroup = null;
let bubbleArray = [];
let totalLength = 0;
let animeLoaded = typeof anime !== 'undefined'; // Check if anime.js is loaded

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
  // Optional: Tie health loss to low scores (e.g., if points < 50, lose half heart)
  if (points < 50) {
    loseHalfHeart();
  }
}

function loseHalfHeart() {
  health = Math.max(0, health - 0.5);
  sessionStorage.setItem('health', health.toString());
  if (healthCanvas) {
    const percent = health / 5;
    updateHealthBar(percent);
    // Optional: Play a damage sound here
    console.log(`Health: ${health}/5`); // Or trigger UI feedback
  }
}

function updateHealthBar(percent) {
  if (!progressLine) return;
  progressLine.style.strokeDashoffset = totalLength - (totalLength * percent);
  if (animeLoaded) {
    anime({
      targets: liquidFront,
      d: [liquidFront.getAttribute("d"), getLiquidPath(percent)],
      duration: 800,
      elasticity: 600
    });
  }
  // Dynamic color change
  const frontGrad = document.querySelector('#frontGrad');
  if (frontGrad) {
    if (health === 5) {
      // Full blue
      frontGrad.children[0].style.stopColor = '#1063c2';
      frontGrad.children[1].style.stopColor = '#1063c2';
    } else if (health > 0.5) {
      // Red for 4.5–1
      frontGrad.children[0].style.stopColor = '#ff0000';
      frontGrad.children[1].style.stopColor = '#cc0000';
    } else if (health === 0.5) {
      // Yellow for last half
      frontGrad.children[0].style.stopColor = '#FFD700';
      frontGrad.children[1].style.stopColor = '#FFA500';
    } else {
      // Empty gray
      frontGrad.children[0].style.stopColor = '#808080';
      frontGrad.children[1].style.stopColor = '#606060';
    }
  }
}

function getLiquidPath(percent) {
  var liquidHeight = 190 * percent;
  var liquidPath = "M1200," + (400 - liquidHeight) + "l0-" + liquidHeight + "c-30.3,0-51.7,12.8-68,12.8c-28.7,0-41.6-12.7-83.8-12.7c-30.9,0-52.1,12.7-76.1,12.7c-27.1,0-39.3-4.1-67.1-4.1c-21.3,0-42.1,12.9-79.8,12.8c-35.7-0.1-47.9-12.8-83.6-12.8c-9.6,0-46.3,4.7-64.6,4.2c-20.8-0.6-37.9-12.8-76.9-12.8c-30.3,0-51.7,12.8-68,12.8c-28.7,0-41.6-12.7-83.8-12.7c-30.9,0-52.1,12.7-76.1,12.7c-27.1,0-39.3-4.1-67.1-4.1c-21.3,0-42.1,12.9-79.8,12.8c-35.7-0.1-47.9-12.8-83.6-12.8c-9.6,0-46.3,4.7-64.6,4.2C56.1,222.2,39,210,0,210l0," + liquidHeight + "H1200z";
  return liquidPath;
}

function initHealthBar() {
  healthCanvas = document.getElementById("health-canvas");
  if (!healthCanvas) return;
  progressLine = document.getElementById("progress-line-inner");
  progressLineOuter = document.getElementById("progress-line-outer");
  liquidBack = document.getElementById("liquid-back");
  liquidFront = document.getElementById("liquid-front");
  particlesLeft = document.getElementById("particles-left");
  particlesRight = document.getElementById("particles-right");
  bubbleGroup = document.getElementById("liquid-bubbles");
  if (bubbleGroup) {
    for (let i = 0; i < bubbleGroup.children.length; i++) {
      bubbleArray.push(bubbleGroup.children[i]);
    }
  }

  totalLength = progressLine.getTotalLength();
  progressLine.style.strokeDasharray = totalLength;
  progressLine.style.strokeDashoffset = totalLength;
  progressLineOuter.style.strokeDasharray = totalLength;
  progressLineOuter.style.strokeDashoffset = totalLength;

  if (animeLoaded) {
    anime({
      targets: progressLineOuter,
      strokeDashoffset: [totalLength, 0],
      duration: 1000,
      easing: "easeInOutSine",
      delay: 500
    });
    anime({
      targets: liquidBack,
      d: [liquidBack.getAttribute("d"), liquidBack.getAttribute("d")], // No change for init
      duration: 1500,
      elasticity: 600,
      delay: 1000
    });
    animateBubbles();
    setInterval(addParticles, 300);
  }

  // Initial update
  const initialPercent = health / 5;
  updateHealthBar(initialPercent);
}

function animateBubbles() {
  anime({
    targets: bubbleArray,
    translateY: -25,
    duration: Math.random() * 2000 + 2000,
    delay: anime.stagger(200),
    loop: true,
    easing: "easeOutElastic"
  });
}

function addParticles() {
  const numParticles = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < numParticles; i++) {
    setTimeout(() => {
      const cloneLeft = particlesLeft.cloneNode(true);
      const cloneRight = particlesRight.cloneNode(true);
      cloneLeft.style.opacity = "0";
      cloneRight.style.opacity = "0";
      healthCanvas.appendChild(cloneLeft);
      healthCanvas.appendChild(cloneRight);
      if (animeLoaded) {
        anime({
          targets: [cloneLeft, cloneRight],
          translateY: [0, -20],
          translateX: [0, (Math.random() - 0.5) * 40],
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
          duration: 1000,
          delay: anime.stagger(100),
          complete: () => {
            cloneLeft.remove();
            cloneRight.remove();
          }
        });
      } else {
        // Fallback: Simple fade without anime
        cloneLeft.remove();
        cloneRight.remove();
      }
    }, i * 100);
  }
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

// Reusable Nav Generator (Updated with Heart Progress Bar in Header)
function generateNav() {
  let navHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img src="img/BEARDsmall.png" alt="Lance Woolie" style="height: 20px;"> Lance Woolie
        </a>
        <div class="score-header mx-auto d-flex justify-content-center align-items-center gap-3">
          <div class="health-display">
            <span class="health-label">Health</span>
            <div id="health-container" class="health-bar">
              <svg 
                id="health-canvas"
                version="1.1" 
                viewBox="0 0 800 300"
                xmlns="http://www.w3.org/2000/svg" 
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <defs>
                  <linearGradient id="frontGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="190">
                    <stop offset="0" style="stop-color:#1063c2"/>
                    <stop offset="0.5" style="stop-color:#1063c2"/>
                  </linearGradient> 

                  <linearGradient id="backGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="190">
                    <stop offset="0" style="stop-color:#1063c2"/>
                    <stop offset="0.3" style="stop-color:#2D0000"/>
                  </linearGradient>

                  <clipPath id="heart-clip">
                    <path d="M398.5,208.3c0.9,0.7,2.2,0.7,3.1,0c6.9-5.5,35.7-28.7,53.2-49.4c14.6-14.8,25.3-50.3,0-63.6c-19.9-10.1-45-0.5-52.5,13.9c-0.9,1.8-3.5,1.8-4.4,0c-7.5-14.4-32.6-24-52.5-13.9c-25.4,13.5-15.1,48.2,0,63.6C362.8,179.6,391.6,202.8,398.5,208.3z"/>
                  </clipPath>

                  <mask id="heart-mask">
                    <path d="M462.8,151.5c-0.6,0-1.8-0.5-1.8-0.5l3.6-6.5l320.2,0c1.9,0,3.5,1.6,3.5,3.5s-1.6,3.5-3.5,3.5L462.8,151.5z"/>
                    <path d="M15.2,151.5c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5l320.3,0l3.6,6.5c0,0-1.1,0.5-1.8,0.5L15.2,151.5z"/>
                    <path d="M398.5,208.3c0.9,0.7,2.2,0.7,3.1,0c6.9-5.5,35.7-28.7,53.2-49.4c14.6-14.8,25.3-50.3,0-63.6c-19.9-10.1-45-0.5-52.5,13.9c-0.9,1.8-3.5,1.8-4.4,0c-7.5-14.4-32.6-24-52.5-13.9c-25.4,13.5-15.1,48.2,0,63.6C362.8,179.6,391.6,202.8,398.5,208.3z"/>
                  </mask>

                  <filter id="goo" color-interpolation-filters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4 4" result="blur"/>
                    <feColorMatrix in="blur"
                      mode="matrix"
                      values="
                      1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 19 -7"
                      result="cm"/>
                    <feComposite in="SourceGraphic" in2="cm" />
                  </filter>
                </defs>
                <g id="particles-left" fill="url(#frontGrad)">
                  <circle cx="337.4" cy="148" r="0.6"/>
                  <circle cx="337.4" cy="148" r="0.9"/>
                  <circle cx="337.4" cy="148" r="0.4"/>
                  <circle cx="337.4" cy="148" r="0.3"/>
                  <circle cx="337.4" cy="148" r="1"/>
                </g>
                <g id="particles-right" fill="url(#frontGrad)">
                  <circle cx="462.7" cy="148" r="0.6"/>
                  <circle cx="462.7" cy="148" r="0.9"/>
                  <circle cx="462.7" cy="148" r="0.4"/>
                  <circle cx="462.7" cy="148" r="0.3"/>
                  <circle cx="462.7" cy="148" r="1"/>
                </g>

                <g id="liquid" clip-path="url(#heart-clip)">
                  <path id="liquid-back" fill="url(#backGrad)" d="M1125,215.8c-27.9,0-47.5-2.4-75-1c-28.6,1.4-40.1,7.7-75,7.7c-28.8,0-43.9-3-75-3s-57.2,3.1-75,3.1c-24.9,0-36.1-5-75-7.7c-29.7-2-52.7,0.4-75,0.4s-48.2-5.3-75-5.3c-27.6,0-62.3,5.8-75,5.8c-27.9,0-47.6-2.7-75-1c-29,1.8-40.1,7.7-75,7.7c-28.8,0-43.9-3-75-3c-31.1,0-57.2,3.1-75,3.1c-24.9,0-45.3-5.6-75-7.7c-24.6-1.7-52.7,0.4-75,0.4c-22.3,0-48.2-5.3-75-5.3v190h1200V210C1172.4,210,1137.7,215.8,1125,215.8z"/>
                  <g id="liquid-front-group" fill="url(#frontGrad)">
                    <g id="liquid-bubbles">
                      <circle id="bubble-0" cx="340" cy="217" r="3"/>
                      <circle id="bubble-1" cx="350" cy="217" r="3.3"/>
                      <circle id="bubble-2" cx="360" cy="217" r="6"/>
                      <circle id="bubble-3" cx="370" cy="217" r="3"/>
                      <circle id="bubble-4" cx="380" cy="217" r="2.5"/>
                      <circle id="bubble-5" cx="390" cy="217" r="3.7"/>
                      <circle id="bubble-6" cx="400" cy="217" r="5.9"/>
                      <circle id="bubble-7" cx="410" cy="217" r="5.5"/>
                      <circle id="bubble-8" cx="420" cy="217" r="3.5"/>
                      <circle id="bubble-9" cx="430" cy="217" r="5.4"/>
                      <circle id="bubble-10" cx="440" cy="217" r="4.7"/>
                      <circle id="bubble-11" cx="450" cy="217" r="4.1"/>
                      <circle id="bubble-12" cx="460" cy="217" r="5.3"/>
                      <circle id="bubble-13" cx="470" cy="217" r="5.5"/>
                    </g>
                    <path id="liquid-front" fill="url(#frontGrad)" d="M1200,400l0-190c-30.3,0-51.7,12.8-68,12.8c-28.7,0-41.6-12.7-83.8-12.7c-30.9,0-52.1,12.7-76.1,12.7c-27.1,0-39.3-4.1-67.1-4.1c-21.3,0-42.1,12.9-79.8,12.8c-35.7-0.1-47.9-12.8-83.6-12.8c-9.6,0-46.3,4.7-64.6,4.2c-20.8-0.6-37.9-12.8-76.9-12.8c-30.3,0-51.7,12.8-68,12.8c-28.7,0-41.6-12.7-83.8-12.7c-30.9,0-52.1,12.7-76.1,12.7c-27.1,0-39.3-4.1-67.1-4.1c-21.3,0-42.1,12.9-79.8,12.8c-35.7-0.1-47.9-12.8-83.6-12.8c-9.6,0-46.3,4.7-64.6,4.2C56.1,222.2,39,210,0,210l0,190H1200z"/>
                  </g>
                </g>

                <path id="track-right" fill="#FFFFFF" d="M462.8,151.5c-0.6,0-1.8-0.5-1.8-0.5l3.6-6.5l320.2,0c1.9,0,3.5,1.6,3.5,3.5s-1.6,3.5-3.5,3.5L462.8,151.5z"/>
                <path id="track-left" fill="#FFFFFF" d="M15.2,151.5c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5l320.3,0l3.6,6.5c0,0-1.1,0.5-1.8,0.5L15.2,151.5z"/>
                <path id="ekg-outer" fill="none" stroke="#F56476" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M15.2,148h357.2c0.2,0,0.5-0.1,0.7-0.3l3.1-3.1c0.4-0.4,1-0.4,1.3,0l5.7,5.7c0.3,0.3,0.9,0.4,1.3,0.1l4.9-4c0.6-0.5,1.4-0.1,1.5,0.6l2.5,22.7c0.1,1.1,1.8,1.1,1.9,0L399,125c0.1-1.1,1.7-1.2,1.9-0.1l4.5,26.5c0.1,0.9,1.3,1.1,1.7,0.3l5.3-9.4c0.4-0.6,1.2-0.6,1.6,0l3.3,5.3c0.2,0.3,0.5,0.4,0.8,0.4h366.5"/>
                <line id="progress-line-outer" fill="none" stroke="url(#frontGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="15.2" y1="148" x2="784.8" y2="148"/>
                <line id="progress-line-inner" clip-path="url(#heart-clip)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="15.2" y1="148" x2="784.8" y2="148"/>
                <path id="ekg-inner" clip-path="url(#heart-clip)" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M15.2,148h357.2c0.2,0,0.5-0.1,0.7-0.3l3.1-3.1c0.4-0.4,1-0.4,1.3,0l5.7,5.7c0.3,0.3,0.9,0.4,1.3,0.1l4.9-4c0.6-0.5,1.4-0.1,1.5,0.6l2.5,22.7c0.1,1.1,1.8,1.1,1.9,0L399,125c0.1-1.1,1.7-1.2,1.9-0.1l4.5,26.5c0.1,0.9,1.3,1.1,1.7,0.3l5.3-9.4c0.4-0.6,1.2-0.6,1.6,0l3.3,5.3c0.2,0.3,0.5,0.4,0.8,0.4h366.5"/>
              </svg>
            </div>
          </div>
          <div class="score-display">
            <span class="score-label">Your Score</span> <span id="score-value">000000</span>
          </div>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="music.html" role="button" data-bs-toggle="dropdown" aria-expanded="false">Music</a>
              <ul class="dropdown-menu horizontal-dropdown">
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/a4glqme" target="_blank">
                  <img src="img/Ubermenu.jpg" alt="Uber" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
                  Uber
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/lancewoolietoodrunk" target="_blank">
                  <img src="img/TooDrunkmenu.jpg" alt="Too Drunk" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
                  Too Drunk
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/lancewoolieworstenemy" target="_blank">
                  <img src="img/WorstEnemymenu.jpg" alt="Worst Enemy" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
                  Worst Enemy
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="music.html">
                  <img src="img/Fullcatalogmenu.jpg" alt="Full Catalog" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
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
    console.warn('Nav placeholder not found');
  }
}

// Reusable Footer Generator (Removed Scoreboard, Added Subscribe Raccoon)
function generateFooter() {
  const footerHTML = `
    <footer class="footer bg-dark text-light py-1" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 1001; border-top: 1px solid #0074D9;">
      <div class="container">
        <!-- Bottom Row: Contact, Copyright, Icons -->
        <div class="row align-items-center">
          <div class="col-md-4">
            <a href="contact.html" class="text-light">Contact</a>
          </div>
          <div class="col-md-4 text-center">
            <div class="cowboy-hat-icon mb-1" id="cowboy-hat">🤠</div>
            <p class="mb-0 small">&copy; 2025 Lance Woolie. All rights reserved.</p>
          </div>
          <div class="col-md-4 text-end">
            <a href="https://x.com/LanceWoolie" target="_blank" class="me-3" title="X (Twitter)" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/x/ffffff/24.svg" alt="X" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.facebook.com/lancewooliemusic/" target="_blank" class="me-3" title="Facebook" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/facebook/ffffff/24.svg" alt="Facebook" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.tiktok.com/@lancewoolie" target="_blank" class="me-3" title="TikTok" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/tiktok/ffffff/24.svg" alt="TikTok" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.youtube.com/channel/UC9NUm7_BejCwctJ9u6dps7g" target="_blank" class="me-3" title="YouTube" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/youtube/ffffff/24.svg" alt="YouTube" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.instagram.com/lancewoolie/" target="_blank" title="Instagram" style="display: inline-block; width: 24px; height: 24px;">
              <img src="https://cdn.simpleicons.org/instagram/ffffff/24.svg" alt="Instagram" style="width: 24px; height: 24px;">
            </a>
          </div>
        </div>
      </div>
      <!-- Subscribe Raccoon Behind Footer -->
      <img id="subscribe-raccoon" class="floating-subscribe" src="img/racoon.png" alt="Subscribe Raccoon">
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

  // Init health bar after nav
  setTimeout(initHealthBar, 100); // Delay for SVG render

  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

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

  // Site-wide click sound and scoring on all clicks
  document.addEventListener('click', (e) => {
    const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Click audio play failed:', err));

    let points = 69; // Default for blank non-menu clicks

    const target = e.target;

    // Sub menu clicks (dropdown items)
    if (target.closest('.dropdown-item')) {
      points = 500;
    }

    // Merch link in header nav
    if (target.closest('a[href="merch.html"]')) {
      points = 2500;
    }

    // Subscribe raccoon click (420 points)
    if (target.closest('#subscribe-raccoon')) {
      points = 420;
    }

    // Raccoon subscribe button (cowboy hat) - kept for surprises
    if (target.closest('#cowboy-hat')) {
      points = 420;
    }

    // Email submit button click (gives 100 points)
    const form = document.getElementById('contact-form');
    if (form && target.type === 'submit' && form.contains(target)) {
      points = 100;
    }

    updateScore(points, e.clientX, e.clientY);
  });

  // Custom red laser dot reticle cursor (50% smaller: 10px)
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 10px;
    height: 10px;
    background: radial-gradient(circle, rgba(255, 0, 0, 0.75) 0%, transparent 70%);
    border: 1px solid rgba(255, 0, 0, 0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease;
  `;
  cursor.innerHTML = `
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1px;
      height: 10px;
      background: rgba(255, 0, 0, 0.75);
      transform: translate(-50%, -50%) rotate(0deg);
    "></div>
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 1px;
      background: rgba(255, 0, 0, 0.75);
      transform: translate(-50%, -50%) rotate(90deg);
    "></div>
  `;
  document.body.appendChild(cursor);
  document.body.style.cursor = 'none';

  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
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

  // Contact Form Handler (Firebase - If on contact page, fixed references)
  const form = document.getElementById('contact-form');
  if (form && window.db) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Whoa, partner—fill it right.');
        return;
      }
      try {
        await window.addDoc(window.collection(window.db, 'contacts'), {
          name, email, message, type: 'general', timestamp: window.serverTimestamp()
        });
        alert('Message sent—bayou reply incoming.');
        form.reset();
        // Add extra points after successful submit (total 10420 with the 100 from click)
        updateScore(10320);
      } catch (error) {
        alert('Send failed—try again.');
        console.error(error);
      }
    });
  }

  // Index Page Specific: Ricochet Load Animation (post content load, post site shaking, on load of bullet hole dots)
  if (currentPage === 'index') {
    window.addEventListener('load', () => {
      const body = document.body;
      const dots = document.querySelectorAll('.main-dot');

      // Shake the body
      body.classList.add('shake');

      setTimeout(() => {
        // Trigger playback post-shake, synced with bullet hole dots animation
        ricochetSound.play().catch(e => console.log('Audio play failed:', e));
        
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

    // Click sound effect on bullet hole dots
    document.querySelectorAll('.main-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent immediate navigation, allow sound to play
        const sound = clickSounds[Math.floor(Math.random() * 2)];
        sound.play().catch(e => console.log('Click audio play failed:', e));
        // Re-enable navigation after short delay if needed, but since it's a link, it will navigate after sound starts
      });
    });

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
});
