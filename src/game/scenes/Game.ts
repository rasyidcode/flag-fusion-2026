import { Scene } from "phaser";

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');

        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create() {
        this.add.image(512, 384, 'background');
        this.add.image(512, 350, 'logo').setDepth(100);
        this.add.text(512, 490, 'Hello, Phaser!', {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            align: 'center'
        })
    }

}