// GSAP Animations on Load
gsap.registerPlugin();
gsap.from(".glitch-text", {duration: 1, y: -50, opacity: 0, stagger: 0.2, ease: "back.out(1.7)"});

// Particles.js for Fireflies
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

// Parallax Init
const scene = document.querySelector('.parallax-hero');
const parallaxInstance = new Parallax(scene);

// Random Release Roulette
const releases = [
  { title: 'Too Drunk (2024)', desc: 'Debut banger with Brent Mason – born in the studio haze.' },
  { title: 'Worst Enemy (2023)', desc: 'Raw self-sabotage anthem, Bourbon Street blues with Grammy gold.' },
  { title: 'Country Paradise (2021)', desc: 'Hogleg debut album – life's grit in full band fury.' },
  { title: 'Road To Texas (2021)', desc: 'Tribute to radio legend John Walton – highway heartbreaker.' }
];
document.getElementById('spin-btn').addEventListener('click', () => {
  const random = releases[Math.floor(Math.random() * releases.length)];
  document.getElementById('random-release').innerHTML = `<strong>${random.title}</strong><br>${random.desc}<br><a href="https://orcd.co/lancewoolietoodrunk" target="_blank">Spin It Now</a>`;
  gsap.to('#random-release', {duration: 0.5, scale: 1.2, yoyo: true, repeat: 1});
});

// Event Audio Twangs (Upload MP3s to /sounds/)
document.querySelectorAll('.event-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const audio = new Audio(btn.dataset.audio);
    audio.volume = 0.3;
    audio.play();
    gsap.to(btn, {duration: 0.5, scale: 0.95, yoyo: true, repeat: 1});
  });
});

// Form Submission (Unhinged Alert)
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Message beamed to the bayou ether! Expect a twang back soon...');
});

// Glitch on Hover for Cards/Buttons
document.querySelectorAll('.glitch-card, .glitch-btn').forEach(el => {
  el.addEventListener('mouseenter', () => gsap.to(el, {duration: 0.1, x: 2, y: 2, repeat: 5, yoyo: true}));
});
const trail = [];
document.addEventListener('mousemove', (e) => {
  trail.push({x: e.clientX, y: e.clientY});
  if (trail.length > 10) trail.shift();
  trail.forEach((pos, i) => {
    const hat = document.createElement('div');
    hat.style.position = 'fixed';
    hat.style.left = pos.x + 'px';
    hat.style.top = pos.y + 'px';
    hat.style.width = '20px';
    hat.style.height = '20px';
    hat.style.background = 'url(img/cowboy-hat.svg)';
    hat.style.zIndex = 999;
    hat.style.opacity = (10 - i) / 10;
    document.body.appendChild(hat);
    setTimeout(() => hat.remove(), 500);
  });
});
