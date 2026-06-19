import { Physics, Scene } from "phaser";
import type { Flag } from "../types";

export class Ball extends Physics.Matter.Image {

    flag: Flag;

    radius: number;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        textureKey: string,
        radius: number,
        flag: Flag
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
            density: 0.005 * flag.rank,
        });

        this.flag = flag;
        this.radius = radius;

        this.scene.add.existing(this);
    }

}
