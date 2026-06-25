import { Physics, Scene } from "phaser";

export class Ball extends Physics.Matter.Image {

    merged: boolean;

    level: number;

    radius: number;

    colors: string[];

    constructor(
        scene: Scene,
        x: number,
        y: number,
        textureKey: string,
        radius: number,
        level: number,
        colors: string[],
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

        this.merged = false;

        this.level = level;
        this.radius = radius;
        this.colors = colors;

        this.scene.add.existing(this);

        this.setDepth(0);
    }

}
