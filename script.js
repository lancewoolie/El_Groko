// Reusable Nav Generator (Edit Here for All Pages)
function generateNav() {
  let navHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img src="img/BEARDsmall.png" alt="Lance Woolie" style="height: 20px;"> Lance Woolie
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="music.html" role="button" data-bs-toggle="dropdown" aria-expanded="false">Music</a>
              <ul class="dropdown-menu horizontal-dropdown">
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/a4glqme" target="_blank">
                  <img src="img/Ubermenu.jpg" alt="Uber" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
                  Uber
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/lancewoolietoodrunk" target="_blank">
                  <img src="img/TooDrunkmenu.jpg" alt="Too Drunk" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
                  Too Drunk
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="https://orcd.co/lancewoolieworstenemy" target="_blank">
                  <img src="img/WorstEnemymenu.jpg" alt="Worst Enemy" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
                  Worst Enemy
                </a></li>
                <li><a class="dropdown-item d-flex align-items-center" href="music.html">
                  <img src="img/Fullcatalogmenu.jpg" alt="Full Catalog" class="dropdown-img me-2" style="width: 150px; height: 150px; object-fit: cover;">
                  Full Catalog
                </a></li>
              </ul>
            </li>
            <li class="nav-item"><a class="nav-link" href="events.html">Events</a></li>
            <li class="nav-item"><a class="nav-link" href="origins.html">Origins</a></li>
            <li class="nav-item"><a class="nav-link" href="https://lancewoolie.bandcamp.com/" target="_blank">Merch</a></li>
            <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;
  // Contact Form to Firestore
const form = document.getElementById('contact-form');
if (form && window.db) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Grab & validate
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Whoa, partner—fill it right (name, valid email, message).');
      return;
    }
    
    try {
      await addDoc(collection(window.db, 'contacts'), {
        name: name,
        email: email,
        message: message,
        timestamp: serverTimestamp()
      });
      alert('Twang! Message bayou-bound—thanks for the love.');
      form.reset(); // Clear fields
    } catch (error) {
      console.error('Submit snag:', error);
      alert('Gator got it—try again or holler direct.');
    }
  });
} else {
  console.warn('Form or DB not ready—check config.');
}

  // Auto-Highlight Active Page (Enhanced for Dropdowns)
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  // Find matching li and add 'active' class to it (works for simple and dropdown items)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = navHTML;
  const navItems = tempDiv.querySelectorAll('.nav-item a[href]');
  navItems.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = (currentPage === 'index' && href === 'index.html') || href.includes(currentPage);
    if (isActive) {
      link.closest('.nav-item').classList.add('active');
    }
  });
  navHTML = tempDiv.innerHTML;

  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) {
    placeholder.innerHTML = navHTML;
    // Re-init Bootstrap toggler for dynamic insert (dispose any existing to avoid conflicts)
    const myCollapse = document.getElementById('navbarNav');
    if (myCollapse) {
      const existingCollapse = bootstrap.Collapse.getInstance(myCollapse);
      if (existingCollapse) existingCollapse.dispose();
      new bootstrap.Collapse(myCollapse, { toggle: false });
    }
  } else {
    console.warn('Nav placeholder not found—check HTML for <div id="nav-placeholder"></div>');
  }
}

// Load Nav on DOM Ready
document.addEventListener('DOMContentLoaded', generateNav);

// Smooth Scroll for Internal Links
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

// Existing Cowboy Hat & Form Code (Enhanced with One More Surprise)
const cowboyHat = document.getElementById('cowboy-hat');
if (cowboyHat) {
  cowboyHat.textContent = '🤠'; // Fix initial icon
  const surprises = [
    () => { cowboyHat.textContent = '🪕'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
    () => { cowboyHat.style.color = '#FFD700'; setTimeout(() => cowboyHat.style.color = 'white', 1000); },
    () => { alert('Twang! "Do it." – Lance'); },
    () => { cowboyHat.style.transform = 'rotate(360deg)'; setTimeout(() => cowboyHat.style.transform = 'rotate(0deg)', 500); },
    () => { cowboyHat.textContent = '🌵'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
    () => { window.scrollTo({ top: 0, behavior: 'smooth' }); cowboyHat.textContent = '⬆️'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); } // New: Scroll to top
  ];
  cowboyHat.addEventListener('click', () => surprises[Math.floor(Math.random() * surprises.length)]());
}

const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Message sent—bayou reply incoming.');
    // Future: Add real submission logic here (e.g., EmailJS or Formspree)
  });
}
