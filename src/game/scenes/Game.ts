import { Input, Scene, Physics, Math as PhaserMath, GameObjects, Display } from "phaser";
import {BALL_DEFINITIONS, DROP_Y, GAME_HEIGHT, GAME_WIDTH} from "../config";
import { Ball } from "../gameobjects/Ball";

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

    create() {
        this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 32, true, true, true, true);        // Visual stadium border bounds

        // container
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'container');
        this.matter.add.rectangle(GAME_WIDTH / 2, 700, GAME_WIDTH - 60, 20, {
            isStatic: true,
        });
        this.matter.add.rectangle(22, GAME_HEIGHT / 2 + 83, 20, 535, {
            isStatic: true,
        });
        this.matter.add.rectangle(GAME_WIDTH - 22, GAME_HEIGHT / 2 + 83, 20, 535, {
            isStatic: true,
        });

        this.spawnBall();

        // move the ball based on pointer.x position
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            if (!this.currentBall) return;

            const radius = this.currentBall.getData('radius') as number;
            const clampedX = PhaserMath.Clamp(
                pointer.x,
                15 + radius,
                GAME_WIDTH - 15 - radius
            )
            this.currentBall.setX(clampedX);
        });

        // drop the ball
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            if (!this.currentBall || !this.canDrop) return;

            const code = this.currentBall.getData('code') as string;
            const radius = this.currentBall.getData('radius') as number;
            const level = this.currentBall.getData('level') as number;
            const colors = this.currentBall.getData('colors') as string[];

            const x = PhaserMath.Clamp(this.currentBall.x, 31 + radius, GAME_WIDTH - 31 - radius);
            const y = this.currentBall.y;

            this.currentBall.destroy();
            this.currentBall = null;
            this.canDrop = false;

            new Ball(this, x, y, `ball-${code}`, radius, level, colors);

            this.time.delayedCall(550, () => {
                const clampedX = PhaserMath.Clamp(
                    pointer.x,
                    15 + radius,
                    GAME_WIDTH - 15 - radius
                )
                this.spawnBall(clampedX);
                this.canDrop = true;
            });
        });

        // check collision between balls
        this.matter.world.on('collisionstart', (event: Physics.Matter.Events.CollisionStartEvent) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA.gameObject;
                const b = pair.bodyB.gameObject;

                if (a instanceof Ball && b instanceof Ball) {
                    if (a.level === b.level) {
                        // console.log(a);
                        // console.log(b);
                        this.mergeBalls(a, b);
                    }
                }
            }
        });
    }

    spawnBall(rawX?: number) {
        // get random flag between rank 1 - 5
        // const ball = BALL_DEFINITIONS[PhaserMath.Between(0, 3)];
        const ball = BALL_DEFINITIONS[0];

        this.currentBall = this.add.image(
            rawX ?? GAME_WIDTH / 2 - ball.radius,
            DROP_Y,
            `ball-${ball.code}`
        );

        this.currentBall.setData('code', ball.code);
        this.currentBall.setData('radius', ball.radius);
        this.currentBall.setData('level', ball.level);
        this.currentBall.setData('colors', ball.colors);
    }

    mergeBalls(a: Ball, b: Ball) {
        const newLevel= a.level + 1;
        const x = (a.x + b.x) / 2;
        const y = (a.y + b.y) / 2;
        const colors = a.colors;

        a.destroy();
        b.destroy();

        // create particles
        this.createMergeParticles(x, y, colors);

        const newBall = BALL_DEFINITIONS.find((ballDef) => ballDef.level === newLevel);
        if (newBall) {
            new Ball(
                this,
                x,
                y,
                `ball-${newBall?.code}`,
                newBall.radius,
                newBall.level,
                newBall.colors
            );
        }
    }

    createMergeParticles(x: number, y: number, colors: string[]) {
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
            tint: colors.map((color) => {
                return Display.Color.HexStringToColor(color).color
            }),
            lifespan: 700,
            blendMode: "ADD",
            maxParticles: 16,
            gravityY: 150,
        });
        emitter.setDepth(3);

        this.time.delayedCall(700, () => {
            emitter.destroy();
        });
    }



}
