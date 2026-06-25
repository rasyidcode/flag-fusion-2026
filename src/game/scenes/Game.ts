import { Input, Scene, Physics, Math as PhaserMath, GameObjects, Display, TintModes } from "phaser";
import { BALL_DEFINITIONS, DROP_Y, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { Ball } from "../gameobjects/Ball";

export class Game extends Scene {

    currentBall: GameObjects.Image | null = null;

    canDrop: boolean = true;

    dropGuide: GameObjects.Image | null = null;

    constructor() {
        super('Game');
    }

    init() {
        this.currentBall = null;
        this.canDrop = true;
        this.dropGuide = null;
    }

    create() {
        this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 32, true, true, true, true);        // Visual stadium border bounds

        // define container and its phisycs
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
            if (!this.currentBall || !this.dropGuide) return;

            const radius = this.currentBall.getData('radius') as number;
            const clampedX = PhaserMath.Clamp(
                pointer.x,
                15 + radius,
                GAME_WIDTH - 15 - radius
            )
            this.currentBall.setX(clampedX);
            this.dropGuide.setX(clampedX);
        });

        // drop the ball
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            this.dropBall(pointer.x);
        });

        // check collision between balls
        this.matter.world.on('collisionstart', (event: Physics.Matter.Events.CollisionStartEvent) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA.gameObject;
                const b = pair.bodyB.gameObject;

                if (a instanceof Ball && b instanceof Ball) {
                    this.mergeBalls(a, b);
                }
            }
        });
    }

    spawnBall(rawX?: number) {
        // get random flag between rank 1 - 5
        const ball = BALL_DEFINITIONS[PhaserMath.Between(0, 3)];
        // const ball = BALL_DEFINITIONS[1];

        const ballX = rawX ?? GAME_WIDTH / 2 - ball.radius;
        this.currentBall = this.add.image(
            ballX,
            DROP_Y,
            `ball-${ball.code}`
        );

        this.currentBall.setData('code', ball.code);
        this.currentBall.setData('radius', ball.radius);
        this.currentBall.setData('level', ball.level);
        this.currentBall.setData('colors', ball.colors);

        // define drop guide
        const dropGuideY = GAME_HEIGHT / 2;
        this.dropGuide = this.add.image(ballX, dropGuideY, `drop-guide-${ball.code}`);
        this.dropGuide.setDepth(1);
    }

    dropBall(rawX: number) {
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
        this.dropGuide?.destroy();

        new Ball(this, x, y, `ball-${code}`, radius, level, colors);

        this.time.delayedCall(650, () => {
            const clampedX = PhaserMath.Clamp(
                rawX,
                15 + radius,
                GAME_WIDTH - 15 - radius
            )
            this.spawnBall(clampedX);
            this.canDrop = true;
        });
    }

    mergeBalls(a: Ball, b: Ball) {
        if (a.merged || b.merged) return;
        if (a.level !== b.level) return;

        a.merged = true;
        b.merged = true;

        const newLevel = a.level + 1;
        const x = (a.x + b.x) / 2;
        const y = (a.y + b.y) / 2;
        const colors = a.colors;

        a.destroy();
        b.destroy();

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

        // create particles
        this.createMergeParticles(x, y, colors);
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

