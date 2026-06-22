import { Input, Scene, Physics, Math as PhaserMath, GameObjects, Display, Geom } from "phaser";
import { DROP_Y, FLAGS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { getRadiusByRank } from "../utils";
import { Ball } from "../gameobjects/Ball";
import type { Flag } from "../types";

export class Game extends Scene {

    currentBall: GameObjects.Image | null = null;

    canDrop: boolean = true;

    constructor() {
        super('Game');
    }

    init() {
        this.currentBall = null;
        this.canDrop = true;
    }

    preload() {
        this.load.setPath('assets');

        // load all flags image
        FLAGS.forEach((flag) => {
            this.load.image(flag.code, `flags/${flag.code}.png`);
        });
    }

    create() {
        this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 32, true, true, true, true);        // Visual stadium border bounds

        // const borderGraphics = this.add.graphics();
        // borderGraphics.lineStyle(4, 0x4f46e5, 0.4); // Neon blue/purple border
        // borderGraphics.strokeRect(20, 120, 440, 560);

        // Draw the floor line visually
        // borderGraphics.lineStyle(4, 0x10b981, 0.8); // Green pitch outline line at floor
        // borderGraphics.strokeLineShape(new Geom.Line(20, 680, 460, 680));

        // this.createContainer();
        // this.createContainer2(30, 150, GAME_WIDTH - 60, 550);
        this.drawGlassContainer();

        this.initBallTexture();
        this.generateParticleTexture();

        this.spawnBall();

        // move the ball based on pointer.x position
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            if (!this.currentBall) return;

            const radius = this.currentBall.getData('radius') as number;
            const clampedX = PhaserMath.Clamp(
                pointer.x,
                radius,
                GAME_WIDTH - radius
            )
            this.currentBall.setX(clampedX);
        });

        // drop the ball
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            if (!this.currentBall || !this.canDrop) return;

            const x = this.currentBall.x;
            const y = this.currentBall.y;
            const flag = this.currentBall.getData('flag') as Flag;
            const radius = this.currentBall.getData('radius') as number;

            this.currentBall.destroy();
            this.currentBall = null;
            this.canDrop = false;

            new Ball(this, x, y, `flag-circle-${flag.code}`, radius, flag);

            this.time.delayedCall(550, () => {
                this.spawnBall(pointer.x);
                this.canDrop = true;
            });
        });

        // check collision between balls
        this.matter.world.on('collisionstart', (event: Physics.Matter.Events.CollisionStartEvent) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA.gameObject;
                const b = pair.bodyB.gameObject;

                if (a instanceof Ball && b instanceof Ball) {
                    if (a.flag.rank === b.flag.rank) {
                        this.mergeBalls(a, b);
                    }
                }
            }
        });

    }

    generateParticleTexture() {
        const size = 12;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(6, 6, 6, 0, Math.PI * 2);
            ctx.fill();
            this.textures.addCanvas('particle', canvas);
        }
    }

    initBallTexture() {
        // create canvas circle texture for each flags
        FLAGS.forEach((flag) => {
            const radius = getRadiusByRank(flag.rank);
            const diameter = radius * 2;
            const key = `flag-circle-${flag.code}`;
            const canvasTexture = this.textures.createCanvas(key, diameter, diameter);
            if (canvasTexture) {
                const ctx = canvasTexture?.context;

                if (ctx) {
                    ctx.beginPath();
                    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();

                    const flagImage = this.textures.get(flag.code).getSourceImage() as HTMLImageElement;
                    if (flagImage) {
                        ctx.drawImage(flagImage, 0, 0, flagImage.width, flagImage.height, 0, 0, diameter, diameter);
                    }

                    canvasTexture.refresh();
                }
            }
        });
    }

    spawnBall(rawX?: number) {
        // get random flag between rank 1 - 5
        const randomFlag = FLAGS[PhaserMath.Between(0, 4)];
        // const randomFlag = FLAGS[0];
        const radius = getRadiusByRank(randomFlag.rank);

        this.currentBall = this.add.image(
            rawX ?? GAME_WIDTH / 2 - radius,
            DROP_Y,
            `flag-circle-${randomFlag.code}`
        );
        this.currentBall.setData('flag', randomFlag);
        this.currentBall.setData('radius', radius);
    }

    mergeBalls(a: Ball, b: Ball) {
        const newRank = a.flag.rank + 1;
        const x = (a.x + b.x) / 2;
        const y = (a.y + b.y) / 2;

        a.destroy();
        b.destroy();

        // create particles
        this.createMergeParticles(x, y);

        const newFlag = FLAGS.find((flag) => flag.rank === newRank);
        if (newFlag) {
            const newRadius = getRadiusByRank(newFlag.rank);
            const mergedBall = new Ball(
                this,
                x,
                y,
                `flag-circle-${newFlag?.code}`,
                newRadius,
                newFlag
            );
            mergedBall.setBounce(0.25);
            mergedBall.setFriction(0.02, 0.01, 0.05);
            mergedBall.setDensity(0.005 * newFlag.rank);
        }
    }

    createMergeParticles(x: number, y: number) {
        if (!this.textures.exists('particle-dot')) {
            const canvas = this.textures.createCanvas('particle-dot', 4, 4);
            if (canvas) {
                const ctx = canvas.context;
                if (ctx) {
                    ctx.fillStyle = '#ffffff';

                    // circle
                    ctx.beginPath();
                    ctx.arc(2, 2, 2, 0, Math.PI * 2);
                    ctx.fill();

                    // rectangle
                    // ctx.fillRect(0, 0, 4, 4);
                    canvas.refresh();
                }
            }
        }

        const emitter = this.add.particles(x, y, "particle-dot", {
            speed: { min: 80, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 700,
            blendMode: "ADD",
            maxParticles: 16,
            gravityY: 150,
        });
        emitter.setDepth(5);

        this.time.delayedCall(700, () => {
            emitter.destroy();
        });
    }

    createContainer() {
        const x = 30;
        const y = 150;
        const width = GAME_WIDTH - 60;
        const height = 550;
        const g = this.add.graphics();

        const radius = 8;
        const wallThickness = 6;

        // Glass fill
        g.fillStyle(0xffffff, 0.15);
        g.fillRoundedRect(x, y, width, height, radius);

        // Glass border
        g.lineStyle(wallThickness, 0xffffff, 0.4);

        // Left wall
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + height - radius);
        g.arc(
            x + radius,
            y + height - radius,
            radius,
            Math.PI,
            Math.PI / 2,
            true
        );
        g.strokePath();

        // Bottom
        g.beginPath();
        g.moveTo(x + radius, y + height);
        g.lineTo(x + width - radius, y + height);
        g.strokePath();

        // Right wall
        g.beginPath();
        g.moveTo(x + width, y);
        g.lineTo(x + width, y + height - radius);
        g.arc(
            x + width - radius,
            y + height - radius,
            radius,
            0,
            Math.PI / 2
        );
        g.strokePath();

        // Back left line
        // g.beginPath();
        // g.moveTo(75, 120);
        // g.lineTo(75, 670);
        // g.arc(
        //     75,
        //     670,
        //     radius,
        //     -1,
        //     Math.PI / 3
        // );
        // g.strokePath();

        // g.beginPath();
        // g.moveTo(30, 700);
        // g.lineTo(75, 670);
        // g.strokePath();

        // // Optional highlights
        // g.lineStyle(2, 0xffffff, 0.25);
        // g.beginPath();
        // g.moveTo(x + 15, y + 20);
        // g.lineTo(x + 15, y + height - 40);
        // g.strokePath();

        // g.beginPath();
        // g.moveTo(x + 25, y + 20);
        // g.lineTo(x + 25, y + height - 60);
        // g.strokePath();

        return g;
    }

    createContainer2(x: number, y: number, width: number, height: number) {
        const g = this.add.graphics();

        const depth = 18;
        const radius = 20;

        // Right side
        g.fillStyle(0xffffff, 0.08);
        g.beginPath();
        g.moveTo(x + width, y);
        g.lineTo(x + width + depth, y - depth);
        g.lineTo(x + width + depth, y + height - depth);
        g.lineTo(x + width, y + height);
        g.closePath();
        g.fillPath();

        // Bottom side
        g.fillStyle(0xffffff, 0.06);
        g.beginPath();
        g.moveTo(x, y + height);
        g.lineTo(x + width, y + height);
        g.lineTo(x + width + depth, y + height - depth);
        g.lineTo(x + depth, y + height - depth);
        g.closePath();
        g.fillPath();

        // Front glass
        g.fillStyle(0xffffff, 0.15);
        g.fillRoundedRect(x, y, width, height, radius);

        // Front borders
        g.lineStyle(6, 0xffffff, 0.4);

        // Left wall
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + height - radius);
        g.arc(x + radius, y + height - radius, radius, Math.PI, Math.PI / 2, true);
        g.strokePath();

        // Bottom
        g.beginPath();
        g.moveTo(x + radius, y + height);
        g.lineTo(x + width - radius, y + height);
        g.strokePath();

        // Right wall
        g.beginPath();
        g.moveTo(x + width, y);
        g.lineTo(x + width, y + height - radius);
        g.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
        g.strokePath();

        // Right depth border
        g.lineStyle(4, 0xffffff, 0.2);

        g.beginPath();
        g.moveTo(x + width, y);
        g.lineTo(x + width + depth, y - depth);
        g.lineTo(x + width + depth, y + height - depth);
        g.strokePath();

        // Bottom depth border
        g.beginPath();
        g.moveTo(x, y + height);
        g.lineTo(x + depth, y + height - depth);
        g.lineTo(x + width + depth, y + height - depth);
        g.strokePath();

        // Glass reflection
        g.lineStyle(3, 0xffffff, 0.2);
        g.beginPath();
        g.moveTo(x + 20, y + 30);
        g.lineTo(x + 20, y + height - 50);
        g.strokePath();

        g.beginPath();
        g.moveTo(x + 35, y + 40);
        g.lineTo(x + 35, y + height - 80);
        g.strokePath();

        return g;
    }

    drawQuad(
        g: GameObjects.Graphics,
        color: number,
        p1: { x: number, y: number },
        p2: { x: number, y: number },
        p3: { x: number, y: number },
        p4: { x: number, y: number }
    ) {
        g.fillStyle(color);

        g.beginPath();

        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.lineTo(p3.x, p3.y);
        g.lineTo(p4.x, p4.y);

        g.closePath();
        g.fillPath();
    }

    drawContainer() {
        const x = 30;
        const y = 150;
        const width = GAME_WIDTH - 60;
        const height = 550;
        const g = this.add.graphics();

        const depth = 40;

        // Colors
        const frontColor = 0xEEDFB3;
        const sideColor = 0xD8C07D;
        const floorColor = 0xDDD098;
        const rimColor = 0xE7D38B;
        const openingColor = 0xF5E6BE;

        const left = x;
        const right = x + width;
        const top = y;
        const bottom = y + height;

        //
        // Front face
        //
        g.fillStyle(frontColor);
        g.fillRect(left, top, width, height);

        //
        // Left side
        //
        this.drawQuad(
            g,
            sideColor,
            { x: left, y: top },
            { x: left + depth, y: top - depth },
            { x: left + depth, y: bottom - depth },
            { x: left, y: bottom }
        );

        //
        // Right side
        //
        this.drawQuad(
            g,
            sideColor,
            { x: right, y: top },
            { x: right - depth, y: top - depth },
            { x: right - depth, y: bottom - depth },
            { x: right, y: bottom }
        );

        //
        // Floor
        //
        this.drawQuad(
            g,
            floorColor,
            { x: left, y: bottom },
            { x: right, y: bottom },
            { x: right - depth, y: bottom - depth },
            { x: left + depth, y: bottom - depth }
        );

        //
        // Top rim
        //
        this.drawQuad(
            g,
            rimColor,
            { x: left, y: top },
            { x: right, y: top },
            { x: right - depth, y: top - depth },
            { x: left + depth, y: top - depth }
        );

        //
        // Inner opening
        //
        g.fillStyle(openingColor);
        g.fillRect(
            left + depth,
            top - depth,
            width - depth * 2,
            depth
        );

        return g;
    }

    drawGlassContainer() {
        const g = this.add.graphics();
        const x = 30;
        const y = 150;
        const width = GAME_WIDTH - 60;
        const height = 550;
        const thickness = 18;
        const depth = 40;

        //
        // Shadow
        //
        g.fillStyle(0x000000, 0.15);
        g.fillRoundedRect(
            x - 8,
            y + 8,
            width + 16,
            height + 16,
            12
        );

        //
        // Main glass body
        //
        g.fillStyle(0xffffff, 0.25);
        g.fillRoundedRect(x, y, width, height, 8);

        //
        // Bottom tint
        //
        g.fillStyle(0xaec8ff, 0.2);
        g.fillRect(
            x,
            y + height - 60,
            width,
            60
        );

        //
        // Left wall
        //
        g.fillStyle(0xffffff, 0.15);

        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + depth, y - depth);
        g.lineTo(x + depth, y + height - depth);
        g.lineTo(x, y + height);
        g.closePath();
        g.fillPath();

        //
        // Right wall
        //
        g.beginPath();
        g.moveTo(x + width, y);
        g.lineTo(x + width - depth, y - depth);
        g.lineTo(x + width - depth, y + height - depth);
        g.lineTo(x + width, y + height);
        g.closePath();
        g.fillPath();

        //
        // Floor
        //
        g.fillStyle(0xbdd6ff, 0.3);

        g.beginPath();
        g.moveTo(x, y + height);
        g.lineTo(x + width, y + height);
        g.lineTo(x + width - depth, y + height - depth);
        g.lineTo(x + depth, y + height - depth);
        g.closePath();
        g.fillPath();

        //
        // Bright outline
        //
        g.lineStyle(4, 0xffffff, 0.8);
        g.strokeRoundedRect(x, y, width, height, 8);

        //
        // Top rim
        //
        g.lineStyle(8, 0xffffff, 0.6);
        g.beginPath();
        g.moveTo(x + depth, y - depth);
        g.lineTo(x + width - depth, y - depth);
        g.strokePath();

        //
        // Reflection lines
        //
        g.lineStyle(2, 0xffffff, 0.25);

        g.beginPath();
        g.moveTo(x + 40, y + 80);
        g.lineTo(x + 80, y + 30);
        g.strokePath();

        g.beginPath();
        g.moveTo(x + 80, y + 120);
        g.lineTo(x + 120, y + 70);
        g.strokePath();

        return g;
    }

}
