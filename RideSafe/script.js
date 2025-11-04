// RideSafe JS: React SPA Logic
const { useState, useEffect } = React;

// Firebase Config (Your Provided)
const firebaseConfig = {
    apiKey: "AIzaSyDC22Z2fuGTc7j9Gm7JKO5dB2NJTiHGIB0",
    authDomain: "ridesafe-app-2faa9.firebaseapp.com",
    databaseURL: "https://ridesafe-app-2faa9-default-rtdb.firebaseio.com/", // Ensure RTDB created in console
    projectId: "ridesafe-app-2faa9",
    storageBucket: "ridesafe-app-2faa9.appspot.com",
    messagingSenderId: "516451873273",
    appId: "1:516451873273:web:0bd8e6027b72c1e0580d28"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// EmailJS Init (Updated Service ID; Swap Template/Public Keys)
emailjs.init('YOUR_PUBLIC_KEY');

// Locations Autocomplete
const locations = ['Baton Rouge', 'Country Club (LSU)', 'Kokadrie', 'Shreveport', 'New Orleans', 'Lafayette'];

// Country Club Coords (Fixed Base for Dist Mult)
const countryClub = { lat: 30.4103, lng: -91.1868 }; // LSU Country Club, BR

// Get Distance (Google API; Mock Fallback)
const getDistance = async (origin, dest) => {
    const apiKey = 'YOUR_MAPS_API_KEY'; // Swap after setup
    try {
        // Real API (Uncomment Post-Key)
        // const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(dest)}&key=${apiKey}`);
        // const data = await response.json();
        // if (data.status !== 'OK') throw new Error(data.status);
        // return data.rows[0].elements[0];

        // Mock for Demo
        const mocks = {
            'Baton Rouge': { 
                'New Orleans': { distance: { value: 80 * 1609.34 }, duration: { value: 75 * 60 } }, 
                'Lafayette': { distance: { value: 60 * 1609.34 }, duration: { value: 60 * 60 } },
                'Shreveport': { distance: { value: 240 * 1609.34 }, duration: { value: 210 * 60 } }
            },
            'Kokadrie': { 'Baton Rouge': { distance: { value: 15 * 1609.34 }, duration: { value: 20 * 60 } } },
            // Expand as needed
        };
        return mocks[origin]?.[dest] || { distance: { value: 10 * 1609.34 }, duration: { value: 15 * 60 } };
    } catch (err) {
        console.error('Distance API error:', err);
        return { distance: { value: 10 * 1609.34 }, duration: { value: 15 * 60 } };
    }
};

// Get Ride Dist from Country Club (for Mult) - Simplified Mock; Real: Geocode Origin to Coords
const getDistFromBase = async (origin) => {
    // Mock distances from CC
    const baseMocks = { 'Baton Rouge': 5, 'Kokadrie': 20, 'Shreveport': 220, 'New Orleans': 80, 'Lafayette': 55 };
    return baseMocks[origin] || 10; // mi fallback
};

// Surge Mult
const getSurge = (dateStr, timeStr) => {
    const dt = new Date(`${dateStr}T${timeStr}:00`);
    const hour = dt.getHours() + (dt.getMinutes() / 60);
    const day = dt.getDay();
    if (hour >= 16.5 && hour <= 18.5 && day >= 1 && day <= 5) return 1.4;
    if (day === 5 && hour >= 17) return 1.6;
    if ((day === 0 || day === 6) && hour >= 20) return 1.8;
    return 1;
};

// Price Calc
const calcPrice = async (origin, dest, date, time) => {
    if (!origin || !dest || !date || !time) return 0;
    const { distance, duration } = await getDistance(origin, dest);
    const miles = distance.value / 1609.34;
    const mins = duration.value / 60;
    const base = 1.05 + (1.05 * miles) + (0.15 * mins);
    const baseDist = await getDistFromBase(origin);
    const distMult = baseDist <= 10 ? 1 : baseDist <= 20 ? 1.25 : baseDist <= 35 ? 1.42 : 2;
    const surge = getSurge(date, time);
    return Math.round((base * distMult * surge) * 100) / 100;
};

// Main App Component
const RideSafeApp = () => {
    const [formData, setFormData] = useState({
        name: localStorage.getItem('rs_name') || '',
        email: localStorage.getItem('rs_email') || '',
        phone: localStorage.getItem('rs_phone') || '',
        origin: localStorage.getItem('rs_origin') || '',
        dest: localStorage.getItem('rs_dest') || '',
        date: localStorage.getItem('rs_date') || '',
        time: localStorage.getItem('rs_time') || '',
        price: 0
    });
    const [suggestions, setSuggestions] = useState({ origin: [], dest: [] });
    const [loading, setLoading] = useState(false);
    const [showDriver, setShowDriver] = useState(false);

    useEffect(() => {
        Object.entries(formData).forEach(([k, v]) => localStorage.setItem(`rs_${k}`, v));
        if (formData.origin && formData.dest && formData.date && formData.time) {
            setLoading(true);
            calcPrice(formData.origin, formData.dest, formData.date, formData.time).then(price => {
                setFormData(p => ({ ...p, price }));
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [formData.origin, formData.dest, formData.date, formData.time]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        if (['origin', 'dest'].includes(name)) {
            const suggs = value ? locations.filter(l => l.toLowerCase().includes(value.toLowerCase())) : [];
            setSuggestions(p => ({ ...p, [name]: suggs }));
        }
    };

    const selectSuggestion = (key, val) => {
        setFormData(p => ({ ...p, [key]: val }));
        setSuggestions(p => ({ ...p, [key]: [] }));
    };

    const bookRide = async (e) => {
        e.preventDefault();
        if (!formData.price) return alert('Fill all fields for quote.');
        setLoading(true);
        try {
            // EmailJS Confirm (Updated Service ID)
            await emailjs.send('service_2ss0i0l', 'YOUR_TEMPLATE_ID', {
                name: formData.name, email: formData.email, phone: formData.phone,
                origin: formData.origin, dest: formData.dest, date: formData.date,
                time: formData.time, price: formData.price
            }, 'YOUR_PUBLIC_KEY');

            // Google Calendar (OAuth)
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) {
                await authInstance.signIn(); // Prompts consent
            }
            const token = authInstance.currentUser.get().getAuthResponse().access_token;
            const endTime = new Date(new Date(`${formData.date}T${formData.time}:00`).getTime() + 60*60*1000).toISOString(); // +1hr est.
            await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: `RideSafe Booking: ${formData.origin} → ${formData.dest}`,
                    description: `Passenger: ${formData.name} (${formData.phone})\nEst: $${formData.price}\nPay end-of-ride.`,
                    start: { dateTime: `${formData.date}T${formData.time}:00`, timeZone: 'America/Chicago' },
                    end: { dateTime: endTime, timeZone: 'America/Chicago' }
                })
            });

            // Firebase Archive
            await db.ref('bookings').push({ ...formData, timestamp: Date.now() });

            alert(`Booked! Email sent, calendar updated. Price: $${formData.price} (pay end).`);
            setFormData({ ...formData, price: 0 }); // Reset
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Issue—check console (keys?).');
        }
        setLoading(false);
    };

    return (
        <div className="app">
            <header>
                <div className="tesla-icon" onClick={() => location.reload()}>⚡</div>
                <button className={`driver-btn ${showDriver ? 'show' : ''}`} onClick={() => { setShowDriver(!showDriver); console.log('Driver signup clicked'); }}>Become a Driver</button>
            </header>
            <form onSubmit={bookRide}>
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleInput} placeholder="e.g., Rachel" required />

                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleInput} placeholder="rachel@example.com" required />

                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInput} placeholder="(225) 123-4567" required />

                <label htmlFor="origin">Leaving From (Baton Rouge Area)</label>
                <div className="autocomplete">
                    <input id="origin" name="origin" value={formData.origin} onChange={handleInput} placeholder="e.g., Baton Rouge" required />
                    {suggestions.origin.length > 0 && <div className="suggestions show">{suggestions.origin.map(s => <div key={s} className="suggestion" onClick={() => selectSuggestion('origin', s)}>{s}</div>)}</div>}
                </div>

                <label htmlFor="dest">Going To</label>
                <div className="autocomplete">
                    <input id="dest" name="dest" value={formData.dest} onChange={handleInput} placeholder="e.g., New Orleans" required />
                    {suggestions.dest.length > 0 && <div className="suggestions show">{suggestions.dest.map(s => <div key={s} className="suggestion" onClick={() => selectSuggestion('dest', s)}>{s}</div>)}</div>}
                </div>

                <label htmlFor="date">Date</label>
                <input id="date" name="date" type="date" value={formData.date} onChange={handleInput} required />

                <label htmlFor="time">Time</label>
                <input id="time" name="time" type="time" value={formData.time} onChange={handleInput} required />

                <div className="price-display">Est. Price: ${loading ? '...' : formData.price || 'Enter details'}</div>

                <button type="submit" className="book-btn" disabled={loading || !formData.price}>Book It (Pay End-of-Ride)</button>
            </form>
        </div>
    );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RideSafeApp />);
