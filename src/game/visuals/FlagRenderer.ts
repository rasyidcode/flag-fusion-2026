import type { Scene } from "phaser";
import { FLAGS } from "../config";
import { getRadiusByRank } from "../utils";

export class FlagRenderer {
    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initAllCircularTexture();
    }

    initAllCircularTexture() {
        FLAGS.forEach((flag) => {
            const radius = getRadiusByRank(flag.rank);
            const diameter = radius * 2;
            const key = `flag-circle-${flag.code}`;
            const canvasTexture = this.scene.textures.createCanvas(key, diameter, diameter);
            if (canvasTexture) {
                const ctx = canvasTexture?.context;

                if (ctx) {
                    ctx.beginPath();
                    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();

                    const flagImage = this.scene.textures.get(flag.code).getSourceImage() as HTMLImageElement;
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
        });
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
