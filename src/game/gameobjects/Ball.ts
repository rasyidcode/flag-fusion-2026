import { Physics, Scene } from "phaser";

export class Ball extends Physics.Matter.Image {

    constructor(scene: Scene, x: number, y: number, textureKey: string, radius: number) {
        super(scene.matter.world, x, y, textureKey, undefined, {
            shape: {
                type: 'circle',
                radius: radius
            },
        });

        this.setStatic(true);
    }


}
