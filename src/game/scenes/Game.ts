import { Input, Scene, Math as PhaserMath, Physics } from "phaser";
import { DROP_Y, FLAGS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { getRadiusByRank, getRandomFlag } from "../utils";
import { Ball } from "../gameobjects/Ball";

export class Game extends Scene {

    canDrop: boolean = false;

    currentBall: Ball | null = null;

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

        // move the flag based on pointer.x position
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            this.moveCurrentBall(pointer.x);
        });

        // drop the flag
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            if (!this.currentBall) return;

            this.currentBall.drop();

            // reset the flag
            this.currentBall = null;

            this.time.delayedCall(1000, () => {
                this.spawnBall(pointer.x);
            });
        });

        // check collision between flags
        this.matter.world.on('collisionstart', (event: Physics.Matter.Events.CollisionStartEvent) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA.gameObject;
                const b = pair.bodyB.gameObject;

                console.log('Game Object A: ', a);
                console.log('Game Object B: ', b);
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
        const randomFlag = getRandomFlag();
        const radius = getRadiusByRank(randomFlag.rank);
        this.currentBall = new Ball(
            this,
            rawX ?? GAME_WIDTH / 2 - radius,
            DROP_Y,
            `flag-circle-${randomFlag.code}`,
            radius,
            randomFlag
        );
    }

    moveCurrentBall(rawX: number) {
        if (!this.currentBall) return;

        const radius = getRadiusByRank(this.currentBall.flag.rank);
        const clampedX = PhaserMath.Clamp(
            rawX,
            radius,
            GAME_WIDTH - radius
        )
        this.currentBall.setPosition(clampedX, DROP_Y);
    }

}
