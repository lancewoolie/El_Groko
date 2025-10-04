
// Preload the sound effect early (global, buffers on script load)
const ricochetSound = new Audio('sounds/multiple-ricochets.mp3');
ricochetSound.preload = 'auto';  // Ensures buffering

// Preload click ricochet sounds
const clickSounds = [
  new Audio('sounds/ricochet-1.mp3'),
  new Audio('sounds/ricochet-2.mp3')
];
clickSounds.forEach(sound => sound.preload = 'auto');

// Reusable Nav Generator (Unchanged)
function generateNav() {
  let navHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img src="img/BEARDsmall.png" alt="Lance Woolie" style="height: 20px;"> Lance Woolie
        </a>
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

// Reusable Footer Generator (Updated to remove Follow & Connect text links, tighter layout)
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
    </footer>
  `;

  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.innerHTML = footerHTML;
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
  } else {
    console.warn('Footer placeholder not found—add <div id="footer-placeholder"></div> before </body>');
  }
}

// Load Nav & Footer on DOM Ready
document.addEventListener('DOMContentLoaded', (// Armadillo Scurry Animation (Integrated for lancewoolie.com)
// Place this inside the existing DOMContentLoaded event listener, after cursor setup

// Preload armadillo sprite (local path on site)
const armadilloImg = new Image();
armadilloImg.src = 'img/sprites/Armadillo Sprite Sheet.png';  // Local URL; browser handles space

const canvas = document.createElement('canvas');
canvas.width = 64;  // Double sprite size for visibility
canvas.height = 64;
canvas.style.position = 'fixed';
canvas.style.top = '50%';  // Start mid-screen vertically (will randomize)
canvas.style.left = '-100px';  // Off-screen left
canvas.style.zIndex = '9998';  // Below cursor (9999) but above content
canvas.style.pointerEvents = 'none';  // Can't click canvas itself
canvas.style.transform = 'rotate(15deg) skewY(-10deg)';  // Pseudo-isometric tilt
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let frameIndex = 0;
const frameWidth = 32;
const frameHeight = 32;
const sourceY = 32;  // Movement row (second row, 0-indexed) for scurrying with leg/tail animation
const animationSpeed = 0.2;  // Frames per tick
let x = -100;  // Starting x position
let y = window.innerHeight / 2 - 32;  // Mid-screen y (will randomize)
let speed = 2;  // Pixels per frame
let isAnimating = false;
let mouseX = 0, mouseY = 0;

// Reuse existing mouse tracking (from cursor mousemove), but ensure listener for armadillo
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Existing cursor update here if integrating fully
});

// Cycle through movement frames (6 frames in movement row for walking/scurrying)
function drawArmadillo() {
    if (!armadilloImg.complete) return;
    const sourceX = frameIndex * frameWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(armadilloImg, sourceX, sourceY, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
    frameIndex += animationSpeed;
    if (frameIndex >= 6) frameIndex = 0;  // Loop 6 frames for full cycle (legs, tail, scales via frames)
}

function updatePosition() {
    // Flee logic: If mouse close, speed up, nudge away, and play a ricochet sound for fun distraction
    const dist = Math.sqrt((x - mouseX)**2 + (y - mouseY)**2);
    if (dist < 100) {
        speed = Math.random() * 5 + 3;  // Faster flee
        y += (mouseY > y ? -20 : 20) * Math.random();  // Random vertical dodge
        // Play random click sound on flee (reuse existing sounds)
        const fleeSound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
        fleeSound.currentTime = 0;
        fleeSound.play().catch(err => console.log('Flee audio play failed:', err));
    } else {
        speed = 2 + Math.random() * 2;  // Normal random speed variation
    }

    x += speed;  // Forward movement (head/tail direction—assumes sprite faces right)
    canvas.style.left = x + 'px';
    canvas.style.top = y + 'px';

    // End animation when off-screen right
    if (x > window.innerWidth + 100) {
        isAnimating = false;
        // Random delay to next scurry (5-30 seconds, avoids fixed nav/footer)
        setTimeout(startScurry, Math.random() * 25000 + 5000);
    }
}

function animate() {
    if (!isAnimating) return;
    drawArmadillo();
    updatePosition();
    requestAnimationFrame(animate);
}

function startScurry() {
    if (isAnimating) return;
    x = -100;  // Reset off-screen left
    // Random vertical start, avoiding fixed nav (top ~60px) and footer (bottom ~40px)
    const availableHeight = window.innerHeight - 100;  // Buffer for fixed elements
    y = Math.random() * availableHeight + 50;  // Start 50px down, up to available
    speed = 2;
    isAnimating = true;
    animate();
}

// Initial random start after 3 seconds (after site load animations)
setTimeout(startScurry, 3000);

// Resize handler for responsive (avoids fixed elements)
window.addEventListener('resize', () => {
    const availableHeight = window.innerHeight - 100;
    if (isAnimating) {
        y = Math.random() * availableHeight + 50;
    } else {
        y = window.innerHeight / 2 - 32;
    }
    canvas.style.top = y + 'px';
});) => {
  generateNav();
  generateFooter();

  // Site-wide click sound on all clicks
  document.addEventListener('click', (e) => {
    const sound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Click audio play failed:', err));
  });

  // Custom red laser dot reticle cursor (75% opacity)
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, rgba(255, 0, 0, 0.75) 0%, transparent 70%);
    border: 2px solid rgba(255, 0, 0, 0.5);
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
      width: 2px;
      height: 20px;
      background: rgba(255, 0, 0, 0.75);
      transform: translate(-50%, -50%) rotate(0deg);
    "></div>
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 2px;
      background: rgba(255, 0, 0, 0.75);
      transform: translate(-50%, -50%) rotate(90deg);
    "></div>
  `;
  document.body.appendChild(cursor);
  document.body.style.cursor = 'none';

  document.addEventListener('mousemove', (e) => {
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
      } catch (error) {
        alert('Send failed—try again.');
        console.error(error);
      }
    });
  }

  // Index Page Specific: Ricochet Load Animation (post content load, post site shaking, on load of bullet hole dots)
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  if (currentPage === 'index') {
    window.addEventListener('load', () => {
      const body = document.body;
      const dots = document.querySelectorAll('.main-dot');

      // Shake the body
      body.classList.add('shake');

      setTimeout(() => {
        // Trigger playback post-shake, synced with bullet hole dots animation
        ricochetSound.play().catch(e => console.log('Audio play failed:', e));
        // Fire dots one by one (ricochet animation for bullet holes)
        dots.forEach((dot, index) => {
          setTimeout(() => {
            dot.classList.add('ricochet');
            setTimeout(() => {
              dot.classList.add('visible');
            }, 250);
          }, index * 150);
        });
      }, 1000);
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
