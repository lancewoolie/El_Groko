// Armadillo Scurry Animation (Integrated for lancewoolie.com)
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
});
