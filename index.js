var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{

}

function create () {
    this.add.rectangle().setStrokeStyle(0);
    this.floor = this.add.rectangle(400, 600, 800, 600, 0x6666ff);
    this.character = this.add.rectangle(25, 275, 50, 50, 0xfff000);

    this.obstacle = this.add.rectangle(700, 200, 25, 25, 0x873600);

    this.input.keyboard.on('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
                // moveRight();
                this.character.x++;
                break;
            case 'ArrowLeft':
                // moveLeft();
                this.character.x--;
                break;
            case 'ArrowUp':
                // moveUp();
        }
    })
}
