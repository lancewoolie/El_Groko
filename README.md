# Lance Woolie Official Website

![Lance Woolie Hero Banner](img/hero-bg.jpg) <!-- Replace with actual image path if available -->

Welcome to the official website for **Lance Woolie**, a Baton Rouge-born country music artist blending raw Southern storytelling with neotraditional vibes. This static site is built with HTML, Bootstrap 5 for responsiveness, and vanilla JS for interactivity. Hosted on GitHub Pages for easy updates.

## 🚀 Quick Start
1. **Clone the Repo:**
   ```
   git clone https://github.com/lancewoolie/newsitebase.git
   cd newsitebase
   ```
2. **Open Locally:** Use Live Server (VS Code extension) or any browser—open `index.html`.
3. **Deploy:** Push to the `main` branch; GitHub Pages auto-builds at https://lancewoolie.github.io/newsitebase/.
4. **Edit:** Use GitHub's web editor for quick changes (e.g., add images to `/img/`).

## 📋 Features
- **Responsive Design:** Mobile-first with Bootstrap—works on all devices.
- **Pages:**
  - **Home:** Hero intro, latest single ("Uber" 2025 with YouTube embed), recent events teaser.
  - **Music:** Catalog of releases (e.g., "Too Drunk" 2024, "Worst Enemy" 2023) with Spotify/Apple links and YouTube videos.
  - **Events:** Dynamic table of past live shows (from CSV data) with placeholders for event images.
  - **Origins:** In-depth biography covering early struggles, musical beginnings, career, and current endeavors.
  - **Merch:** Embedded Bandcamp shop (https://lancewoolie.bandcamp.com/) via iframe for seamless merch browsing/purchase.
  - **Contact:** Simple form (alert-based; integrate Formspree for real emails) + booking/social links.
- **Interactivity:** Smooth scrolling nav, form submission handler.
- **Assets:** `/img/` folder for headshots, logos, hero backgrounds (upload your files here).
- **SEO-Friendly:** Meta tags, semantic HTML, fast load times.

## 🗂️ File Structure
```
newsitebase/
├── index.html          # Home page
├── music.html          # Music & videos
├── events.html         # Past events table
├── origins.html        # Biography (renamed from bio.html)
├── merch.html          # Bandcamp embed
├── contact.html        # Contact form
├── styles.css          # Custom CSS (Bootstrap overrides)
├── script.js           # JS for nav, forms
├── events.csv          # Source data for events (optional; table is hardcoded)
└── img/                # Images (headshot.jpg, logo.png, etc.)
    └── .gitkeep        # Placeholder for empty folder
```

## 🔧 Tech Stack
- **HTML5/CSS3:** Core structure.
- **Bootstrap 5.3.3:** Grids, components, responsive utils (CDN-loaded).
- **Vanilla JS:** No frameworks—lightweight.
- **External Embeds:** YouTube iframes, Bandcamp iframe, Spotify/Apple links.
- **No Backend:** Static site; contact form needs external service (e.g., Formspree).

## 📈 Recent Changes (v1.0 - Sep 2025)
This repo was overhauled from an old book reader template to a full musician portfolio:
- **Full Site Rewrite:** Replaced placeholders with real content—home hero, music releases, bio/origins story.
- **Added Pages:** Music (Spotify/YouTube integration), Events (CSV-parsed table with image slots), Merch (Bandcamp iframe), kept/updated Contact.
- **Renamed Bio to Origins:** For thematic flair; updated all nav links.
- **Events Integration:** Hardcoded 20+ past shows from provided CSV (e.g., Court To Table gigs, TCMA awards); added image column placeholders.
- **UI Polish:** Country-red accents, Georgia font, shadow cards, fixed navbar across pages.
- **Merch Embed:** Responsive iframe for Bandcamp—loads shop without leaving site.
- **Home Updates:** Swapped "Upcoming" to "Recent Events" teaser (top 3 from CSV).
- **Bug Fixes:** Ensured lowercase filenames, consistent navbar, smooth scrolling.

## 🤝 Contributing
- Fork & PR for features (e.g., add future events via CSV update).
- Report issues: Broken embeds? Missing images? Open a ticket.
- Credits: Built with ❤️ by Grok (xAI) in collaboration with Lance Woolie.

## 📄 License
MIT License—feel free to fork for your own site!

---

*Last Updated: September 26, 2025*  
Questions? [Contact Lance](contact.html) or open an issue. Let's keep the music rolling! 🎸

---

To download this as a README.md file:
1. Copy the entire content above (from the title to the end).
2. Paste it into a text editor (e.g., Notepad on Windows, TextEdit on Mac, or VS Code).
3. Save the file as `README.md` (ensure the extension is .md, not .txt).
4. Upload it to your GitHub repo: Navigate to the repo > "Add file" > "Upload files" > Drag and drop the file > Commit to the main branch.

This will make it the official README for your site repo. If you need it in a different format (e.g., as a ZIP with all site files), let me know!
