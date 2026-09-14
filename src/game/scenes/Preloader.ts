import { Display, Scene } from "phaser";
import { BALL_DEFINITIONS, DROP_Y, GAME_HEIGHT, GAME_WIDTH } from "../config.ts";

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
        this.createContainerTexture3();

        // drop guide texture
        this.createDropGuideTexture();

        // danger zone texture
        this.createDangerZoneTexture();

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

            ctx.restore();

            const borderWidth = Math.max(2, Math.round(ballDef.radius * 0.07));
            ctx.beginPath();
            ctx.arc(ballDef.radius, ballDef.radius, ballDef.radius - borderWidth / 2, 0, Math.PI * 2);

            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = ballDef.level === 11 ? '#ffd700' : 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();

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
        g.strokeRoundedRect(30, 30, 420, 518, 2.5);
        // g.strokeRect(30, 30 , 420, 518);

        g.generateTexture('container', 480, 550);

        g.destroy();
    }

    createContainerTexture2() {
        const g = this.add.graphics();

        // 1. Inner Playfield Background (Creamy with 85% opacity so pitch grass subtly shows)
        g.fillStyle(0xfff8e7, 0.85);
        g.fillRect(60, 0, 360, 520);

        // 2. Left 3D Bevel Wall (Matching darker beige depth)
        g.fillStyle(0xf0deba, 0.95);
        g.beginPath();
        g.moveTo(60, 0);
        g.lineTo(30, 30);
        g.lineTo(30, 550);
        g.lineTo(60, 520);
        g.closePath();
        g.fillPath();

        // 3. Right 3D Bevel Wall
        g.beginPath();
        g.moveTo(450, 30);
        g.lineTo(420, 0);
        g.lineTo(420, 520);
        g.lineTo(450, 550);
        g.closePath();
        g.fillPath();

        // 4. Bottom Floor Bevel
        g.fillStyle(0xe5cda1, 1);
        g.beginPath();
        g.moveTo(60, 520);
        g.lineTo(420, 520);
        g.lineTo(450, 550);
        g.lineTo(30, 550);
        g.closePath();
        g.fillPath();

        // 5. Outer Frame / Border (Matching the card's rich brown outline)
        g.lineStyle(4, 0x8c6127, 1);
        g.strokeRoundedRect(30, 30, 420, 518, 4);

        // Bake into Phaser texture
        g.generateTexture('container', 480, 550);
        g.destroy();
    }

    createContainerTexture3() {
        const g = this.add.graphics();

        // 1. Crystal Clear Back Glass (12% opacity lets the stadium green shine through)
        g.fillStyle(0xffffff, 0.12);
        g.fillRect(60, 0, 360, 520);

        // 2. Left 3D Glass Wall Refraction (18% opacity)
        g.fillStyle(0xffffff, 0.18);
        g.beginPath();
        g.moveTo(60, 0);
        g.lineTo(30, 30);
        g.lineTo(30, 550);
        g.lineTo(60, 520);
        g.closePath();
        g.fillPath();

        // 3. Right 3D Glass Wall Refraction (18% opacity)
        g.beginPath();
        g.moveTo(450, 30);
        g.lineTo(420, 0);
        g.lineTo(420, 520);
        g.lineTo(450, 550);
        g.closePath();
        g.fillPath();

        // 4. Solid Glass Base / Floor (35% opacity shows floor thickness)
        g.fillStyle(0xffffff, 0.35);
        g.beginPath();
        g.moveTo(60, 520);
        g.lineTo(420, 520);
        g.lineTo(450, 550);
        g.lineTo(30, 550);
        g.closePath();
        g.fillPath();

        // 5. Polished Glass Frame & Highlight (Crisp semi-translucent white rim)
        g.lineStyle(3, 0xffffff, 0.85);
        g.strokeRoundedRect(30, 30, 420, 518, 6);

        // Bake into Phaser texture
        g.generateTexture('container', 480, 550);
        g.destroy();
    }

    createDropGuideTexture() {
        BALL_DEFINITIONS.forEach((ballDef) => {
            const color = Display.Color.HexStringToColor(ballDef.colors[0]).color;

            const g = this.add.graphics();

            const x = 4;
            const startY = DROP_Y + ballDef.radius;
            const endY = GAME_HEIGHT - 33;

            const dashLength = 6;
            const gapLength = 6;

            let currentY = startY;

            g.lineStyle(2, color, 0.45);
            while (currentY < endY) {
                g.beginPath();
                g.moveTo(x, currentY);
                g.lineTo(x, Math.min(currentY + dashLength, endY));
                g.strokePath();
                currentY += dashLength + gapLength;
            }

            g.fillStyle(color, 0.35);
            g.fillCircle(x, endY, 4);

            g.generateTexture(`drop-guide-${ballDef.code}`, 10, GAME_HEIGHT);

            g.destroy();
        });

    }

    createDangerZoneTexture() {
        const g = this.add.graphics();

        g.lineStyle(2, 0xff4d4d, 0.7); // Vibrant red color with 70% opacity

        const startX = 35;
        const endX = GAME_WIDTH - 35;
        const dashLength = 8;
        const gapLength = 6;

        let curX = startX;
        while (curX < endX) {
            g.beginPath();
            g.moveTo(curX, 2);
            g.lineTo(Math.min(curX + dashLength, endX), 2);
            g.strokePath();
            curX += dashLength + gapLength;
        }

        g.generateTexture('danger-zone', GAME_WIDTH, 4);

        g.destroy();
    }
}
