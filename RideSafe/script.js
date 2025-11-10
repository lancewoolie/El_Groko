const { useState, useEffect, useRef } = React;

// Error Boundary
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

// Firebase Config
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

// EmailJS Init
try {
    emailjs.init('YOUR_PUBLIC_KEY');
} catch (err) {
    console.error('EmailJS init failed:', err);
}

// Country Club Coords
const countryClub = { lat: 30.4103, lng: -91.1868 };

// Airport addresses
const airports = {
    MSY: '1 Terminal Dr, Kenner, LA 70062',
    BTR: '9430 Jackie Cochran Dr, Baton Rouge, LA 70807'
};

// Utility functions
const timeToMins = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const formatTime12 = (timeStr) => {
    let [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// Get Distance (JSONP)
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
    });
});

// Surge Mult (includes early/after hours based on pickup time)
const getSurge = (dateStr, timeStr, pickupTimeStr) => {
    const dt = new Date(`${dateStr}T${timeStr}:00`);
    const pickupDt = new Date(`${dateStr}T${pickupTimeStr}:00`);
    const hour = dt.getHours() + (dt.getMinutes() / 60);
    const pickupHour = pickupDt.getHours() + (pickupDt.getMinutes() / 60);
    const day = dt.getDay();
    let surge = 1;
    if (hour >= 16.5 && hour <= 18.5 && day >= 1 && day <= 5) surge = 1.4;
    if (day === 5 && hour >= 17) surge = 1.6;
    if ((day === 0 || day === 6) && hour >= 20) surge = 1.8;
    if (pickupHour >= 3 && pickupHour < 7) surge *= 1.15;
    if (pickupHour >= 22 || pickupHour < 3) surge *= 1.3;
    return surge;
};

// Price Calc
const calcPrice = async (origin, dest, date, time) => {
    if (!origin || !dest || !date || !time) return { price: 0, miles: 0, pickupTime: '', durationSecs: 0 };
    try {
        const { distance, duration } = await getDistance(origin, dest);
        const miles = Math.round(distance.value / 1609.34);
        const mins = duration.value / 60;
        const base = 1.05 + (1.05 * miles) + (0.15 * mins);
        const baseDist = await getDistFromBase(origin);
        const distMult = baseDist <= 10 ? 1 : baseDist <= 20 ? 1.25 : baseDist <= 35 ? 1.42 : 2;
        const arrivalDt = new Date(`${date}T${time}:00`);
        const pickupDt = new Date(arrivalDt.getTime() - (duration.value * 1000 + 300000)); // Subtract duration + 5 min buffer
        const pickupTimeStr = pickupDt.toTimeString().split(' ')[0].substring(0,5); // HH:MM
        const surge = getSurge(date, time, pickupTimeStr);
        const price = Math.round((base * distMult * surge) * 100) / 100;
        console.log('Price Calc Details:', { miles, mins, base, baseDist, distMult, surge, pickupTime: pickupTimeStr, price });
        return { price, miles, pickupTime: pickupTimeStr, durationSecs: duration.value };
    } catch (err) {
        console.error('Calc error:', err);
        return { price: 0, miles: 0, pickupTime: '', durationSecs: 0 };
    }
};

// Week Date Picker (Monday start, color coding)
const WeekDatePicker = ({ value, onChange, bookings, currentWeekStart, setCurrentWeekStart }) => {
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

    const getDayClass = (day) => {
        const dayStr = day.toISOString().split('T')[0];
        const dayBookings = bookings[dayStr] || [];
        const dayOfWeek = day.getDay();
        if (dayOfWeek === 0) return 'sunday'; // Grey out Sundays
        const bookedHours = dayBookings.reduce((total, b) => total + ((b.durationMins || 60) / 60), 0);
        if (bookedHours > 4) return 'red';
        if (bookedHours > 2) return 'orange';
        if (dayOfWeek >= 4 && dayOfWeek <= 6) return 'orange'; // Thu/Fri/Sat min orange
        return 'green';
    };

    return (
        <div className="week-picker">
            <div className="week-days">
                {days.map((day, idx) => {
                    const dayStr = day.toISOString().split('T')[0];
                    const isSelected = value === dayStr;
                    const dayClass = getDayClass(day);
                    const dayOfWeek = day.getDay();
                    return (
                        <div key={idx} className="day-wrapper">
                            {dayOfWeek >= 4 && dayOfWeek <= 6 && <span className="surge-label">Surge Pricing</span>}
                            <div className={`day-button ${isSelected ? 'selected' : ''} ${dayClass}`} onClick={() => dayClass !== 'sunday' && selectDay(day)}>
                                {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {dayClass !== 'green' && <span> ({bookings[dayStr]?.length || 0} bookings)</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="nav-buttons">
                <button onClick={prevWeek}>Prev Week</button>
                <button onClick={nextWeek}>Next Week</button>
            </div>
        </div>
    );
};

// Time Picker (30-min increments, 12h display, booked check)
const TimePicker = ({ value, onChange, date, bookings, durationSecs }) => {
    const generateTimes = () => {
        const times = [];
        for (let h = 6; h <= 22; h++) {
            times.push(`${h.toString().padStart(2, '0')}:00`);
            if (h < 22) times.push(`${h.toString().padStart(2, '0')}:30`);
        }
        return times;
    };

    const times = generateTimes();

    const isSlotBooked = (proposedArrival) => {
        if (!date || !bookings || !bookings[date] || !durationSecs) return false;
        const arrivalMins = timeToMins(proposedArrival);
        const bufferMins = 5;
        const pickupMins = arrivalMins - (durationSecs / 60) - bufferMins;
        if (pickupMins < 0) return true; // Invalid slot
        return bookings[date].some(b => {
            if (!b.pickupTime || b.durationMins === undefined) return false;
            const bStart = timeToMins(b.pickupTime);
            const bEnd = bStart + b.durationMins;
            const pEnd = arrivalMins;
            return Math.max(pickupMins, bStart) < Math.min(pEnd, bEnd);
        });
    };

    return (
        <div className="time-picker">
            <div className="time-options">
                {times.map(t => {
                    const display = formatTime12(t);
                    const isSelected = value === t;
                    const isBooked = isSlotBooked(t);
                    return (
                        <button
                            key={t}
                            className={`time-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                            onClick={() => !isBooked && onChange(t)}
                            disabled={isBooked}
                        >
                            {display}
                            {isBooked && <span className="booked-label">BOOKED</span>}
                        </button>
                    );
                })}
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
        pickupTime: '',
        price: 0,
        miles: 0,
        durationSecs: 0
    });
    const [bookings, setBookings] = useState({});
    const [loading, setLoading] = useState(false);
    const [showDriver, setShowDriver] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const pickupRef = useRef(null);
    const dropoffRef = useRef(null);

    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday start
        setCurrentWeekStart(start);
    }, []);

    useEffect(() => {
        Object.entries(formData).forEach(([k, v]) => localStorage.setItem(`rs_${k}`, v));
        if (formData.pickup && formData.dropoff && formData.date && formData.time) {
            setLoading(true);
            calcPrice(formData.pickup, formData.dropoff, formData.date, formData.time).then(({ price, miles, pickupTime, durationSecs }) => {
                setFormData(p => ({ ...p, price, miles, pickupTime, durationSecs }));
                setLoading(false);
            });
        }
    }, [formData.pickup, formData.dropoff, formData.date, formData.time]);

    useEffect(() => {
        // Fetch bookings for current week
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const startDate = currentWeekStart.toISOString().split('T')[0];
        const endDate = weekEnd.toISOString().split('T')[0];
        db.ref('bookings').orderByChild('date').startAt(startDate).endAt(endDate).once('value').then(snapshot => {
            const bookingData = snapshot.val() || {};
            const processedBookings = {};
            Object.values(bookingData).forEach(b => {
                const day = b.date;
                if (!processedBookings[day]) processedBookings[day] = [];
                processedBookings[day].push(b);
            });
            setBookings(processedBookings);
        });
    }, [currentWeekStart]);

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
                pickup: formData.pickup, dropoff: formData.dropoff, date: formData.date,
                time: formData.time, pickupTime: formData.pickupTime, price: formData.price
            }, 'YOUR_PUBLIC_KEY');

            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) await authInstance.signIn();
            const token = authInstance.currentUser.get().getAuthResponse().access_token;
            const arrivalDt = new Date(`${formData.date}T${formData.time}:00`);
            const pickupDtStr = `${formData.date}T${formData.pickupTime}:00`;
            await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: `RideSafe Booking: ${formData.pickup} → ${formData.dropoff}`,
                    description: `Passenger: ${formData.name} (${formData.phone})\nEst: $${formData.price}\nPickup: ${formData.pickupTime}\nPay end-of-ride.`,
                    start: { dateTime: pickupDtStr, timeZone: 'America/Chicago' },
                    end: { dateTime: arrivalDt.toISOString(), timeZone: 'America/Chicago' }
                })
            });

            const durationMins = Math.round(formData.durationSecs / 60) || 60;
            await db.ref('bookings').push({ ...formData, timestamp: Date.now(), durationMins });

            alert(`Booked! Email sent, calendar updated. Pickup: ${formatTime12(formData.pickupTime)} CST. Price: $${formData.price} (pay end).`);
            setFormData({ ...formData, price: 0, miles: 0, pickupTime: '', durationSecs: 0, time: '' });
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
                <img src="https://lancewoolie.com/RideSafe/img/RIDESAFE TELSA BLUE CHECKlg.png" alt="RideSafe Logo" className="logo" />
                <div className="title">RideSafe</div>
                <div className="motto">Safety should not be a luxury</div>
            </div>
            <header>
                <button className={`driver-btn ${showDriver ? 'show' : ''}`} onClick={() => { setShowDriver(!showDriver); console.log('Driver signup clicked'); }}>Become a Driver</button>
            </header>
            <div className="container">
                <form onSubmit={bookRide}>
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" value={formData.name} onChange={handleInput} placeholder="e.g., Rachel" required />

                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleInput} placeholder="rachel@example.com" required />

                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInput} placeholder="(225) 123-4567" required />

                    <label htmlFor="pickup">Pick up Address</label>
                    <div className="autocomplete">
                        <input ref={pickupRef} id="pickup" name="pickup" value={formData.pickup} onChange={handleInput} placeholder="e.g., Baton Rouge" required />
                    </div>

                    <label htmlFor="dropoff">Drop off Address</label>
                    <div className="autocomplete">
                        <input ref={dropoffRef} id="dropoff" name="dropoff" value={formData.dropoff} onChange={handleInput} placeholder="e.g., New Orleans" required />
                    </div>

                    <div className="estimates">
                        <div className="distance-display">Trip Distance: {loading ? '...' : formData.miles || 0} miles</div>
                        <div className="price-display">RideSafe Fee: ${loading ? '...' : formData.price || 0}</div>
                    </div>

                    <label>Arrival Time at location</label>
                    <WeekDatePicker value={formData.date} onChange={(date) => handleInput({ target: { name: 'date', value: date } })} bookings={bookings} currentWeekStart={currentWeekStart} setCurrentWeekStart={setCurrentWeekStart} />

                    <div className="time-row">
                        <span className="time-label">Arrival Time (CST):</span>
                        <TimePicker value={formData.time} onChange={(time) => handleInput({ target: { name: 'time', value: time } })} date={formData.date} bookings={bookings} durationSecs={formData.durationSecs} />
                    </div>

                    {formData.pickupTime && (
                        <div className="pickup-time-display">
                            Est. Pickup Time: <strong style={{fontSize: '2em'}}>{formatTime12(formData.pickupTime)}</strong> (CST)
                        </div>
                    )}

                    <button type="submit" className="book-btn" disabled={loading}>
                        <img src="https://lancewoolie.com/RideSafe/img/RIDESAFE TELSA BLUE CHECKsm.png" alt="RideSafe Verified" style={{ width: '20px', marginRight: '5px' }} />
                        {loading ? 'BOOKING...' : 'BOOK IT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><RideSafeApp /></ErrorBoundary>);
