const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game',
    backgroundColor: '#0a0a1f',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload: preload, create: create, update: update }
};

let game = new Phaser.Game(config);

let player, cursors, lasers, obstacles, score = 0;
let scoreText;

function preload() {
    // No external images - using built-in only
}

function create() {
    this.add.rectangle(600, 400, 1200, 800, 0x111133);

    // Player - Cyberbeast facing back to front
    player = this.add.text(600, 650, '[X]', { fontSize: '90px' }).setOrigin(0.5);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    player.body.setDrag(800);

    lasers = this.physics.add.group();
    obstacles = this.physics.add.group();

    scoreText = this.add.text(30, 20, 'SCORE: 000000', { fontSize: '36px', color: '#00ffff', stroke: '#ff00ff', strokeThickness: 8 });

    cursors = this.input.keyboard.createCursorKeys();

    this.time.addEvent({ delay: 2000, callback: spawnBot, callbackScope: this, loop: true });

    this.physics.add.collider(lasers, obstacles, hitBot, null, this);
    this.physics.add.collider(player, obstacles, () => this.scene.restart());

    this.input.on('pointermove', p => this.physics.moveTo(player, p.worldX, p.worldY, 520));
    this.input.on('pointerdown', () => shootNormal.call(this));
}

function update() {
    if (cursors.left.isDown) player.body.velocity.x = -400;
    if (cursors.right.isDown) player.body.velocity.x = 400;
    if (cursors.up.isDown) player.body.velocity.y = -400;
    if (cursors.down.isDown) player.body.velocity.y = 400;

    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))) shootNormal.call(this);

    lasers.getChildren().forEach(l => { if (l.y < -100) l.destroy(); });
    obstacles.getChildren().forEach(o => { if (o.y > 900) o.destroy(); });

    score += 0.5;
    scoreText.setText('SCORE: ' + String(Math.floor(score)).padStart(6, '0'));
}

function shootNormal() {
    const laser = lasers.create(player.x, player.y - 70, '__MISSING');
    laser.setVelocityY(-1100);
    laser.setScale(0.7);
    laser.setTint(0x00ffff);
}

function spawnBot() {
    const x = Phaser.Math.Between(180, 1020);
    const bot = obstacles.create(x, -60, '__MISSING');
    bot.setScale(1.2);
    bot.setVelocityY(85);

    const emoji = this.add.text(0, 0, Phaser.Math.RND.pick(['🚀','🪐','🌑','☄️']), { fontSize: '65px' }).setOrigin(0.5);
    bot.add(emoji);

    this.tweens.add({
        targets: bot,
        x: x + Phaser.Math.Between(-80, 80),
        duration: 3200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function hitBot(laser, bot) {
    laser.destroy();
    bot.destroy();

    this.add.particles(bot.x, bot.y, '__MISSING', {
        speed: { min: 80, max: 220 },
        scale: { start: 1, end: 0 },
        lifespan: 700,
        quantity: 20,
        tint: 0xff00ff
    });
}
