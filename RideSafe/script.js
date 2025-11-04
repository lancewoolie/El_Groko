// RideSafe JavaScript: Core Logic with LocalStorage & Animations
class RideSafe {
    constructor() {
        this.isActive = false;
        this.interval = null;
        this.audio = document.getElementById('beepAudio');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
        this.pulseIcon = document.getElementById('pulseIcon');
        this.audioToggle = document.getElementById('audioToggle');
        this.vibeToggle = document.getElementById('vibeToggle');

        this.init();
    }

    init() {
        // Load localStorage prefs (default: on)
        this.audioToggle.checked = localStorage.getItem('ridesafe_audio') !== 'off';
        this.vibeToggle.checked = localStorage.getItem('ridesafe_vibe') !== 'off';

        this.bindEvents();
        this.pulseIcon.style.animationPlayState = 'running'; // Trigger load animation
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());

        this.audioToggle.addEventListener('change', (e) => {
            localStorage.setItem('ridesafe_audio', e.target.checked ? 'on' : 'off');
        });

        this.vibeToggle.addEventListener('change', (e) => {
            localStorage.setItem('ridesafe_vibe', e.target.checked ? 'on' : 'off');
        });
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.status.textContent = 'Pulse Active';
        this.status.classList.add('active');
        this.pulseIcon.style.animation = 'pulse-glow 1s infinite alternate'; // Reuse CSS anim

        this.interval = setInterval(() => this.pulse(), 30000); // 30s pulse
        this.pulse(); // Initial pulse
    }

    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        clearInterval(this.interval);
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.status.textContent = 'Pulse Stopped';
        this.status.classList.remove('active');
        this.pulseIcon.style.animation = ''; // Stop pulsing
    }

    async pulse() {
        // Visual feedback
        this.pulseIcon.style.transform = 'scale(1.2)';
        setTimeout(() => this.pulseIcon.style.transform = 'scale(1)', 200);

        // Audio (Mars-rover beep, localStorage gated)
        if (this.audioToggle.checked) {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.log('Audio play failed:', e)); // Silent fail on mobile
        }

        // Haptic (mobile/web vibrations)
        if (this.vibeToggle.checked && 'vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]); // Pattern: strong-short-strong
        }
    }
}

// Initialize on load
window.addEventListener('load', () => new RideSafe());

// PWA-ish: Add to home screen prompt (optional, for future)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
});
