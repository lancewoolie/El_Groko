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
                <li><a class="dropdown-item" href="https://orcd.co/a4glqme" target="_blank">Uber</a></li>
                <li><a class="dropdown-item" href="https://orcd.co/lancewoolietoodrunk" target="_blank">Too Drunk</a></li>
                <li><a class="dropdown-item" href="https://orcd.co/lancewoolieworstenemy" target="_blank">Worst Enemy</a></li>
                <li><a class="dropdown-item" href="music.html">Full Catalog</a></li>
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

  // Auto-Highlight Active Page (No Edits Needed)
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  const links = navHTML.match(/<a class="nav-link" href="[^"]*">([^<]*)<\/a>/g) || [];
  const activeLink = links.find(link => {
    const href = link.match(/href="([^"]*)"/)[1];
    return href.includes(currentPage) || (currentPage === 'index' && href === 'index.html');
  });
  if (activeLink) {
    navHTML = navHTML.replace(activeLink, activeLink.replace('nav-link', 'nav-link active'));
  }

  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) {
    placeholder.innerHTML = navHTML;
    // Re-init Bootstrap toggler for dynamic insert
    const myCollapse = document.getElementById('navbarNav');
    if (myCollapse) {
      const bsCollapse = new bootstrap.Collapse(myCollapse, {toggle: false});
    }
  }
}

// Load Nav on DOM Ready
document.addEventListener('DOMContentLoaded', generateNav);

// Existing Cowboy Hat & Form Code (Keep Below)
const cowboyHat = document.getElementById('cowboy-hat');
if (cowboyHat) {
  const surprises = [
    () => { cowboyHat.textContent = '🪕'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); },
    () => { cowboyHat.style.color = '#FFD700'; setTimeout(() => cowboyHat.style.color = 'white', 1000); },
    () => { alert('Twang! "Do it." – Lance'); },
    () => { cowboyHat.style.transform = 'rotate(360deg)'; setTimeout(() => cowboyHat.style.transform = 'rotate(0deg)', 500); },
    () => { cowboyHat.textContent = '🌵'; setTimeout(() => cowboyHat.textContent = '🤠', 1000); }
  ];
  cowboyHat.addEventListener('click', () => surprises[Math.floor(Math.random() * surprises.length)]());
}

const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Message sent—bayou reply incoming.');
  });
}
