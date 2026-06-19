import { Input, Scene, Physics, Math as PhaserMath, GameObjects } from "phaser";
import { DROP_Y, FLAGS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { getRadiusByRank } from "../utils";
import { Ball } from "../gameobjects/Ball";
import type { Flag } from "../types";

export class Game extends Scene {

    canDrop: boolean = false;

    currentBall: GameObjects.Image | null = null;

    constructor() {
        super('Game');
    }

    init() {
        this.currentBall = null;
    }

    preload() {
        this.load.setPath('assets');

        // load all flags image
        FLAGS.forEach((flag) => {
            this.load.image(flag.code, `flags/${flag.code}.png`);
        });
    }

    create() {
        this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 32, true, true, true, true);

        this.initBallTexture();

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
            if (!this.currentBall) return;

            const x = this.currentBall.x;
            const y = this.currentBall.y;
            const flag = this.currentBall.getData('flag') as Flag;
            const radius = this.currentBall.getData('radius') as number;

            this.currentBall.destroy();

            new Ball(this, x, y, `flag-circle-${flag.code}`, radius, flag);

            this.time.delayedCall(1000, () => {
                this.spawnBall(pointer.x);
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
        const radius = getRadiusByRank(randomFlag.rank);

        this.currentBall= this.add.image(
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

        const newFlag = FLAGS.find((flag) => flag.rank === newRank);
        if (newFlag) {
            const newRadius = getRadiusByRank(newFlag.rank);
            new Ball(
                this,
                x,
                y,
                `flag-circle-${newFlag?.code}`,
                newRadius,
                newFlag
            );
        }
    }

}
