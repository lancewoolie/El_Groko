// Armadillo Scurry Animation
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;  // Double sprite size for visibility
    canvas.height = 64;
    canvas.style.position = 'fixed';
    canvas.style.top = '50%';  // Start mid-screen vertically
    canvas.style.left = '-100px';  // Off-screen left
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';  // Can't click canvas itself
    canvas.style.transform = 'rotate(15deg) skewY(-10deg)';  // Pseudo-isometric tilt
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const spriteImg = new Image();
    spriteImg.src = 'https://raw.githubusercontent.com/yourusername/armadillo-assets/main/assets/Armadillo%20Sprite%20Sheet.png';  // Your raw URL here
    let frameIndex = 0;
    const frameWidth = 32;
    const frameHeight = 32;
    const animationSpeed = 0.2;  // Frames per tick
    let x = -100;  // Starting x position
    let y = window.innerHeight / 2 - 32;  // Mid-screen y
    let speed = 2;  // Pixels per frame
    let isAnimating = false;
    let mouseX = 0, mouseY = 0;

    // Mouse tracking for flee
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Cycle through movement frames (assume 6 frames starting at x=0; adjust if your sheet differs)
    function drawArmadillo() {
        if (!spriteImg.complete) return;
        const sourceX = frameIndex * frameWidth;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(spriteImg, sourceX, 0, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
        frameIndex += animationSpeed;
        if (frameIndex >= 6) frameIndex = 0;  // Loop 6 frames
    }

    function updatePosition() {
        // Flee logic: If mouse close, speed up and nudge away
        const dist = Math.sqrt((x - mouseX)**2 + (y - mouseY)**2);
        if (dist < 100) {
            speed = Math.random() * 5 + 3;  // Faster flee
            y += (mouseY > y ? -20 : 20) * Math.random();  // Random vertical dodge
        } else {
            speed = 2 + Math.random() * 2;  // Normal random speed
        }

        x += speed;  // Forward movement
        canvas.style.left = x + 'px';
        canvas.style.top = y + 'px';

        // End when off-screen
        if (x > window.innerWidth + 100) {
            isAnimating = false;
            setTimeout(startScurry, Math.random() * 25000 + 5000);  // 5-30s delay
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
        x = -100;  // Reset left
        y = Math.random() * (window.innerHeight - 128) + 64;  // Random y
        speed = 2;
        isAnimating = true;
        animate();
    }

    // Start after 2s
    setTimeout(startScurry, 2000);

    // Resize handler
    window.addEventListener('resize', () => {
        y = window.innerHeight / 2 - 32;
    });
});
