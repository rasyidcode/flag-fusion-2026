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
        });

        this.flag = flag;
        this.radius = radius;

        this.scene.add.existing(this);
        this.setStatic(true);
    }

    drop() {
        this.setStatic(false);
    }

}
