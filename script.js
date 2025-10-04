// Preload the sound effect early (global, buffers on script load)
const ricochetSound = new Audio('sounds/multiple-ricochets.mp3');
ricochetSound.preload = 'auto';  // Ensures buffering

// Preload click ricochet sounds
const clickSounds = [
  new Audio('sounds/ricochet-1.mp3'),
  new Audio('sounds/ricochet-2.mp3')
];
clickSounds.forEach(sound => sound.preload = 'auto');

// Score management
let score = 0;
let scoreEl = null;

function updateScore(points, x = undefined, y = undefined) {
  score += points;
  sessionStorage.setItem('score', score.toString());
  if (scoreEl) {
    scoreEl.textContent = score;
    // Trigger pulse animation
    const display = scoreEl.closest('.score-display');
    if (display) {
      display.classList.add('updated');
      setTimeout(() => display.classList.remove('updated'), 500);
    }
    // Update total score color class
    scoreEl.className = '';
    if (score < 100) scoreEl.classList.add('score-low');
    else if (score < 1000) scoreEl.classList.add('score-mid');
    else if (score < 2001) scoreEl.classList.add('score-high');
    else scoreEl.classList.add('score-max');
  }
  if (x !== undefined && y !== undefined) {
    showFloatingPoints(points, x, y);
  }
}

function showFloatingPoints(points, x, y) {
  const div = document.createElement('div');
  div.textContent = `+${points}`;
  let color = '#FFD700'; // Default
  if (points < 100) color = 'rgba(255, 165, 0, 0.8)'; // Faded orange
  else if (points < 1000) color = '#FFA500'; // Yellow orange
  else if (points < 2001) color = '#FF4500'; // Red yellow (orangered)
  else color = '#00FFFF'; // Cyan

  div.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 40}px;
    color: ${color};
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: bold;
    pointer-events: none;
    z-index: 10000;
    opacity: 1;
    transform: translate(-50%, 0);
    text-shadow: 0 0 3px ${color};
  `;
  document.body.appendChild(div);

  let opacity = 1;
  const animate = () => {
    opacity -= 0.05;
    div.style.opacity = opacity;
    div.style.transform = `translate(-50%, ${-20 * (1 - opacity)}px)`;
    if (opacity > 0) {
      requestAnimationFrame(animate);
    } else {
      div.remove();
    }
  };
  setTimeout(animate, 100);
}

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

// Reusable Footer Generator (Updated with Scoreboard)
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
            <div class="score-display mb-0 small">
              SCORE: <span id="score-value">0</span>
            </div>
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

  let placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) {
    // Fallback: Append directly to body if placeholder missing (fixes index page issue)
    placeholder = document.createElement('div');
    placeholder.id = 'footer-placeholder';
    document.body.appendChild(placeholder);
    console.log('Footer placeholder missing; created and appended to body.');
  }
  placeholder.innerHTML = footerHTML;

  // Ensure footer is always on top, especially on index
  const footer = placeholder.querySelector('.footer');
  if (footer) {
    footer.style.zIndex = '1002'; // Slightly higher
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
  // Init score display
  scoreEl = document.getElementById('score-value');
}

// Load Nav & Footer on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize score
  score = parseInt(sessionStorage.getItem('score')) || 0;

  generateNav();
  generateFooter();

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

    // Raccoon subscribe button (cowboy hat)
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

  // Update score display after footer generation
  if (scoreEl) {
    scoreEl.textContent = score;
    // Set initial color class
    if (score < 100) scoreEl.classList.add('score-low');
    else if (score < 1000) scoreEl.classList.add('score-mid');
    else if (score < 2001) scoreEl.classList.add('score-high');
    else scoreEl.classList.add('score-max');
  }
});
