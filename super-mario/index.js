var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
let character;
let firstFloor;
let secondFloor;
let finishObstacle;
let cursors;
let score = 0;
let life = 1;
let monster;

function preload ()
{
    this.load.image('box', './box.png');
}

function create () {
    this.add.rectangle().setStrokeStyle(0);

    const gap = 600;
    const floorWidth = 2500;
    const midPoint = 1250;

    const firstFloorRect = this.add.rectangle(0, 600, floorWidth, 600, 0x6666ff);
    const secondFloorRect = this.add.rectangle(floorWidth + gap, 600, floorWidth, 600, 0x6666ff);
    const characterRect = this.add.rectangle(-1100, 250, 50, 50, 0xfff000);
    const finishObstacleRect = this.add.rectangle(4100, 260, 25, 80, 0x49E20E);

    character = this.physics.add.existing(characterRect);
    firstFloor = this.physics.add.existing(firstFloorRect);
    secondFloor = this.physics.add.existing(secondFloorRect);
    finishObstacle = this.physics.add.existing(finishObstacleRect);

    firstFloor.body.setImmovable();
    firstFloor.body.allowGravity = false;

    secondFloor.body.setImmovable();
    secondFloor.body.allowGravity = false;

    finishObstacle.body.setImmovable();
    finishObstacle.body.allowGravity = false;

    character.body.setBounce(0.1);

    createSpecialObstacle.bind(this)(1400, 200);

    for (let i = 0, offset = 100; i < 10; i++, offset+=50) {
        createPlaceHolderObstacle.bind(this)(midPoint + offset, 200);
    }

    this.physics.add.collider(character, finishObstacle, function (_character, _obstacle) {
        if (_character.body.touching.right && _obstacle.body.touching.left) {
            console.log('YOU WIN')
        }
    })

    this.physics.add.collider(character, firstFloor);
    this.physics.add.collider(character, secondFloor);
    this.physics.add.collider(finishObstacle, firstFloor);

    createMonster.bind(this)(-1100);
    // createMonster.bind(this)(-900);

    cursors = this.input.keyboard.createCursorKeys();

    const mainCam = this.cameras.main;
    mainCam.setLerp(0.1);
    mainCam.startFollow(character);
    mainCam.setFollowOffset(-200)
    mainCam.setDeadzone(200, 200);

}

function update() {
    const charBody = character.body
    charBody.setDrag(50, 50)
    if(charBody.velocity.x > -200 && charBody.velocity.x < 200) {
        if(cursors.left.isDown ) {
            charBody.velocity.x -= 2;
        }
        if(cursors.right.isDown) {
            charBody.velocity.x += 2;
        }
    }
    if(cursors.up.isDown && charBody.touching.down) {
        charBody.setVelocityY(-250)
    }
}

function createNormalObstacle(x, y) {
    const normalObstacleRect = this.add.rectangle(x, y, 25, 25, 0x873600);
    const normalObstacle = this.physics.add.existing(normalObstacleRect);

    normalObstacle.body.setImmovable();
    normalObstacle.body.allowGravity = false;

    this.physics.add.collider(character, normalObstacle, function (_character, _obstacle) {
        if (_character.body.touching.up && _obstacle.body.touching.down) {
            _obstacle.destroy();
        }
    })
}

function createPlaceHolderObstacle(x, y) {
    const obstacleRect = this.add.rectangle(x, y, 25, 25, 0x43464B);
    const obstacle = this.physics.add.existing(obstacleRect);

    obstacle.body.setImmovable();
    obstacle.body.allowGravity = false;

    this.physics.add.collider(character, obstacle)
}

function createMonster(x, y) {
    const colours = [0xFADBD8, 0x784212];
    const randomPosition = Math.floor(Math.random() * x) + 400
    const randomColour = colours[Math.floor(Math.random() * colours.length)];
    const monstersRect = this.add.rectangle(-1100, 285, 35, 35, randomColour);
    console.log(randomPosition)
    monster = this.physics.add.existing(monstersRect);

    let dead = false;

    monster.body.setBounce(1.2);

    const gameThis = this;

    this.tweens.add({
        targets: monster,
        x: '+=100',
        duration: 2000,
        ease: 'Linear',
        yoyo: true,
        repeat: -1,
        delay: 1000,
        onComplete() {
            console.log('finished')
        }
    });

    this.physics.add.collider(monster, firstFloor);
    this.physics.add.collider(monster, character, function(_monster, _character) {
        if(_monster.body.touching.up && _character.body.touching.down && !dead) {
            dead = true;
            // Make character bounce up, so he can't score any more points from touching
            gameThis.tweens.add({
                targets: _monster,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 500,
                ease: 'Linear',
                onComplete() {
                    _monster.destroy();
                    score += 1000;
                }
            })

        }
    });
}

function createSpecialObstacle(x,y) {
    const specialObstacleRect = this.add.rectangle(x, y, 25, 25, 0xCE5528);
    const specialObstacle = this.physics.add.existing(specialObstacleRect);
    specialObstacle.body.setImmovable();
    specialObstacle.body.allowGravity = false;

    const bonuses = ['power-up', 'points'];
    const properties = [];
    const maxNumProperties = 5;
    const randomNumProperties = Math.floor(Math.random() * maxNumProperties) + 1;

    for(let i = 0; i < randomNumProperties; i++) {
        const randomBonusIndex = Math.floor(Math.random() * bonuses.length);
        const randomBonus = bonuses[randomBonusIndex];
        properties.push(randomBonus);
    }

    const gameThis = this;

    this.physics.add.collider(character, specialObstacle, function (_character, _obstacle) {
        if(properties.length > 0 && (_character.body.touching.up && _obstacle.body.touching.down)) {
            gameThis.tweens.add({
                targets: _obstacle,
                y: '-=10',
                duration: 1000,
                ease: function (t) {
                    return Math.pow(Math.sin(t * 3), 3);
                }
            });
            const pickedProperty = properties.shift();
            console.log(pickedProperty)
            handleSpecialProperties(pickedProperty, _character, gameThis)
        }
    })
}

function handleSpecialProperties(properties, character, game) {
    score += 100;
    switch (properties) {
        case 'points':
            score += 400;
            break;
        case 'power-up':
            // Increase size of character here
            game.tweens.add({
                targets: character,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 5000,
                ease: 'Cubic',
                yoyo: true
            });
            break;
    }
}
