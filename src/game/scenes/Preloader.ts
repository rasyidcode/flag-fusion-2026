import {Scene} from "phaser";
import {BALL_DEFINITIONS} from "../config.ts";
import {BALL_DEFINITION_FIT} from "../types.ts";

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.setPath('assets');

        // load flag images
        BALL_DEFINITIONS.forEach((ballDef) => {
            this.load.image(`flag-${ballDef.code}`, `flags/${ballDef.code}.png`);
        })
    }

    create() {
        // create canvas texture for each flags
        this.createBallTexture();

        // container texture
        this.createContainerTexture();

        this.scene.start('Game');
    }

    createBallTexture() {
        BALL_DEFINITIONS.forEach((ballDef) => {
            const diameter = ballDef.radius * 2;
            const key = `ball-${ballDef.code}`;

            const canvasTexture = this.textures.createCanvas(key, diameter, diameter);
            if (!canvasTexture) return;

            const ctx = canvasTexture?.context;
            if (!ctx) return;

            // Create circular clipping region
            ctx.beginPath();
            ctx.arc(ballDef.radius, ballDef.radius, ballDef.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const flagImage = this.textures.get(`flag-${ballDef.code}`).getSourceImage() as HTMLImageElement;
            if (flagImage) {
                if (ballDef.fit === BALL_DEFINITION_FIT.NORMAL) {
                    ctx.drawImage(flagImage, 0, 0, flagImage.width, flagImage.height, 0, 0, diameter, diameter);
                } else if (ballDef.fit === BALL_DEFINITION_FIT.COVER) {
                    // object-fit: cover
                    const scale = Math.max(
                        diameter / flagImage.width,
                        diameter / flagImage.height
                    );

                    const width = flagImage.width * scale;
                    const height = flagImage.height * scale;

                    const x = (diameter - width) / 2;
                    const y = (diameter - height) / 2;

                    ctx.drawImage(flagImage, x, y, width, height);
                }

            }

            canvasTexture.refresh();
        });
    }

    createContainerTexture() {
        const g = this.add.graphics();

        g.fillStyle(0xffffff, 0.7);
        g.fillRect(60, 0, 360, 520);

        g.fillStyle(0xffffff, 0.6);
        g.beginPath();
        g.moveTo(60, 0);
        g.lineTo(30, 30);
        g.lineTo(30, 550);
        g.lineTo(60, 520);
        g.closePath();
        g.fillPath();

        g.beginPath();
        g.moveTo(450, 30);
        g.lineTo(420, 0);
        g.lineTo(420, 520);
        g.lineTo(450, 550);
        g.closePath();
        g.fillPath();

        g.fillStyle(0xffffff, 0.8);
        g.beginPath();
        g.moveTo(60, 520);
        g.lineTo(420, 520);
        g.lineTo(450, 550);
        g.lineTo(30, 550);
        g.closePath();
        g.fillPath()

        g.lineStyle(4, 0xffffff, 1);
        g.strokeRoundedRect(30, 30 , 420, 518, 2.5);
        // g.strokeRect(30, 30 , 420, 518);

        g.generateTexture('container', 480, 550);

        g.destroy();
    }
}