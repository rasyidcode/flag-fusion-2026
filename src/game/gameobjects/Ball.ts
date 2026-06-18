import { Physics, Scene } from "phaser";

export class Ball extends Physics.Matter.Image {
    constructor(scene: Scene, x: number, y: number, textureKey: string) {
        super(scene.matter.world, x, y, textureKey);
    }


}
