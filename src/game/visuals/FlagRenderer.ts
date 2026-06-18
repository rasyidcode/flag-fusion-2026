import type { Scene } from "phaser";

export class FlagRenderer {
    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    createFlag(posX: number, posY: number, radius: number, code: string) {
        const flag = this.scene.add.image(posX, posY, `flag-circle-${code}`);
        this.scene.matter.add.gameObject(flag, {
            shape: {
                type: 'circle',
                radius: radius
            },
        });

        return flag;
    }
}
