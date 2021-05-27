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
const colours = {
    red: [255,0,0],
    orange: [255,165,0],
    lightning: [245, 250, 255]
}

let balls = [];

function preload ()
{
    this.load.image('danger', './exclamation-point-removebg.png')
    this.load.audio('danger', './warning.mp3')
}

function create() {
    this.cameras.main.setBackgroundColor('rgba(255, 200, 0, 0.5)');
    this.warningSound = this.sound.add('danger', {
        volume: 0.1,
    })

    this.playerRect = this.add.rectangle(50, 50, 25, 25, 0x873600);
    this.player = this.physics.add.existing(this.playerRect);
    this.score = 0;
    this.currentTime = 0;
    this.timeText = this.add.text(0, 0, this.score);

    createBallShape.bind(this)()

    this.input.on('pointermove', (pointer) => {
        this.playerRect.x = pointer.x;
        this.playerRect.y = pointer.y;
    })

    // Have game start slow, so player can ease into game
    // E.g. it starts slow for 5 seconds
    // After 5 seconds, game plays as normal

    const startTime = Date.now();

    this.ballSpawner = this.time.addEvent({
        delay: 500,
        loop: true,
        callbackScope: this,
        callback: createBallShape
    })
}

function update() {
    const formattedTime = this.time.now.toFixed(3) / 1000;
    this.timeText.setText(formattedTime);

    balls.forEach((data, index, array) => {
        if(!data.onMap && data.physics.x >= data.radius && data.physics.x <= 800 - data.radius && data.physics.y >= data.radius && data.physics.y <= 600 - data.radius ) {
            data.onMap = true;
        }
        if(data.onMap && (data.physics.x <= -data.radius || data.physics.x >= 800 + data.radius || data.physics.y <= -data.radius || data.physics.y >= 600 + data.radius)) {
            data.physics.destroy();
            array.splice(index, 1);
        } else {
            this.physics.accelerateToObject(data.physics, data.player, data.speed)
        }
    })
}

function createBallShape() {
    this.score++;

    const minRadius = 15;
    const maxRadius = 100;
    const midRadius = (minRadius + maxRadius) / 2;
    const radius = Math.floor(Math.random() * (maxRadius - minRadius + 1)) + minRadius;

    // Potentially make balls have a starting velocity, so they come flying out rather than coming speeding up over time

    const minSpeed = 250;
    const speed = minSpeed / (radius / maxRadius);

    // Add 1 so when used below, randomX/Height so max range is 800 and not e.g. 799
    const widthRange = config.width;
    const heightRange = config.height;

    let randomX;
    let randomY;

    // Refactor
    // Make object with props up, right, left, down
    // Get a prop value by random
    // Change height/width depending on prop value .e.g right means x = 800 and y = whatever
    if(Math.random() > 0.5) {
        randomX = Math.floor(Math.random() * (widthRange + 1));
        randomY = randomX === 0 || randomX === 800 ? Math.floor(Math.random() * (heightRange + 1)) : -radius;
    } else {
        randomY = Math.floor(Math.random() * (heightRange + 1));
        randomX = randomY === 0 || randomY === 800 ? Math.floor(Math.random() * (widthRange + 1)) : -radius;
    }

    let colourRange = {};
    if(radius === minRadius) colourRange.singleColour = colours.lightning;
    else if(radius === maxRadius) colourRange.singleColour = colours.red;
    else if(radius < midRadius) {
        colourRange.startColour = colours.lightning;
        colourRange.endColour = colours.orange;
    } else {
        colourRange.startColour = colours.orange;
        colourRange.endColour = colours.red;
    }

    const percentageDiffRadius = (radius - minRadius) / (maxRadius - minRadius);

    let hexColour;
    if(colourRange.singleColour) {
        hexColour = RGBToHex(...colourRange.singleColour);
    } else {
        const newRGBColour = colourRange.startColour.map((rgbValue, i) => {
            const maxRGBValue = colourRange.endColour[i];
            const RGBDiff = maxRGBValue - rgbValue;
            const percentageDiffRGB = RGBDiff / 2;
            return Math.floor(rgbValue + percentageDiffRGB);
        });
        hexColour = RGBToHex(...newRGBColour);
    }

    this.circle = this.add.circle(randomX, randomY, radius, hexColour).setInteractive();

    this.ballPhysics = this.physics.add.existing(this.circle);

    this.physics.add.overlap(this.ballPhysics, this.player, function(_ball, _player) {
        console.log('Game over')
    })

    if(percentageDiffRadius < 0.15) {
        // Make danger icon spawn and be visible on map
        let x = this.circle.x;
        let y = this.circle.y;
        let dangerIcon = this.add.image(x, y, 'danger').setScale(0.2);
        const { displayHeight , displayWidth  } = dangerIcon;
        if(x > widthRange - displayWidth) {
            x = widthRange - displayWidth;
        } else if(x < displayWidth) {
            x = displayWidth
        }

        if(y > heightRange - displayHeight) {
            y = heightRange - displayHeight;
        } else if(y < displayHeight) {
            y = displayHeight
        }

        dangerIcon.setDisplayOrigin(x, y);
        this.warningSound.play()
        this.ballSpawner = this.time.addEvent({
            delay: 1000,
            callbackScope: this,
            callback: function(ball) {
                dangerIcon.destroy();
                this.physics.accelerateToObject(this.ballPhysics, this.player, speed);
            },
            loop: false
        })
    } else {
        balls.push({
            onMap: false,
            offMap: false,
            physics: this.ballPhysics,
            player: this.player,
            speed,
            radius
        })
    }

}

function updateTime(startTime) {
    const timeNow = Date.now();
    const timeDiff = (timeNow - startTime) / 1000;
}

function RGBToHex(r,g,b) {
    r = Number(r).toString(16);
    g = Number(g).toString(16);
    b = Number(b).toString(16);

    if (r.length === 1) r = "0" + r;
    if (g.length === 1) g = "0" + g;
    if (b.length === 1) b = "0" + b;


    return "0x" + r + g + b;
}

function createColourRange(startColour, endColour, min, max) {

}
