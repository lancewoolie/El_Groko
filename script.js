// Reusable Nav Generator (Edit Here for All Pages)
function generateNav() {
  const navHTML = `
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
            <li class="nav-item"><a class="nav-link" href="music.html">Music</a></li>
            <li class="nav-item"><a class="nav-link" href="events.html">Events</a></li>
            <li class="nav-item"><a class="nav-link" href="origins.html">Origins</a></li>
            <li class="nav-item"><a class="nav-link" href="merch.html" target="_blank">Merch</a></li> <!-- External Bandcamp -->
            <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;
  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) {
    placeholder.innerHTML = navHTML;
    // Re-init Bootstrap toggler for dynamic insert
    var myCollapse = document.getElementById('navbarNav');
    var bsCollapse = new bootstrap.Collapse(myCollapse, {toggle: false});
  }
}

// Load Nav on DOM Ready
document.addEventListener('DOMContentLoaded', generateNav);

// Existing Cowboy Hat & Form Code (Keep Below)
const cowboyHat = document.getElementById('cowboy-hat');
if (cowboyHat) {
  const surprises = [
    () => { cowboyHat.textContent = '🪕'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
    () => { cowboyHat.style.color = '#FFD700'; setTimeout(() => cowboyHat.style.color = 'white', 1000); },
    () => { alert('Twang! "Do it." – Lance'); },
    () => { cowboyHat.style.transform = 'rotate(360deg)'; setTimeout(() => cowboyHat.style.transform = 'rotate(0deg)', 500); },
    () => { cowboyHat.textContent = '🌵'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); }
  ];
  cowboyHat.addEventListener('click', () => surprises[Math.floor(Math.random() * surprises.length)]());
}

const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Message sent—bayou reply incoming.');
  });
}
// Smooth Scrolling for Nav Anchors (Fixes Navigation)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      gsap.to(window, {duration: 1.5, scrollTo: {y: target, offsetY: 80}, ease: "power2.inOut"}); // Smooth GSAP scroll, offset for navbar
    }
  });
});

// GSAP Animations on Load/Hover
gsap.registerPlugin();
gsap.from(".glitch-text", {duration: 1, y: -50, opacity: 0, stagger: 0.2, ease: "back.out(1.7)"});

// Particles.js for Fireflies (Bayou Glow)
particlesJS('particles-js', {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: '#FFD700' },
    shape: { type: 'circle' },
    opacity: { value: 0.5, random: true },
    size: { value: 3, random: true },
    line_linked: { enable: true, distance: 150, color: '#0074D9', opacity: 0.4, width: 1 },
    move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
    modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
  },
  retina_detect: true
});

// Parallax Init for Swamp Hero
const scene = document.querySelector('.parallax-hero');
if (scene) {
  const parallaxInstance = new Parallax(scene);
}

// Random Release Roulette (Unhinged Spin)
const releases = [
  { title: 'Too Drunk (2024)', desc: 'Debut banger with Brent Mason – born in the studio haze.', link: 'https://orcd.co/lancewoolietoodrunk' },
  { title: 'Worst Enemy (2023)', desc: 'Raw self-sabotage anthem, Bourbon Street blues with Grammy gold.', link: 'https://orcd.co/lancewoolieworstenemy' },
  { title: 'Country Paradise (2021)', desc: 'Hogleg debut album – life\'s grit in full band fury.', link: 'https://orcd.co/o4qa0ba' },
  { title: 'Road To Texas (2021)', desc: 'Tribute to radio legend John Walton – highway heartbreaker.', link: 'https://orcd.co/pbadp4n' }
];
const spinBtn = document.getElementById('spin-btn');
if (spinBtn) {
  spinBtn.addEventListener('click', () => {
    const random = releases[Math.floor(Math.random() * releases.length)];
    const randomEl = document.getElementById('random-release');
    if (randomEl) {
      randomEl.innerHTML = `<strong>${random.title}</strong><br>${random.desc}<br><a href="${random.link}" target="_blank">Spin It Now</a>`;
      gsap.to(randomEl, {duration: 0.5, scale: 1.2, yoyo: true, repeat: 1});
    }
  });
}

// Event Audio Twangs (Upload MP3s to /sounds/)
document.querySelectorAll('.event-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const audioPath = btn.dataset.audio;
    if (audioPath) {
      const audio = new Audio(audioPath);
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e)); // Handle autoplay block
      // Cowboy Hat Random Surprises (Bottom-Left Footer)
const cowboyHat = document.getElementById('cowboy-hat');
const surprises = [
  () => { cowboyHat.textContent = '🪕'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); }, // Banjo flash
  () => { cowboyHat.style.color = '#FFD700'; setTimeout(() => cowboyHat.style.color = 'white', 1000); }, // Gold glow
  () => { alert('Twang! Lost love fortune: "The swamp whispers your name."'); }, // Random message
  () => { cowboyHat.style.transform = 'rotate(360deg)'; setTimeout(() => cowboyHat.style.transform = 'rotate(0deg)', 500); }, // Spin
  () => { cowboyHat.textContent = '🌵'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); } // Cactus surprise
];
cowboyHat.addEventListener('click', () => {
  const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
  randomSurprise();
});

// Form Alert (If on Contact)
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Message sent—expect a reply from the bayou.');
  });
}

      // Cowboy Hat Random Surprises (Bottom-Left Footer)
const cowboyHat = document.getElementById('cowboy-hat');
if (cowboyHat) {
  const surprises = [
    () => { cowboyHat.textContent = '🪕'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
    () => { cowboyHat.style.color = '#FFD700'; setTimeout(() => cowboyHat.style.color = 'white', 1000); },
    () => { alert('Twang! "Do it." – Lance'); },
    () => { cowboyHat.style.transform = 'rotate(360deg)'; setTimeout(() => cowboyHat.style.transform = 'rotate(0deg)', 500); },
    () => { cowboyHat.textContent = '🌵'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); }
  ];
  cowboyHat.addEventListener('click', () => surprises[Math.floor(Math.random() * surprises.length)]());
}

// Form Alert (If on Contact)
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Message sent—bayou reply incoming.');
  });
}
