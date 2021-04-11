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
let normalObstacle;
let specialObstacle;
let floor;
let cursors;
let score = 0;

function preload ()
{
    this.load.image('box', './box.png');
}

function create () {
    this.add.rectangle().setStrokeStyle(0);

    const floorRect = this.add.rectangle(400, 600, 800, 600, 0x6666ff);
    const characterRect = this.add.rectangle(25, 250, 50, 50, 0xfff000);
    const normalObstacleRect = this.add.rectangle(25, 200, 25, 25, 0x873600);
    const specialObstacleRect = this.add.rectangle(100, 200, 25, 25, 0xCE5528);

    character = this.physics.add.existing(characterRect)
    normalObstacle = this.physics.add.existing(normalObstacleRect)
    specialObstacle = this.physics.add.existing(specialObstacleRect)
    floor = this.physics.add.existing(floorRect)

    floor.body.setImmovable();
    floor.body.allowGravity = false;

    normalObstacle.body.setImmovable();
    normalObstacle.body.allowGravity = false;

    specialObstacle.body.setImmovable();
    specialObstacle.body.allowGravity = false;

    character.body.setBounce(0.5);
    character.body.setCollideWorldBounds(true);

    const gameThis = this;

    this.physics.add.collider(character, normalObstacle, function (_character, _obstacle) {
        if (_character.body.touching.up && _obstacle.body.touching.down) {
            _obstacle.destroy();
        }
    })

    this.physics.add.collider(character, specialObstacle, function (_character, _obstacle) {
        if(_character.body.touching.up && _obstacle.body.touching.down) {
            score += 100
            gameThis.tweens.add({
                targets: _obstacle,
                y: _obstacle.body.y - 10,
                duration: 1000,
                ease: function (t) {
                    return Math.pow(Math.sin(t * 3), 3);
                }
            });
        }
    })

    this.physics.add.collider(character, floor);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    const charBody = character.body
    if(cursors.left.isDown) {
        charBody.setVelocityX(-100)
    }
    if(cursors.right.isDown) {
        charBody.setVelocityX(100)
    }
    if(cursors.up.isDown) {
        charBody.setVelocityY(-100)
    }
    if(cursors.down.isDown) {
        charBody.setVelocityY(100)
    }
}

function createSpecialObstacle(character) {
    const specialObstacleRect = this.add.rectangle(100, 200, 25, 25, 0xCE5528);
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

    this.physics.add.collider(character, specialObstacle, function (_character, _obstacle) {
        if(_character.body.touching.up && _obstacle.body.touching.down) {
            gameThis.tweens.add({
                targets: _obstacle,
                y: _obstacle.body.y - 10,
                duration: 1000,
                ease: function (t) {
                    return Math.pow(Math.sin(t * 3), 3);
                }
            });

        }
    })
}

function handleSpecialProperties(properties, character) {
    switch (properties) {
        case 'points':
            score += 100;
            break;
        case 'power-up':
            // Increase size of character here
            character.body
    }
}
