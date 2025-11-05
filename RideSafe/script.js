const { useState, useEffect, useRef } = React;

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

// EmailJS Init (Swap Template/Public Keys if needed)
emailjs.init('YOUR_PUBLIC_KEY');

// Country Club Coords (Fixed Base)
const countryClub = { lat: 30.4103, lng: -91.1868 };

// Get Distance (Real Google API with added logging)
const getDistance = async (origin, dest) => {
    const apiKey = 'AIzaSyCFOS8a0W3jNKcRpFIyJSEwblcj-KQr9pc';
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(dest)}&key=${apiKey}`);
        const data = await response.json();
        if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
            console.error('Distance API failed:', data);
            throw new Error(data.error_message || data.status || data.rows[0].elements[0].status);
        }
        return data.rows[0].elements[0];
    } catch (err) {
        console.error('Distance API error:', err.message, ' - Check API key restrictions (e.g., referrer, billing) or address validity.');
        return { distance: { value: 10 * 1609.34 }, duration: { value: 15 * 60 } }; // Fallback
    }
};

// Get Dist from Country Club (Real API with added logging)
const getDistFromBase = async (origin) => {
    const apiKey = 'AIzaSyCFOS8a0W3jNKcRpFIyJSEwblcj-KQr9pc';
    try {
        const geocoder = new google.maps.Geocoder();
        const originCoords = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: origin }, (results, status) => {
                if (status === 'OK') resolve(results[0].geometry.location);
                else reject(status);
            });
        });
        const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originCoords.lat()},${originCoords.lng()}&destinations=${countryClub.lat},${countryClub.lng}&key=${apiKey}`);
        const data = await response.json();
        if (data.status !== 'OK') {
            console.error('Base Dist API failed:', data);
            throw new Error(data.error_message || data.status);
        }
        return data.rows[0].elements[0].distance.value / 1609.34; // miles
    } catch (err) {
        console.error('Base Dist error:', err.message, ' - Check API key restrictions (e.g., referrer, billing) or address validity.');
        return 10; // Fallback
    }
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

// Price Calc (Now returns price and miles)
const calcPrice = async (origin, dest, date, time) => {
    if (!origin || !dest || !date || !time) return { price: 0, miles: 0 };
    const { distance, duration } = await getDistance(origin, dest);
    const miles = Math.round(distance.value / 1609.34);
    const mins = duration.value / 60
