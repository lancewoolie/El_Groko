// RideSafe JavaScript: Enhanced with Firebase Auth & Firestore
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
        this.loginBtn = document.getElementById('loginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Firebase
        this.auth = window.firebase.auth;
        this.db = window.firebase.db;
        this.user = null;
        this.GoogleAuthProvider = window.firebase.GoogleAuthProvider;
        this.signInWithPopup = window.firebase.signInWithPopup;
        this.signOut = window.firebase.signOut;
        this.collection = window.firebase.collection;
        this.addDoc = window.firebase.addDoc;

        this.init();
    }

    init() {
        // Load localStorage prefs (default: on)
        this.audioToggle.checked = localStorage.getItem('ridesafe_audio') !== 'off';
        this.vibeToggle.checked = localStorage.getItem('ridesafe_vibe') !== 'off';

        this.bindEvents();
        this.pulseIcon.style.animationPlayState = 'running'; // Trigger load animation
        
        // Check auth state
        this.auth.onAuthStateChanged((user) => {
            this.user = user;
            this.updateUI();
        });
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.loginBtn.addEventListener('click', () => this.login());
        this.logoutBtn.addEventListener('click', () => this.logout());

        this.audioToggle.addEventListener('change', (e) => {
            localStorage.setItem('ridesafe_audio', e.target.checked ? 'on' : 'off');
        });

        this.vibeToggle.addEventListener('change', (e) => {
            localStorage.setItem('ridesafe_vibe', e.target.checked ? 'on' : 'off');
        });
    }
    
    // Auth methods
    async login() {
        try {
            const provider = new this.GoogleAuthProvider();
            const result = await this.signInWithPopup(this.auth, provider);
            this.user = result.user;
            console.log('Logged in:', this.user.uid);
        } catch (error) {
            console.error('Login failed:', error);
            this.status.textContent = 'Login failed: ' + error.message;
        }
    }
    
    async logout() {
        try {
            await this.signOut(this.auth);
            this.user = null;
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
    
    updateUI() {
        if (this.user) {
            this.status.textContent = `Welcome, ${this.user.email} - Ready to Pulse`;
            this.loginBtn.disabled = true;
            this.logoutBtn.disabled = false;
            this.startBtn.disabled = false; // Enable start after login
        } else {
            this.status.textContent = 'Login to start pulsing';
            this.loginBtn.disabled = false;
            this.logoutBtn.disabled = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = true;
            if (this.isActive) this.stop(); // Auto-stop if logged out mid-ride
        }
    }

    start() {
        if (this.isActive || !this.user) return;
        this.isActive = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.status.textContent = 'Pulse Active';
        this.status.classList.add('active');
        this.pulseIcon.style.animation = 'pulse-glow 1s infinite alternate';

        this.interval = setInterval(() => this.pulse(), 30000);
        this.pulse(); // Initial pulse
        
        this.logEvent('ride_start');
    }

    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        clearInterval(this.interval);
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.status.textContent = `Pulse Stopped - Logged in as ${this.user?.email || 'Guest'}`;
        this.status.classList.remove('active');
        this.pulseIcon.style.animation = '';
        
        this.logEvent('ride_stop');
    }
    
    // Log to Firestore
    async logEvent(eventType) {
        if (!this.user) return;
        try {
            await this.addDoc(this.collection(this.db, 'pulses'), {
                userId: this.user.uid,
                userEmail: this.user.email,
                eventType,
                timestamp: new Date(),
                audioEnabled: this.audioToggle.checked,
                vibeEnabled: this.vibeToggle.checked
            });
            console.log('Logged to Firestore:', eventType);
        } catch (error) {
            console.error('Firestore log failed:', error);
        }
    }

    async pulse() {
        // Visual feedback
        this.pulseIcon.style.transform = 'scale(1.2)';
        setTimeout(() => this.pulseIcon.style.transform = 'scale(1)', 200);

        // Audio
        if (this.audioToggle.checked) {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.log('Audio play failed:', e));
        }

        // Haptic
        if (this.vibeToggle.checked && 'vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
        
        // Log pulse
        await this.logEvent('pulse');
    }
}

// Initialize on load
window.addEventListener('load', () => new RideSafe());

// PWA-ish: Add to home screen
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
});
