// script-compiled.js - Full Pre-Compiled Version (Babel Output)
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const { useState, useEffect, useRef } = React;

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/_jsxs("h1", {
        style: { color: 'white' },
        children: ["Error: ", this.state.error.message, ". Check console for details."]
      });
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

// EmailJS Init (Updated with your public key)
try {
  emailjs.init('CHqNrS_37-ZHjibQR');
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
const timeToMins = timeStr => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};
const formatTime12 = timeStr => {
  let [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// Get Distance (Switched to fetch to avoid JSONP/CSP issues)
const getDistance = async (origin, dest) => {
  const apiKey = 'AIzaSyDCtBJCtWAp1vUMEWfj9qX-gb1IMqiln6w';
  const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(dest)}&key=${apiKey}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const data = await response.json();
  if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
    console.error('Distance API failed:', data);
    throw new Error(data.error_message || data.status || data.rows[0].elements[0].status);
  }
  console.log('Distance API success:', data);
  return data.rows[0].elements[0];
};

// Calc Distance (independent of date/time)
const calcDistance = async (origin, dest) => {
  if (!origin || !dest) return { miles: 0, durationSecs: 0 };
  try {
    const { distance, duration } = await getDistance(origin, dest);
    const miles = Math.round(distance.value / 1609.34);
    const durationSecs = duration.value;
    console.log('Distance Calc Details:', { miles, durationSecs });
    return { miles, durationSecs };
  } catch (err) {
    console.error('Distance calc error:', err);
    return { miles: 0, durationSecs: 0 };
  }
};

// Surge Mult (includes early/after hours based on pickup time)
const getSurge = (dateStr, timeStr, pickupTimeStr) => {
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  const pickupDt = new Date(`${dateStr}T${pickupTimeStr}:00`);
  const hour = dt.getHours() + dt.getMinutes() / 60;
  const pickupHour = pickupDt.getHours() + pickupDt.getMinutes() / 60;
  const day = dt.getDay();
  let surge = 1;
  if (hour >= 16.5 && hour <= 18.5 && day >= 1 && day <= 5) surge = 1.4;
  if (day === 5 && hour >= 17) surge = 1.6;
  if ((day === 0 || day === 6) && hour >= 20) surge = 1.8;
  if (pickupHour >= 3 && pickupHour < 7) surge *= 1.15;
  if (pickupHour >= 22 || pickupHour < 3) surge *= 1.3;
  return surge;
};

// Price Calc (triggered by arrival time; simplified to distance + (distance x surge % increase) = distance * surge)
const calcPrice = (miles, durationSecs, date, time) => {
  if (!miles || !date || !time || miles === 0) return { price: 0, pickupTime: '' };
  try {
    const arrivalDt = new Date(`${date}T${time}:00`);
    const pickupDt = new Date(arrivalDt.getTime() - (durationSecs * 1000 + 300000)); // Subtract duration + 5 min buffer
    const pickupTimeStr = pickupDt.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    const surge = getSurge(date, time, pickupTimeStr);
    const surgeIncrease = surge - 1;
    const price = miles + miles * surgeIncrease; // Equivalent to miles * surge
    const roundedPrice = Math.round(price * 100) / 100;
    console.log('Price Calc Details:', { miles, durationSecs, surge, pickupTime: pickupTimeStr, price: roundedPrice });
    return { price: roundedPrice, pickupTime: pickupTimeStr };
  } catch (err) {
    console.error('Price calc error:', err);
    return { price: 0, pickupTime: '' };
  }
};

// Week Date Picker (Monday start, color coding, Trips label with matching color)
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
  const selectDay = day => {
    onChange(day.toISOString().split('T')[0]);
  };
  const getDayClass = day => {
    const dayStr = day.toISOString().split('T')[0];
    const dayBookings = bookings[dayStr] || [];
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0) return 'sunday'; // Grey out Sundays
    const bookedHours = dayBookings.reduce((total, b) => total + (b.durationMins || 60) / 60, 0);
    if (bookedHours > 4) return 'red';
    if (bookedHours > 2) return 'orange';
    if (dayOfWeek >= 4 && dayOfWeek <= 6) return 'orange'; // Thu/Fri/Sat min orange
    return 'green';
  };
  const getTripsLabelColor = dayClass => {
    switch (dayClass) {
      case 'green': return 'green';
      case 'orange': return 'orange';
      case 'red': return 'red';
      default: return 'inherit';
    }
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "week-picker",
    children: [
      /*#__PURE__*/_jsx("div", {
        className: "week-days",
        children: days.map((day, idx) => {
          const dayStr = day.toISOString().split('T')[0];
          const isSelected = value === dayStr;
          const dayClass = getDayClass(day);
          const dayOfWeek = day.getDay();
          const hasSurge = dayOfWeek >= 4 && dayOfWeek <= 6;
          const tripCount = (bookings[dayStr] || []).length || 0;
          const showTrips = dayClass !== 'green' && dayClass !== 'sunday' && tripCount > 0;
          return /*#__PURE__*/_jsxs("div", {
            className: "day-wrapper",
            children: [
              dayOfWeek !== 0 && (hasSurge ? /*#__PURE__*/_jsx("span", { className: "surge-label", children: "Surge Pricing" }) : /*#__PURE__*/_jsx("span", { className: "surge-placeholder" })),
              /*#__PURE__*/_jsxs("div", {
                className: `day-button ${isSelected ? 'selected' : ''} ${dayClass}`,
                onClick: () => dayClass !== 'sunday' && selectDay(day),
                children: [
                  day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                  showTrips && /*#__PURE__*/_jsxs("span", {
                    className: "trips-label",
                    style: { color: getTripsLabelColor(dayClass) },
                    children: [tripCount, " Trips"]
                  })
                ]
              })
            ]
          }, idx);
        })
      }),
      /*#__PURE__*/_jsxs("div", {
        className: "nav-buttons",
        children: [
          /*#__PURE__*/_jsx("button", { onClick: prevWeek, children: "Prev Week" }),
          /*#__PURE__*/_jsx("button", { onClick: nextWeek, children: "Next Week" })
        ]
      })
    ]
  });
};

// Time Picker (30-min increments, 12h display, booked check - Completed with overlap logic)
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
  const isSlotBooked = (proposedArrival, date, bookings, durationMins) => {
    if (!date || !bookings || !bookings[date]) return false;
    const arrivalMins = timeToMins(proposedArrival);
    const pickupMins = arrivalMins - durationMins;
    const dayBookings = bookings[date];
    for (let booking of dayBookings) {
      const bPickup = timeToMins(booking.pickupTime);
      const bDurationMins = booking.durationMins || 60;
      const bEnd = bPickup + bDurationMins;
      if (Math.max(pickupMins, bPickup) < Math.min(arrivalMins, bEnd)) return true;
    }
    return false;
  };
  return /*#__PURE__*/_jsx("div", {
    className: "time-picker",
    children: times.map(time => {
      const durMins = durationSecs / 60;
      const booked = isSlotBooked(time, date, bookings, durMins);
      const displayTime = formatTime12(time);
      const isSelected = value === time;
      return /*#__PURE__*/_jsx("div", {
        className: `time-option ${booked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`,
        onClick: () => !booked && onChange(time),
        children: `${displayTime}${booked ? ' (Booked)' : ''}`
      }, time);
    })
  });
};

// Place Autocomplete (Uses Google Places API)
const PlaceAutocomplete = ({ value, onChange, placeholder }) => {
  const inputRef = useRef(null);
  useEffect(() => {
    if (window.google && window.google.maps.places && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { types: ['address'] });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) onChange(place.formatted_address);
      });
    }
  }, []);
  return /*#__PURE__*/_jsx("input", {
    ref: inputRef,
    type: "text",
    value,
    onChange: e => onChange(e.target.value),
    placeholder,
    className: "form-input"
  });
};

// Map Component (Shows route)
const Map = ({ pickup, dropoff }) => {
  const mapRef = useRef(null);
  useEffect(() => {
    if (!window.google || !pickup || !dropoff || !mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, { zoom: 10, center: countryClub });
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({ map });
    const geocoder = new window.google.maps.Geocoder();
    Promise.all([
      geocoder.geocode({ address: pickup }),
      geocoder.geocode({ address: dropoff })
    ]).then(([pResults, dResults]) => {
      if (pResults[0] && dResults[0]) {
        const request = {
          origin: pResults[0].geometry.location,
          destination: dResults[0].geometry.location,
          travelMode: 'DRIVING'
        };
        directionsService.route(request, (result, status) => {
          if (status === 'OK') directionsRenderer.setDirections(result);
        });
      }
    }).catch(console.error);
  }, [pickup, dropoff]);
  return /*#__PURE__*/_jsx("div", { ref: mapRef, className: "map-container" });
};

// Main App Component
const App = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [distance, setDistance] = useState({ miles: 0, durationSecs: 0 });
  const [price, setPrice] = useState({ price: 0, pickupTime: '' });
  const [bookings, setBookings] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(Date.now() - (new Date().getDay() - 1) * 86400000)); // Monday start
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = db.ref('bookings').on('value', snapshot => {
      const data = snapshot.val() || {};
      // Transform to {date: [bookings]} for picker
      const transformed = {};
      Object.keys(data).forEach(bookingDate => {
        transformed[bookingDate] = Object.values(data[bookingDate] || {});
      });
      setBookings(transformed);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (pickup && dropoff) {
      calcDistance(pickup, dropoff).then(setDistance);
    } else {
      setDistance({ miles: 0, durationSecs: 0 });
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    if (distance.miles > 0 && date && time) {
      setPrice(calcPrice(distance.miles, distance.durationSecs, date, time));
    } else {
      setPrice({ price: 0, pickupTime: '' });
    }
  }, [distance, date, time]);

  const handleBook = async () => {
    if (!pickup || !dropoff || !date || !time || price.price === 0) return;
    setLoading(true);
    try {
      const durationMins = Math.round(distance.durationSecs / 60);
      const booking = {
        pickup,
        dropoff,
        date,
        arrivalTime: time,
        pickupTime: price.pickupTime,
        miles: distance.miles,
        price: price.price,
        durationMins,
        timestamp: Date.now()
      };
      const newKey = db.ref('bookings').push().key;
      await db.ref(`bookings/${date}/${newKey}`).set(booking);

      // Send EmailJS (Update template ID as needed)
      const templateParams = {
        pickup,
        dropoff,
        date,
        arrival_time: time,
        pickup_time: price.pickupTime,
        miles: distance.miles,
        price: `$${price.price}`,
        to_email: 'your-driver@example.com' // Update with driver email
      };
      await emailjs.send('service_2ss0i0l', 'template_your_booking_template', templateParams);
      alert('Booking confirmed! Email sent.');
      // Reset form
      setPickup(''); setDropoff(''); setTime('09:00');
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed—check console.');
    }
    setLoading(false);
  };

  const pickupDisplay = formatTime12(price.pickupTime);

  return /*#__PURE__*/_jsxs(ErrorBoundary, {
    children: [
      /*#__PURE__*/_jsxs("header", {
        children: [
          /*#__PURE__*/_jsx("div", {
            className: "title-section",
            children: [
              /*#__PURE__*/_jsx("img", {
                src: "https://lancewoolie.com/RideSafe/img/RIDESAFE TELSA BLUE CHECKsm.png",
                alt: "RideSafe",
                className: "logo"
              }),
              /*#__PURE__*/_jsxs("div", {
                children: [
                  /*#__PURE__*/_jsx("h1", { className: "title", children: "RideSafe" }),
                  /*#__PURE__*/_jsx("p", { className: "motto", children: "Safe, Reliable Airport Transfers" })
                ]
              })
            ]
          }),
          /*#__PURE__*/_jsx("div", { className: "tesla-icon", children: "🚀" })
        ]
      }),
      /*#__PURE__*/_jsx("div", {
        className: "app",
        children: /*#__PURE__*/_jsx("div", {
          className: "container",
          children: /*#__PURE__*/_jsxs("form", {
            children: [
              /*#__PURE__*/_jsx(PlaceAutocomplete, {
                value: pickup,
                onChange: setPickup,
                placeholder: "Pickup Location (e.g., Baton Rouge Metropolitan Airport)"
              }),
              /*#__PURE__*/_jsx(PlaceAutocomplete, {
                value: dropoff,
                onChange: setDropoff,
                placeholder: "Dropoff Location (e.g., Louis Armstrong New Orleans International Airport)"
              }),
              /*#__PURE__*/_jsx(WeekDatePicker, {
                value: date,
                onChange: setDate,
                bookings,
                currentWeekStart,
                setCurrentWeekStart
              }),
              /*#__PURE__*/_jsx(TimePicker, {
                value: time,
                onChange: setTime,
                date,
                bookings,
                durationSecs: distance.durationSecs
              }),
              price.price > 0 && /*#__PURE__*/_jsx("div", {
                className: "estimate",
                children: /*#__PURE__*/_jsxs("p", {
                  children: [
                    "Estimated: $",
                    price.price,
                    " (",
                    distance.miles,
                    " miles | Pickup ~",
                    pickupDisplay,
                    ")"
                  ]
                })
              }),
              /*#__PURE__*/_jsx(Map, { pickup, dropoff }),
              /*#__PURE__*/_jsx("button", {
                type: "button",
                onClick: handleBook,
                disabled: loading || price.price === 0,
                className: "book-btn",
                children: loading ? "Booking..." : "Book Ride"
              })
            ]
          })
        })
      })
    ]
  });
};

// Render App
ReactDOM.render( /*#__PURE__*/_jsx(App, {}), document.getElementById('root'));
