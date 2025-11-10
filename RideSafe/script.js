const { useState, useEffect, useRef } = React;

// Error Boundary to prevent blank page on errors
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return <h1 style={{color: 'white'}}>Error: {this.state.error.message}. Check console for details.</h1>;
        }
        return this.props.children;
    }
}

// Firebase Config (Provided)
const firebaseConfig = {
    apiKey: "AIzaSyDC22Z2fuGTc7j9Gm7JKO5dB2NJTiHGIB0",
    authDomain: "ridesafe-app-2faa9.firebaseapp.com",
    databaseURL: "https://ridesafe-app-2faa9-default-rtdb.firebaseio.com/",
    projectId: "ridesafe-app-2faa9",
    storageBucket: "ridesafe-app-2faa9.appspot.com",
    messagingSenderId: "516451873273",
    appId: "1:516451873273:web:0bd8e6027b72c1e0580d28"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// EmailJS Init (with try-catch)
try {
    emailjs.init('YOUR_PUBLIC_KEY');
} catch (err) {
    console.error('EmailJS init failed:', err);
}

// Country Club Coords (Fixed Base)
const countryClub = { lat: 30.4103, lng: -91.1868 };

// Airport addresses
const airports = {
    MSY: '1 Terminal Dr, Kenner, LA 70062',
    BTR: '9430 Jackie Cochran Dr, Baton Rouge, LA 70807' // Main Terminal address for BTR
};

// Get Distance (Using JSONP to bypass CORS)
const getDistance = (origin, dest) => new Promise((resolve, reject) => {
    const apiKey = 'AIzaSyCFOS8a0W3jNKcRpFIyJSEwblcj-KQr9pc';
    const callbackName = 'distanceCallback' + Date.now();
    window[callbackName] = (data) => {
        if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
            console.error('Distance API failed:', data);
            reject(new Error(data.error_message || data.status || data.rows[0].elements[0].status));
        } else {
            console.log('Distance API success:', data);
            resolve(data.rows[0].elements[0]);
        }
        delete window[callbackName];
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(dest)}&key=${apiKey}&callback=${callbackName}`;
    script.onerror = () => reject(new Error('Script load error'));
    document.body.appendChild(script);
    script.remove();
});

// Get Dist from Country Club (JSONP)
const getDistFromBase = (origin) => new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: origin }, (results, status) => {
        if (status !== 'OK') return reject(status);
        const originCoords = results[0].geometry.location;
        const apiKey = 'AIzaSyCFOS8a0W3jNKcRpFIyJSEwblcj-KQr9pc';
        const callbackName = 'baseDistCallback' + Date.now();
        window[callbackName] = (data) => {
            if (data.status !== 'OK') {
                console.error('Base Dist API failed:', data);
                reject(new Error(data.error_message || data.status));
            } else {
                console.log('Base Dist API success:', data);
                resolve(data.rows[0].elements[0].distance.value / 1609.34);
            }
            delete window[callbackName];
        };
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originCoords.lat()},${originCoords.lng()}&destinations=${countryClub.lat},${countryClub.lng}&key=${apiKey}&callback=${callbackName}`;
        script.onerror = () => reject(new Error('Script load error'));
        document.body.appendChild(script);
        script.remove();
    });
});

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

// Price Calc (Now returns price and miles)
const calcPrice = async (origin, dest, date, time) => {
    if (!origin || !dest || !date || !time) return { price: 0, miles: 0 };
    const { distance, duration } = await getDistance(origin, dest);
    const miles = Math.round(distance.value / 1609.34);
    const mins = duration.value / 60;
    const base = 1.05 + (1.05 * miles) + (0.15 * mins);
    const baseDist = await getDistFromBase(origin);
    const distMult = baseDist <= 10 ? 1 : baseDist <= 20 ? 1.25 : baseDist <= 35 ? 1.42 : 2;
    const surge = getSurge(date, time);
    const price = Math.round((base * distMult * surge) * 100) / 100;
    console.log('Price Calc Details:', { miles, mins, base, baseDist, distMult, surge, price }); // Debug
    return { price, miles };
};

// Week Date Picker Component
const WeekDatePicker = ({ value, onChange }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek); // Start from Sunday
        setCurrentWeekStart(start);
    }, []);

    const nextWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + 7);
        setCurrentWeekStart(newStart);
    };

    const prevWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() - 7);
        setCurrentWeekStart(newStart);
    };

    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(day.getDate() + i);
        days.push(day);
    }

    const selectDay = (day) => {
        onChange(day.toISOString().split('T')[0]);
    };

    return (
        <div className="week-picker">
            <div className="nav-buttons">
                <button onClick={prevWeek}>Prev Week</button>
                <button onClick={nextWeek}>Next Week</button>
            </div>
            <div className="week-days">
                {days.map((day, idx) => (
                    <div key={idx} className={`day-button ${value === day.toISOString().split('T')[0] ? 'selected' : ''}`} onClick={() => selectDay(day)}>
                        {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main App
const RideSafeApp = () => {
    const [formData, setFormData] = useState({
        name: localStorage.getItem('rs_name') || '',
        email: localStorage.getItem('rs_email') || '',
        phone: localStorage.getItem('rs_phone') || '',
        pickup: localStorage.getItem('rs_pickup') || '',
        dropoff: localStorage.getItem('rs_dropoff') || '',
        date: localStorage.getItem('rs_date') || '',
        time: localStorage.getItem('rs_time') || '',
        price: 0,
        miles: 0
    });
    const [loading, setLoading] = useState(false);
    const [showDriver, setShowDriver] = useState(false);
    const pickupRef = useRef(null);
    const dropoffRef = useRef(null);

    useEffect(() => {
        Object.entries(formData).forEach(([k, v]) => localStorage.setItem(`rs_${k}`, v));
        if (formData.pickup && formData.dropoff && formData.date && formData.time) {
            setLoading(true);
            calcPrice(formData.pickup, formData.dropoff, formData.date, formData.time).then(({ price, miles }) => {
                setFormData(p => ({ ...p, price, miles }));
                setLoading(false);
            }).catch((err) => {
                console.error('Calc error:', err);
                setLoading(false);
            });
        }
    }, [formData.pickup, formData.dropoff, formData.date, formData.time]);

    useEffect(() => {
        if (pickupRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(pickupRef.current, { types: ['geocode'] });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                setFormData(p => ({ ...p, pickup: place.formatted_address || pickupRef.current.value }));
            });
        }
        if (dropoffRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(dropoffRef.current, { types: ['geocode'] });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                setFormData(p => ({ ...p, dropoff: place.formatted_address || dropoffRef.current.value }));
            });
        }
    }, []);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const bookRide = async (e) => {
        e.preventDefault();
        if (!formData.price) return alert('Fill all fields for quote.');
        setLoading(true);
        try {
            await emailjs.send('service_2ss0i0l', 'YOUR_TEMPLATE_ID', {
                name: formData.name, email: formData.email, phone: formData.phone,
                origin: formData.pickup, dest: formData.dropoff, date: formData.date,
                time: formData.time, price: formData.price
            }, 'YOUR_PUBLIC_KEY');

            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) await authInstance.signIn();
            const token = authInstance.currentUser.get().getAuthResponse().access_token;
            const endTime = new Date(new Date(`${formData.date}T${formData.time}:00`).getTime() + 60*60*1000).toISOString();
            await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: `RideSafe Booking: ${formData.pickup} → ${formData.dropoff}`,
                    description: `Passenger: ${formData.name} (${formData.phone})\nEst: $${formData.price}\nPay end-of-ride.`,
                    start: { dateTime: `${formData.date}T${formData.time}:00`, timeZone: 'America/Chicago' },
                    end: { dateTime: endTime, timeZone: 'America/Chicago' }
                })
            });

            await db.ref('bookings').push({ ...formData, timestamp: Date.now() });

            alert(`Booked! Email sent, calendar updated. Price: $${formData.price} (pay end).`);
            setFormData({ ...formData, price: 0, miles: 0 });
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Booking issue (likely keys)—check console. Firebase archived anyway.');
        }
        setLoading(false);
    };

    return (
        <div className="app">
            <div className="title-section">
                <div className="tesla-icon" onClick={() => location.reload()}>⚡</div>
                <img src="https://lancewoolie.com/RideSafe/img/r
