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
    const floor = this.add.rectangle(400, 600, 800, 600, 0x6666ff);
    const character = this.add.rectangle(25, 275, 50, 50, 0xfff000);

    this.input.keyboard.on('keydown', (e) => {
        console.log(e.key)
    })

}
