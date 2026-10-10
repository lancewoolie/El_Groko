// Email designs sent through one EmailJS template: Subject {{subject}}, Content {{{html}}}.
(function () {
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function moonSaloonWelcome(name, message) {
    const n = esc(name), m = esc(message);
    return `<div style="font-family: Georgia, serif; background: #0a0f23; color: #E0E0E0; max-width: 620px; margin: 0 auto; border: 4px solid #00ffcc; border-radius: 28px; overflow: hidden; box-shadow: 0 0 80px rgba(0, 255, 204, 0.6);">
  <div style="background: linear-gradient(90deg, #00ffcc, #ff00aa); padding: 25px 20px; text-align: center;">
    <img src="https://raw.githubusercontent.com/lancewoolie/El_Groko/main/img/LanceWoolieHeadonly.png" alt="Lance Woolie" style="height: 68px; border-radius: 50%;">
    <h1 style="margin: 12px 0 0 0; font-size: 29px; color: #0a0f23; text-shadow: 0 0 20px #fff;">Welcome to the Saloon, ${n}</h1>
  </div>
  <div style="padding: 35px 30px; background: rgba(8, 18, 40, 0.95);">
    <p style="font-size: 18px; line-height: 1.6;">Howdy, <strong>${n}</strong> —</p>
    <p>${m}</p>
    <p style="color: #00ffcc; font-weight: bold;">While you wait for a real reply from the bayou, here's what's hot off the still:</p>
    <div style="background: rgba(0,0,0,0.6); border: 2px solid #00ffcc; border-radius: 16px; padding: 20px; margin: 25px 0;">
      <p><strong>Latest Release:</strong> "Crazy Arms" feat. Brent Mason &amp; Scotty Sanders</p>
      <a href="https://www.youtube.com/watch?v=1Q82uscHIME" target="_blank" style="text-decoration: none;"><img src="https://img.youtube.com/vi/1Q82uscHIME/maxresdefault.jpg" alt="Crazy Arms - Lance Woolie" style="width: 100%; border-radius: 12px; margin: 15px 0 10px 0; border: 3px solid #00ffcc;"></a>
      <p style="text-align: center; margin-top: 5px;"><a href="https://www.youtube.com/watch?v=1Q82uscHIME" target="_blank" style="color: #00ffcc; font-weight: bold; text-decoration: underline;">▶ Watch "Crazy Arms" Music Video</a></p>
      <p style="margin-top: 20px;"><strong>Pre-Order the Full Album on Vinyl:</strong><br><a href="https://lancewoolie.bandcamp.com/merch/moon-saloon-full-vinyl-pre-order" target="_blank" style="color: #ffd700; font-weight: bold; text-decoration: underline; font-size: 17px;">→ Moon Saloon Vinyl Pre-Order (Limited Edition)</a></p>
    </div>
    <div style="background: rgba(255, 170, 0, 0.1); border: 2px dashed #ffaa00; border-radius: 16px; padding: 24px; text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; color: #ffd700; margin-bottom: 16px;">🔥 <strong>Tell 3 Friends</strong> about the Moon Saloon</p>
      <a href="https://www.facebook.com/sharer/sharer.php?u=https://lancewoolie.com" target="_blank" style="display:inline-block; margin:6px; background:#1877f2; color:white; padding:13px 24px; border-radius:50px; text-decoration:none; font-weight:bold;">Facebook</a>
      <a href="https://twitter.com/intent/tweet?url=https://lancewoolie.com&text=Just hit the Moon Saloon — real bayou country" target="_blank" style="display:inline-block; margin:6px; background:#1da1f2; color:white; padding:13px 24px; border-radius:50px; text-decoration:none; font-weight:bold;">X / Twitter</a>
    </div>
    <p style="text-align: center; font-style: italic; color: #a0c0ff; margin-top: 30px;">We'll get back to you soon with a real transmission from the Saloon.<br>Stay wild out there.</p>
  </div>
  <div style="background: #1a2338; padding: 22px; text-align: center; font-size: 14px; border-top: 3px solid #00ffcc;">
    <p style="margin: 0;">Questions? Hit us at <a href="mailto:lancewoolie@gmail.com" style="color: #00ffcc;">lancewoolie@gmail.com</a></p>
  </div>
</div>`;
  }

  function starbaseWelcome(name) {
    const n = esc(name);
    return `<div style="font-family: Arial, Helvetica, sans-serif; background:#05070f; color:#E8E8E8; max-width:620px; margin:0 auto; border:3px solid #00ffcc; border-radius:20px; overflow:hidden;">
  <img src="https://lancewoolie.com/img/starbase/starbase-drone.jpg" alt="Starbase, Louisiana v .1" style="display:block; width:100%; height:auto;">
  <div style="padding:26px 28px 6px; text-align:center;">
    <div style="display:inline-block; background:#ffd700; color:#05070f; font-weight:900; letter-spacing:3px; font-size:13px; padding:7px 16px; border-radius:4px;">ACCESS GRANTED</div>
    <h1 style="margin:16px 0 6px; font-size:32px; line-height:1.05; color:#fff; font-weight:900;">${n}, you're on the crew.</h1>
    <p style="margin:0; color:#00ffcc; font-weight:bold; letter-spacing:2px; font-size:13px;">STARBASE, LOUISIANA v .1</p>
  </div>
  <div style="padding:16px 30px 26px; font-size:16px; line-height:1.65;">
    <p>Full stack on the pad. Real launches. Real catches. A real-scale open world built in Unreal Engine 5.8.3, and you're one of the first in.</p>
    <div style="background:#0b1430; border-left:4px solid #00ffcc; padding:16px 18px; margin:22px 0;">
      <p style="margin:0 0 8px; color:#ffd700; font-weight:900; letter-spacing:2px;">YOUR ALPHA CLEARANCE</p>
      <p style="margin:0 0 6px;">🏗️ Build it. 🚛 Haul it. 🛡️ Guard it. 🛰️ Launch it. 🎥 Shoot it.</p>
      <p style="margin:0 0 6px;">👥 Squad up with friends over voice and text.</p>
      <p style="margin:0;">⏪ Temporal rewind: watch the base rise from bare marsh.</p>
    </div>
    <p style="text-align:center; font-weight:900; color:#ffd700; font-size:17px; margin:22px 0 4px;">100% FREE ALPHA. ALPHA CREW GETS GRANDFATHERED REWARDS AT BETA.</p>
    <p style="text-align:center; font-size:20px; color:#00ffcc; font-weight:900; margin:24px 0 6px;">Stand by. Your mission briefing is inbound. 📡</p>
    <p style="text-align:center; color:#aaa; margin:14px 0 0;">See you on the pad,<br><strong style="color:#fff;">Lance Woolie</strong><br>Starbase, Louisiana v .1</p>
  </div>
  <div style="background:#0b1430; padding:14px; text-align:center; font-size:12px; color:#777;">Starbase, Louisiana v .1 is a fan-made digital game, not affiliated with SpaceX.</div>
</div>`;
  }

  window.EmailDesigns = { moonSaloonWelcome, starbaseWelcome };
})();
