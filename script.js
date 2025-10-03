// Reusable Nav Generator (Unchanged)
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
            <li class="nav-item"><a class="nav-link" href="merch.html">Merch</a></li>
            <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;

  // Auto-Highlight Active Page (Enhanced for Dropdowns)
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
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
    const myCollapse = document.getElementById('navbarNav');
    if (myCollapse) {
      const existingCollapse = bootstrap.Collapse.getInstance(myCollapse);
      if (existingCollapse) existingCollapse.dispose();
      new bootstrap.Collapse(myCollapse, { toggle: false });
    }
  } else {
    console.warn('Nav placeholder not found');
  }
}

// Reusable Footer Generator (Updated with fixed Firebase references, injected CSS for newsletter, and corrected social icon URLs)
function generateFooter() {
  // Inject CSS for footer signup
  let style = document.getElementById('footer-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'footer-styles';
    style.textContent = `
      .footer-signup {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: center;
      }
      .footer-signup .form-control {
        width: 250px;
        background-color: #001f3f;
        border: 1px solid #0074D9;
        color: #FFFFFF;
        padding: 5px 10px;
        font-size: 14px;
      }
      .footer-signup .form-control:focus {
        background-color: #001f3f;
        border-color: #FFD700;
        color: #FFFFFF;
        box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.25);
      }
      .footer-signup .btn-success {
        padding: 5px 15px;
        font-size: 14px;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  const footerHTML = `
    <footer class="footer bg-dark text-light py-4" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 1001; border-top: 1px solid #0074D9;">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-4">
            <a href="contact.html" class="text-light">Contact</a>
          </div>
          <div class="col-md-4 text-center">
            <div class="cowboy-hat-icon mb-2" id="cowboy-hat">🤠</div>
            <p class="mb-0 small">&copy; 2025 Lance Woolie. All rights reserved.</p>
          </div>
          <div class="col-md-4 text-end">
            <a href="https://x.com/LanceWoolie" target="_blank" class="me-3" title="X (Twitter)" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/x/ffffff/24.svg" alt="X" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.facebook.com/lancewoolie/" target="_blank" class="me-3" title="Facebook" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/facebook/ffffff/24.svg" alt="Facebook" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.tiktok.com/@lancewoolie" target="_blank" class="me-3" title="TikTok" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/tiktok/ffffff/24.svg" alt="TikTok" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.youtube.com/@LanceWoolie" target="_blank" class="me-3" title="YouTube" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px;">
              <img src="https://cdn.simpleicons.org/youtube/ffffff/24.svg" alt="YouTube" style="width: 24px; height: 24px;">
            </a>
            <a href="https://www.instagram.com/lancewoolie/" target="_blank" title="Instagram" style="display: inline-block; width: 24px; height: 24px;">
              <img src="https://cdn.simpleicons.org/instagram/ffffff/24.svg" alt="Instagram" style="width: 24px; height: 24px;">
            </a>
          </div>
        </div>
        <!-- Newsletter Signup (Global, but hidden on non-index pages if needed) -->
        <div class="row mt-3" id="newsletter-row" style="display: none;">
          <div class="col-12">
            <form id="newsletterForm" class="footer-signup">
              <input type="email" class="form-control" placeholder="Email for updates" required>
              <button type="submit" class="btn btn-success">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  `;

  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.innerHTML = footerHTML;
    // Re-init cowboy hat after insert
    const cowboyHat = document.getElementById('cowboy-hat');
    if (cowboyHat) {
      cowboyHat.textContent = '🤠';
      const surprises = [
        () => { cowboyHat.textContent = '🪕'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
        () => { cowboyHat.style.color = '#FFD700'; setTimeout(() => cowboyHat.style.color = 'white', 1000); },
        () => { alert('Twang! "Do it." – Lance'); },
        () => { cowboyHat.style.transform = 'rotate(360deg)'; setTimeout(() => cowboyHat.style.transform = 'rotate(0deg)', 500); },
        () => { cowboyHat.textContent = '🌵'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
        () => { window.scrollTo({ top: 0, behavior: 'smooth' }); cowboyHat.textContent = '⬆️'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); }
      ];
      cowboyHat.addEventListener('click', () => surprises[Math.floor(Math.random() * surprises.length)]());
    }
    // Show newsletter on index page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      const newsletterRow = document.getElementById('newsletter-row');
      if (newsletterRow) newsletterRow.style.display = 'block';
      // Newsletter handler (fixed Firebase references)
      const newsletterForm = document.getElementById('newsletterForm');
      if (newsletterForm && window.db) {
        newsletterForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = newsletterForm.querySelector('input[type="email"]').value.trim();
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Valid email required.');
            return;
          }
          try {
            await window.addDoc(window.collection(window.db, 'contacts'), {
              email, type: 'newsletter', timestamp: window.serverTimestamp()
            });
            alert('Signed up—exclusive twang incoming!');
            newsletterForm.reset();
          } catch (error) {
            alert('Signup snag—try again.');
            console.error(error);
          }
        });
      }
    }
  } else {
    console.warn('Footer placeholder not found—add <div id="footer-placeholder"></div> before </body>');
  }
}

// Load Nav & Footer on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  generateNav();
  generateFooter();

  // Smooth Scroll for Internal Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Contact Form Handler (Firebase - If on contact page, fixed references)
  const form = document.getElementById('contact-form');
  if (form && window.db) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Whoa, partner—fill it right.');
        return;
      }
      try {
        await window.addDoc(window.collection(window.db, 'contacts'), {
          name, email, message, type: 'general', timestamp: window.serverTimestamp()
        });
        alert('Message sent—bayou reply incoming.');
        form.reset();
      } catch (error) {
        alert('Send failed—try again.');
        console.error(error);
      }
    });
  }

  // Newsletter Form (If on contact page, fixed references)
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm && window.db) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Valid email required.');
        return;
      }
      try {
        await window.addDoc(window.collection(window.db, 'contacts'), {
          email, type: 'newsletter', timestamp: window.serverTimestamp()
        });
        alert('Signed up—exclusive twang incoming!');
        newsletterForm.reset();
      } catch (error) {
        alert('Signup snag—try again.');
        console.error(error);
      }
    });
  }
});
