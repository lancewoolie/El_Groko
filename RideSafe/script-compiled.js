// script-compiled.js - Full Pre-Compiled React (Global createElement, No Imports)
(function() {
  // Error Boundary
  function ErrorBoundary(props) {
    this.state = { hasError: false };
  }
  ErrorBoundary.prototype = Object.create(React.Component.prototype);
  ErrorBoundary.prototype.constructor = ErrorBoundary;
  ErrorBoundary.getDerivedStateFromError = function(error) {
    return { hasError: true, error: error };
  };
  ErrorBoundary.prototype.render = function() {
    if (this.state.hasError) {
      return React.createElement('h1', { style: { color: 'white' } }, 'Error: ', this.state.error.message, '. Check console for details.');
    }
    return this.props.children;
  };

  // Firebase Config
  var firebaseConfig = {
    apiKey: "AIzaSyDC22Z2fuGTc7j9Gm7JKO5dB2NJTiHGIB0",
    authDomain: "ridesafe-app-2faa9.firebaseapp.com",
    databaseURL: "https://ridesafe-app-2faa9-default-rtdb.firebaseio.com/",
    projectId: "ridesafe-app-2faa9",
    storageBucket: "ridesafe-app-2faa9.appspot.com",
    messagingSenderId: "516451873273",
    appId: "1:516451873273:web:0bd8e6027b72c1e0580d28"
  };
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();

  // EmailJS Init
  try {
    emailjs.init('CHqNrS_37-ZHjibQR');
  } catch (err) {
    console.error('EmailJS init failed:', err);
  }

  // Coords
  var countryClub = { lat: 30.4103, lng: -91.1868 };

  // Utilities (With Your Guarded formatTime12)
  function timeToMins(timeStr) {
    var parts = timeStr.split(':').map(Number);
    return parts[0] * 60 + parts[1];
  }
  function formatTime12(timeStr) {
    if (!timeStr || timeStr.trim() === '') return '';  // Guard: Skip if empty/undefined
    let [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';  // Guard: Skip invalid numbers
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  // Distance
  function getDistance(origin, dest) {
    return new Promise(function(resolve, reject) {
      var apiKey = 'AIzaSyDCtBJCtWAp1vUMEWfj9qX-gb1IMqiln6w';
      fetch('https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + encodeURIComponent(origin) + '&destinations=' + encodeURIComponent(dest) + '&key=' + apiKey)
        .then(function(response) { return response.json(); })
        .then(function(data) {
          if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
            reject(new Error(data.error_message || data.status || data.rows[0].elements[0].status));
            return;
          }
          console.log('Distance API success:', data);
          resolve(data.rows[0].elements[0]);
        })
        .catch(reject);
    });
  }
  function calcDistance(origin, dest) {
    return new Promise(function(resolve) {
      if (!origin || !dest) {
        resolve({ miles: 0, durationSecs: 0 });
        return;
      }
      getDistance(origin, dest)
        .then(function(result) {
          var miles = Math.round(result.distance.value / 1609.34);
          var durationSecs = result.duration.value;
          console.log('Distance Calc Details:', { miles: miles, durationSecs: durationSecs });
          resolve({ miles: miles, durationSecs: durationSecs });
        })
        .catch(function(err) {
          console.error('Distance calc error:', err);
          resolve({ miles: 0, durationSecs: 0 });
        });
    });
  }

  // Surge & Price
  function getSurge(dateStr, timeStr, pickupTimeStr) {
    var dt = new Date(dateStr + 'T' + timeStr + ':00');
    var pickupDt = new Date(dateStr + 'T' + pickupTimeStr + ':00');
    var hour = dt.getHours() + dt.getMinutes() / 60;
    var pickupHour = pickupDt.getHours() + dt.getMinutes() / 60;
    var day = dt.getDay();
    var surge = 1;
    if (hour >= 16.5 && hour <= 18.5 && day >= 1 && day <= 5) surge = 1.4;
    if (day === 5 && hour >= 17) surge = 1.6;
    if ((day === 0 || day === 6) && hour >= 20) surge = 1.8;
    if (pickupHour >= 3 && pickupHour < 7) surge *= 1.15;
    if (pickupHour >= 22 || pickupHour < 3) surge *= 1.3;
    return surge;
  }
  function calcPrice(miles, durationSecs, date, time) {
    if (!miles || !date || !time || miles === 0) return { price: 0, pickupTime: '' };
    try {
      var arrivalDt = new Date(date + 'T' + time + ':00');
      var pickupDt = new Date(arrivalDt.getTime() - (durationSecs * 1000 + 300000));
      var pickupTimeStr = pickupDt.toTimeString().split(' ')[0].substring(0, 5);
      var surge = getSurge(date, time, pickupTimeStr);
      var surgeIncrease = surge - 1;
      var price = miles + miles * surgeIncrease;
      var roundedPrice = Math.round(price * 100) / 100;
      console.log('Price Calc Details:', { miles: miles, durationSecs: durationSecs, surge: surge, pickupTime: pickupTimeStr, price: roundedPrice });
      return { price: roundedPrice, pickupTime: pickupTimeStr };
    } catch (err) {
      console.error('Price calc error:', err);
      return { price: 0, pickupTime: '' };
    }
  }

  // WeekDatePicker Component
  function WeekDatePicker(props) {
    var value = props.value;
    var onChange = props.onChange;
    var bookings = props.bookings;
    var currentWeekStart = props.currentWeekStart;
    var setCurrentWeekStart = props.setCurrentWeekStart;

    function nextWeek() {
      var newStart = new Date(currentWeekStart);
      newStart.setDate(newStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    }
    function prevWeek() {
      var newStart = new Date(currentWeekStart);
      newStart.setDate(newStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    }
    var days = [];
    for (var i = 0; i < 7; i++) {
      var day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    function selectDay(day) {
      onChange(day.toISOString().split('T')[0]);
    }
    function getDayClass(day) {
      var dayStr = day.toISOString().split('T')[0];
      var dayBookings = bookings[dayStr] || [];
      var dayOfWeek = day.getDay();
      if (dayOfWeek === 0) return 'sunday';
      var bookedHours = dayBookings.reduce(function(total, b) { return total + (b.durationMins || 60) / 60; }, 0);
      if (bookedHours > 4) return 'red';
      if (bookedHours > 2) return 'orange';
      if (dayOfWeek >= 4 && dayOfWeek <= 6) return 'orange';
      return 'green';
    }
    function getTripsLabelColor(dayClass) {
      switch (dayClass) {
        case 'green': return 'green';
        case 'orange': return 'orange';
        case 'red': return 'red';
        default: return 'inherit';
      }
    }
    var dayElements = days.map(function(day, idx) {
      var dayStr = day.toISOString().split('T')[0];
      var isSelected = value === dayStr;
      var dayClass = getDayClass(day);
      var dayOfWeek = day.getDay();
      var hasSurge = dayOfWeek >= 4 && dayOfWeek <= 6;
      var tripCount = (bookings[dayStr] || []).length || 0;
      var showTrips = dayClass !== 'green' && dayClass !== 'sunday' && tripCount > 0;
      var surgeElement = dayOfWeek !== 0 && (hasSurge ? React.createElement('span', { className: 'surge-label' }, 'Surge Pricing') : React.createElement('span', { className: 'surge-placeholder' }));
      var dayContent = [
        day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      ];
      if (showTrips) {
        dayContent.push(React.createElement('span', {
          key: 'trips',
          className: 'trips-label',
          style: { color: getTripsLabelColor(dayClass) }
        }, tripCount, ' Trips'));
      }
      return React.createElement('div', { className: 'day-wrapper', key: idx }, 
        surgeElement,
        React.createElement('div', {
          className: 'day-button ' + (isSelected ? 'selected ' : '') + dayClass,
          onClick: function() { if (dayClass !== 'sunday') selectDay(day); }
        }, dayContent)
      );
    });
    return React.createElement('div', { className: 'week-picker' },
      React.createElement('div', { className: 'week-days' }, dayElements),
      React.createElement('div', { className: 'nav-buttons' },
        React.createElement('button', { onClick: prevWeek }, 'Prev Week'),
        React.createElement('button', { onClick: nextWeek }, 'Next Week')
      )
    );
  }

  // TimePicker Component
  function TimePicker(props) {
    var value = props.value;
    var onChange = props.onChange;
    var date = props.date;
    var bookings = props.bookings;
    var durationSecs = props.durationSecs;

    function generateTimes() {
      var times = [];
      for (var h = 6; h <= 22; h++) {
        times.push(h.toString().padStart(2, '0') + ':00');
        if (h < 22) times.push(h.toString().padStart(2, '0') + ':30');
      }
      return times;
    }
    var times = generateTimes();
    function isSlotBooked(proposedArrival, date, bookings, durationMins) {
      if (!date || !bookings || !bookings[date]) return false;
      var arrivalMins = timeToMins(proposedArrival);
      var pickupMins = arrivalMins - durationMins;
      var dayBookings = bookings[date];
      for (var i = 0; i < dayBookings.length; i++) {
        var booking = dayBookings[i];
        var bPickup = timeToMins(booking.pickupTime);
        var bDurationMins = booking.durationMins || 60;
        var bEnd = bPickup + bDurationMins;
        if (Math.max(pickupMins, bPickup) < Math.min(arrivalMins, bEnd)) return true;
      }
      return false;
    }
    var timeElements = times.map(function(time) {
      var durMins = durationSecs / 60;
      var booked = isSlotBooked(time, date, bookings, durMins);
      var displayTime = formatTime12(time);
      var isSelected = value === time;
      var className = 'time-option ' + (booked ? 'booked ' : '') + (isSelected ? 'selected' : '');
      var content = displayTime + (booked ? ' (Booked)' : '');
      return React.createElement('div', {
        key: time,
        className: className,
        onClick: function() { if (!booked) onChange(time); }
      }, content);
    });
    return React.createElement('div', { className: 'time-picker' }, timeElements);
  }

  // PlaceAutocomplete Component
  function PlaceAutocomplete(props) {
    var value = props.value;
    var onChange = props.onChange;
    var placeholder = props.placeholder;
    var inputRef = React.useRef(null);
    React.useEffect(function() {
      if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
        var autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { types: ['address'] });
        autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();
          if (place.formatted_address) onChange(place.formatted_address);
        });
      }
    }, []);
    return React.createElement('input', {
      ref: inputRef,
      type: 'text',
      value: value,
      onChange: function(e) { onChange(e.target.value); },
      placeholder: placeholder
    });
  }

  // Map Component
  function Map(props) {
    var pickup = props.pickup;
    var dropoff = props.dropoff;
    var mapRef = React.useRef(null);
    React.useEffect(function() {
      if (!window.google || !pickup || !dropoff || !mapRef.current) return;
      var map = new window.google.maps.Map(mapRef.current, { zoom: 10, center: countryClub });
      var directionsService = new window.google.maps.DirectionsService();
      var directionsRenderer = new window.google.maps.DirectionsRenderer({ map: map });
      var geocoder = new window.google.maps.Geocoder();
      Promise.all([
        geocoder.geocode({ address: pickup }),
        geocoder.geocode({ address: dropoff })
      ]).then(function(results) {
        var pResults = results[0];
        var dResults = results[1];
        if (pResults[0] && dResults[0]) {
          var request = {
            origin: pResults[0].geometry.location,
            destination: dResults[0].geometry.location,
            travelMode: 'DRIVING'
          };
          directionsService.route(request, function(result, status) {
            if (status === 'OK') directionsRenderer.setDirections(result);
          });
        }
      }).catch(console.error);
    }, [pickup, dropoff]);
    return React.createElement('div', { ref: mapRef, className: 'map-container' });
  }

  // Main App Component
  function App() {
    var pickupRef = React.useState('');
    var pickup = pickupRef[0];
    var setPickup = pickupRef[1];
    var dropoffRef = React.useState('');
    var dropoff = dropoffRef[0];
    var setDropoff = dropoffRef[1];
    var dateRef = React.useState(new Date().toISOString().split('T')[0]);
    var date = dateRef[0];
    var setDate = dateRef[1];
    var timeRef = React.useState('09:00');
    var time = timeRef[0];
    var setTime = timeRef[1];
    var distanceRef = React.useState({ miles: 0, durationSecs: 0 });
    var distance = distanceRef[0];
    var setDistance = distanceRef[1];
    var priceRef = React.useState({ price: 0, pickupTime: '' });
    var price = priceRef[0];
    var setPrice = priceRef[1];
    var bookingsRef = React.useState({});
    var bookings = bookingsRef[0];
    var setBookings = bookingsRef[1];
    var currentWeekStartRef = React.useState(new Date(Date.now() - (new Date().getDay() - 1) * 86400000));
    var currentWeekStart = currentWeekStartRef[0];
    var setCurrentWeekStart = currentWeekStartRef[1];
    var loadingRef = React.useState(false);
    var loading = loadingRef[0];
    var setLoading = loadingRef[1];

    React.useEffect(function() {
      var unsubscribe = db.ref('bookings').on('value', function(snapshot) {
        var data = snapshot.val() || {};
        var transformed = {};
        Object.keys(data).forEach(function(bookingDate) {
          transformed[bookingDate] = Object.values(data[bookingDate] || {});
        });
        setBookings(transformed);
      });
      return function() { unsubscribe(); };
    }, []);

    React.useEffect(function() {
      if (pickup && dropoff) {
        calcDistance(pickup, dropoff).then(setDistance);
      } else {
        setDistance({ miles: 0, durationSecs: 0 });
      }
    }, [pickup, dropoff]);

    React.useEffect(function() {
      if (distance.miles > 0 && date && time) {
        setPrice(calcPrice(distance.miles, distance.durationSecs, date, time));
      } else {
        setPrice({ price: 0, pickupTime: '' });
      }
    }, [distance, date, time]);

    function handleBook() {
      if (!pickup || !dropoff || !date || !time || price.price === 0) return;
      setLoading(true);
      var durationMins = Math.round(distance.durationSecs / 60);
      var booking = {
        pickup: pickup,
        dropoff: dropoff,
        date: date,
        arrivalTime: time,
        pickupTime: price.pickupTime,
        miles: distance.miles,
        price: price.price,
        durationMins: durationMins,
        timestamp: Date.now()
      };
      var newKey = db.ref('bookings').push().key;
      db.ref('bookings/' + date + '/' + newKey).set(booking).then(function() {
        var templateParams = {
          pickup: pickup,
          dropoff: dropoff,
          date: date,
          arrival_time: time,
          pickup_time: price.pickupTime,
          miles: distance.miles,
          price: '$' + price.price,
          to_email: 'lancewoolie@gmail.com'
        };
        return emailjs.send('service_2ss0i0l', 'template_k8h7f8m', templateParams);
      }).then(function() {
        alert('Booking confirmed! Email sent.');
        setPickup(''); setDropoff(''); setTime('09:00');
      }).catch(function(err) {
        console.error('Booking failed:', err);
        alert('Booking failed—check console.');
      }).finally(function() {
        setLoading(false);
      });
    }

    var pickupDisplay = formatTime12(price.pickupTime);
    var headerContent = [
      React.createElement('img', {
        key: 'logo',
        src: "https://lancewoolie.com/RideSafe/img/RIDESAFE TELSA BLUE CHECKsm.png",
        alt: "RideSafe",
        className: "logo"
      }),
      React.createElement('div', { key: 'title-div' },
        React.createElement('h1', { className: 'title' }, 'RideSafe'),
        React.createElement('p', { className: 'motto' }, 'verified drivers verified passengers')
      )
    ];
    var titleSection = React.createElement('div', { className: 'title-section' }, headerContent);
    var teslaIcon = React.createElement('div', { className: 'tesla-icon' }, '🚀');
    var header = React.createElement('header', null, titleSection, teslaIcon);

    var formElements = [
      React.createElement(PlaceAutocomplete, {
        key: 'pickup',
        value: pickup,
        onChange: setPickup,
        placeholder: "Pickup Location (e.g., Baton Rouge Metropolitan Airport)"
      }),
      React.createElement(PlaceAutocomplete, {
        key: 'dropoff',
        value: dropoff,
        onChange: setDropoff,
        placeholder: "Dropoff Location (e.g., Louis Armstrong New Orleans International Airport)"
      }),
      React.createElement(WeekDatePicker, {
        key: 'date',
        value: date,
        onChange: setDate,
        bookings: bookings,
        currentWeekStart: currentWeekStart,
        setCurrentWeekStart: setCurrentWeekStart
      }),
      React.createElement(TimePicker, {
        key: 'time',
        value: time,
        onChange: setTime,
        date: date,
        bookings: bookings,
        durationSecs: distance.durationSecs
      })
    ];
    if (price.price > 0) {
      formElements.push(React.createElement('div', { key: 'estimate', className: 'estimate' },
        React.createElement('p', null, 'Total Distance: ', distance.miles, ' miles | RideSafe Fee: $', price.price, ' (Pickup ~', pickupDisplay, ')')
      ));
    }
    formElements.push(
      React.createElement(Map, { key: 'map', pickup: pickup, dropoff: dropoff }),
      React.createElement('div', { key: 'book-section', className: 'book-section' },
        React.createElement('img', {
          src: "https://lancewoolie.com/RideSafe/img/RIDESAFE TELSA BLUE CHECKsm.png",
          alt: "Logo",
          className: "small-logo"
        }),
        React.createElement('button', {
          type: 'button',
          onClick: handleBook,
          disabled: loading || price.price === 0,
          className: 'book-btn'
        }, loading ? 'Booking...' : 'Book Ride')
      )
    );
    var form = React.createElement('form', null, formElements);
    var container = React.createElement('div', { className: 'container' }, form);
    var appDiv = React.createElement('div', { className: 'app' }, container);
    return React.createElement(ErrorBoundary, null, header, appDiv);
  }

  // Render App
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
})();

// Global Google Callback
window.initRideSafe = function() {
  console.log('Google Maps API loaded - Autocomplete ready');
};
