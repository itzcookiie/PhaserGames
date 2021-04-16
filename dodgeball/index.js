let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload ()
{

}

function create() {
    this.playerRect = this.add.rectangle(50, 50, 25, 25, 0x873600);
    this.player = this.physics.add.existing(this.playerRect);
    this.score = 0;
    this.currentTime = 0;
    this.text = this.add.text(0, 0, this.score);

    createBallShape.bind(this)()

    this.input.on('pointermove', (pointer) => {
        this.playerRect.x = pointer.x;
        this.playerRect.y = pointer.y;
    })

    // Have game start slow, so player can ease into game
    // E.g. it starts slow for 5 seconds
    // After 5 seconds, game plays as normal

    this.time.addEvent({
        delay: 500,
        loop: true,
        callback: createBallShape.bind(this)
    })

}

function update() {
    this.text.setText(this.score);
}

function createBallShape() {
    this.score++;

    const minRadius = 15;
    const maxRadius = 100;
    const radius = Math.floor(Math.random() * (maxRadius - minRadius + 1)) + minRadius;

    this.circle = this.add.circle(-radius, -radius, radius, 0xFF0000).setInteractive();

    // Potentially make balls have a starting velocity, so they come flying out rather than coming speeding up over time

    const minSpeed = 250;
    const speed = minSpeed / (radius / maxRadius);

    // Add 1 so when used below, randomWidth/Height so max range is 800 and not e.g. 799
    const widthRange = config.width + 1;
    const HeightRange = config.height + 1;

    let randomWidth;
    let randomHeight;

    // Refactor
    // Make object with props up, right, left, down
    // Get a prop value by random
    // Change height/width depending on prop value .e.g right means x = 800 and y = whatever
    const outsideMap = 0 - radius;
    if(Math.random() > 0.5) {
        randomWidth = Math.floor(Math.random() * widthRange);
        randomHeight = randomWidth === 0 || randomWidth === 800 ? Math.floor(Math.random() * HeightRange) : outsideMap;
    } else {
        randomHeight = Math.floor(Math.random() * HeightRange);
        randomWidth = randomHeight === 0 || randomHeight === 800 ? Math.floor(Math.random() * widthRange) : outsideMap;
    }

    this.circle.setPosition(randomWidth, randomHeight);

    this.ballPhysics = this.physics.add.existing(this.circle);

    this.physics.add.overlap(this.ballPhysics, this.player, function(_ball, _player) {
        console.log('Game over')
    })

    this.physics.accelerateToObject(this.ballPhysics, this.player, speed);
}
