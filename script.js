<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

  <title>Tesla Chimes - Lance Woolie’s Moon Saloon</title>

  <link href="https://fonts.googleapis.com/css2?family=Georgia&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="img/LanceWoolieHeadonly.png">

  <style>
    body {
      background: url('/img/moonsaloon/chimes-base-bg.jpg') center/cover no-repeat fixed !important;
      color: #E0E0E0;
      font-family: 'Georgia', serif;
      margin: 0;
      padding-top: 105px;
      padding-bottom: 80px;
    }

    /* MINI NAV */
    .mini-nav {
      position: fixed;
      top: 15px;
      left: 35px;
      z-index: 10000;
      background: rgba(10, 15, 35, 0.95);
      border: 2px solid #00ffcc;
      border-radius: 50px;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 0 40px rgba(0, 255, 204, 0.7);
      backdrop-filter: blur(14px);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-90px);
      transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .mini-nav.show { opacity: 1; visibility: visible; transform: translateY(0); }
    .mini-nav.bounce-out {
      transition: transform 0.68s cubic-bezier(0.68, -1.4, 0.32, 2.3) !important;
      transform: translateY(-240px) scale(0.35) rotate(32deg) !important;
    }
    .mini-nav img { width: 46px; height: 46px; cursor: pointer; transition: all 0.3s ease; }
    .mini-nav img:hover { transform: scale(1.18) translateY(-4px); }

    /* Layout - Force left lock */
    .main-content {
      display: flex;
      gap: 40px;
      max-width: 1380px;
      margin: 0 auto;
      padding: 0 40px;
      justify-content: flex-start;
    }

    /* Far Left - Skinny Tall Chimes */
    .chimes-column { width: 340px; flex-shrink: 0; }

    .chimes-block {
      background: rgba(8, 18, 40, 0.92);
      border: 3px solid #00ffcc;
      border-radius: 22px;
      padding: 1.6rem 1.8rem;
      box-shadow: 0 0 60px rgba(0, 255, 204, 0.5);
      backdrop-filter: blur(16px);
    }

    .chimes-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .chimes-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 0;
      border-bottom: 1px solid rgba(0, 255, 204, 0.25);
      font-size: 1.05rem;
    }
    .chimes-list li:last-child { border-bottom: none; }

    .play-btn, .download-btn {
      background: transparent;
      border: 2px solid #00ffcc;
      color: #00ffcc;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;
    }

    /* CENTER - MAIN MASS-DRIVER ROBO BLOCK */
    .robo-watch {
      flex: 1;
      max-width: 520px;
      background: rgba(0, 0, 0, 0.94);
      border: 3px solid #ffd700;
      border-radius: 26px;
      padding: 2.4rem 2.2rem;
      box-shadow: 0 0 90px rgba(255, 215, 0, 0.85);
      text-align: center;
    }

    .robo-watch h3 {
      color: #ffd700;
      text-shadow: 0 0 30px #ffd700;
      margin-bottom: 1.8rem;
      font-size: 1.75rem;
    }

    .stat-number { font-size: 3.4rem; font-weight: bold; margin: 8px 0; }

    /* Far Right - Referral */
    .referral-block {
      width: 340px;
      flex-shrink: 0;
      background: linear-gradient(135deg, #ff00aa, #ff3399);
      color: #ffffff;
      padding: 2.2rem 2rem;
      border-radius: 22px;
      text-align: center;
      box-shadow: 0 0 70px rgba(255, 0, 170, 0.75);
      cursor: pointer;
      transition: all 0.4s ease;
    }
    .referral-block:hover { transform: scale(1.08); box-shadow: 0 0 110px rgba(255, 0, 170, 0.9); }
  </style>
</head>
<body>

  <!-- MINI NAV -->
  <div class="mini-nav" id="mini-nav">
    <img src="/img/moonsaloon/saloon-doors-nav.png" class="doors" data-link="index.html" data-type="home" data-label="Moon Saloon">
    <img src="/img/moonsaloon/raccoon-subscribe-nav.png" data-link="onlyfans.html" data-type="dest" data-label="Only Fans Zone">
    <img src="/img/moonsaloon/holo-calendar-events-nav.png" data-link="events.html" data-type="dest" data-label="Events">
    <img src="/img/moonsaloon/music-video-neon-nav.png" data-link="music.html" data-type="dest" data-label="Music & Video">
    <img src="/img/moonsaloon/cowboy-hat-merch-nav.png" data-link="merch.html" data-type="dest" data-label="Merch">
    <img src="/img/moonsaloon/hourglass-origins-nav.png" data-link="origins.html" data-type="dest" data-label="Origins">
  </div>

  <div class="main-content">

    <!-- FAR LEFT - Skinny Tall Chimes -->
    <div class="chimes-column">
      <div class="chimes-block">
        <h2 style="color:#00ffcc; text-align:center; margin-bottom:18px;">🔊 TESLA LOCK CHIMES</h2>
        <p style="text-align:center; margin-bottom:22px; color:#ddd;">Click ▶️ to preview • Click ↓ to download.<br>Rename to <strong>lockchime.wav</strong>.</p>
        <ul id="chimes-list" class="chimes-list"></ul>
      </div>
    </div>

    <!-- CENTER - MASS DRIVER ROBO TAXI BLOCK -->
    <div class="robo-watch">
      <h3>LIVE ROBO TAXI WATCHER — APRIL 2026</h3>

      <div class="row text-center mb-4">
        <div class="col-4">
          <div class="stat-number" style="color:#00ffcc;">~400</div>
          <div>Total Fleet</div>
        </div>
        <div class="col-4">
          <div class="stat-number" style="color:#ff00aa;">~168</div>
          <div>Bay Area (Supervised)</div>
        </div>
        <div class="col-4">
          <div class="stat-number" style="color:#00ccff;">~72</div>
          <div>Austin (Unsupervised Testing)</div>
        </div>
      </div>

      <div style="font-size:1.75rem; color:#ffd700; margin:25px 0 10px;">
        TOTAL FSD MILES: <span style="color:#ffffff;">~8.5 Billion</span>
      </div>

      <div style="line-height:1.75; text-align:left; font-size:1.08rem; color:#ddd;">
        Small but rapidly scaling pilot fleet.<br>
        Mostly supervised operations today.<br>
        Unsupervised limited to select Austin zones.<br><br>
        Supercharger Network: ~80,000 stalls (98%+ Robotaxi-ready).<br>
        FSD data collection rate: millions of miles per day.<br>
        Next expansion targets: Phoenix, Miami, Chicago (pending approval).
      </div>

      <small style="display:block; margin-top:28px; opacity:0.75;">Community trackers + regulatory filings • April 2026</small>
    </div>

    <!-- FAR RIGHT - Referral -->
    <div class="referral-block" onclick="window.open('https://www.tesla.com/referral/lance680518','_blank')">
      <h3 style="margin:0 0 12px 0;">NEVER DRIVE AGAIN!</h3>
      <p style="margin:0 0 18px 0; font-size:1.12rem;">Get a Tesla with FSD today with this discount link</p>
      <button style="background:#000; color:#ff00aa; border:none; padding:14px 44px; border-radius:50px; font-weight:bold;">GET MY TESLA</button>
    </div>

  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="script.js"></script>

  <script>
    const chimes = [
      { name: "Crazy Arms Steel Solo", file: "sounds/LockChime.wav" },
      { name: "Star Trek Red Alert", file: "sounds/REDALERT.wav" },
      { name: "Lance Jesus in Sleep", file: "sounds/jesus.wav" },
      { name: "Multiple Ricochets", file: "sounds/multiple-ricochets.mp3" },
      { name: "Ricochet 1", file: "sounds/ricochet-1.mp3" },
      { name: "Ricochet 2", file: "sounds/ricochet-2.mp3" },
      { name: "Technology Meme", file: "sounds/technology.wav" },
      { name: "Wayputa – Call of the Gringo", file: "sounds/wayputa.wav" }
    ];

    function createChimeItem(chime) {
      const li = document.createElement('li');
      li.innerHTML = `
        <button onclick="playSound(this, '${chime.file}')" class="play-btn">▶</button>
        <span style="flex:1; color:#ddd;">${chime.name}</span>
        <a href="${chime.file}" download class="download-btn">↓</a>
      `;
      return li;
    }

    function playSound(btn, file) {
      const audio = new Audio(file);
      audio.volume = 0.6;
      audio.play();
      const original = btn.style.color;
      btn.style.color = '#ff00aa';
      setTimeout(() => btn.style.color = original, 1500);
    }

    document.addEventListener('DOMContentLoaded', () => {
      const list = document.getElementById('chimes-list');
      chimes.forEach(chime => list.appendChild(createChimeItem(chime)));

      const miniNav = document.getElementById('mini-nav');
      miniNav.classList.add('show');

      miniNav.addEventListener('click', e => {
        const img = e.target.closest('img');
        if (!img) return;
        const link = img.dataset.link;
        const type = img.dataset.type;
        if (!link) return;
        e.preventDefault();

        if (type === 'home') {
          miniNav.classList.add('bounce-out');
          setTimeout(() => location.href = link, 650);
        } else {
          location.href = link;
        }
      });
    });
  </script>
</body>
</html>
