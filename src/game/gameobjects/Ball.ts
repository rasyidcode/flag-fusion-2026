import { Physics, Scene } from "phaser";

export class Ball extends Physics.Matter.Image {

    level: number;

    radius: number;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        textureKey: string,
        radius: number,
        level: number,
    ) {
        super(scene.matter.world, x, y, textureKey, undefined, {
            shape: {
                type: 'circle',
                radius: radius
            },
            restitution: 0.25,
            friction: 0.02,
            frictionAir: 0.01,
            frictionStatic: 0.05,
        });

        this.level = level;
        this.radius = radius;

        this.scene.add.existing(this);
    }

}
