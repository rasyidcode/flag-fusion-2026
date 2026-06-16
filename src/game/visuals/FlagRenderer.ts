import type { Scene } from "phaser";
import { GAME_WIDTH } from "../config";

export class FlagRenderer {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    createFlag(posX: number, posY: number, radius: number) {
        const diameter = radius * 2;
        const canvasTexture = this.scene.textures.createCanvas('flag-pt-txt', diameter, diameter);
        if (canvasTexture) {
            const ctx = canvasTexture?.context;

            if (ctx) {
                ctx.beginPath();
                ctx.arc(radius, radius, radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                const flagImage = this.scene.textures.get('flag-pt').getSourceImage() as HTMLImageElement;
                if (flagImage) {
                    ctx.drawImage(flagImage, 0, 0, flagImage.width, flagImage.height, 0, 0, diameter, diameter);
                }

                // ctx.strokeStyle = '#FF0000';
                // ctx.lineWidth = Math.max(2, Math.round(radius * 0.1));
                // ctx.beginPath();
                // ctx.arc(radius, radius, radius- ctx.lineWidth / 2, 0, Math.PI * 2);
                // ctx.stroke();

                canvasTexture.refresh();
            }
        }

        const flag = this.scene.add.image(posX, posY, 'flag-pt-txt');
        this.scene.matter.add.gameObject(flag, {
            shape: {
                type: 'circle',
                radius: radius
            },
        });

        return flag;
    }


}