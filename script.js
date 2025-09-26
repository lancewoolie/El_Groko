// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Simple form submission alert (replace with real backend like Formspree)
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thanks! Message sent. (In production, integrate with email service.)');
});
