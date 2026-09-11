import { Input, Scene, Physics, Math as PhaserMath, GameObjects, Display } from "phaser";
import { BALL_DEFINITIONS, DANGER_ZONE_Y, DROP_Y, GAME_HEIGHT, GAME_WIDTH } from "../config";
import type { BallDefinition } from "../types";
import { Ball } from "../gameobjects/Ball";

export class Game extends Scene {

    currentBall: GameObjects.Image | null = null;

    canDrop: boolean = true;

    dropGuide: GameObjects.Image | null = null;

    score: number = 0;

    highScore: number = 0;

    nextBallDef: BallDefinition | null = null;

    isGameOver: boolean = false;

    dangerTimer: number = 0;

    constructor() {
        super('Game');
    }

    init() {
        this.currentBall = null;
        this.canDrop = true;
        this.dropGuide = null;
        this.score = 0;
        this.nextBallDef = null;
        this.isGameOver = false;
        this.dangerTimer = 0;

        // Load high scorere from local storage
        const savedBest = localStorage.getItem('flag_fusion_2026_highscore');
        this.highScore = savedBest ? parseInt(savedBest, 10) : 0;

        // Initialize HTML displays
        const bestEl = document.getElementById('best-display');
        if (bestEl) bestEl.textContent = this.highScore.toString();

        const scoreEl = document.getElementById('score-display');
        if (scoreEl) scoreEl.textContent = this.score.toString();
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

        // create dashed danger line
        const dangerLine = this.add.image(GAME_WIDTH / 2, DANGER_ZONE_Y, 'danger-zone');
        dangerLine.setDepth(1);

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

        // wire up play again button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.onclick = () => {
                const modal = document.getElementById('game-over-modal');
                modal?.classList.remove('visible');

                // Restart the game scene
                this.scene.restart();
            }
        }
    }

    spawnBall(rawX?: number) {
        // current ball to drop: use queue ball, or roll random on the first turn
        const ball = this.nextBallDef ?? BALL_DEFINITIONS[PhaserMath.Between(0, 4)];

        // roll a new random ball (tiers 1-5, indexes 0-4) for the next turn
        this.nextBallDef = BALL_DEFINITIONS[PhaserMath.Between(0, 4)];

        // update the next ball image in the HTML HUD
        const nextImg = document.getElementById('next-flag-img') as HTMLImageElement;
        if (nextImg && this.nextBallDef) {
            nextImg.src = `assets/flags/${this.nextBallDef.code}.png`;
        }

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

            // Award points based on ball definition tier score
            this.updateScore(newBall.score);
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

    updateScore(points: number) {
        this.score += points;
        const scoreEl = document.getElementById('score-display');
        if (scoreEl) scoreEl.textContent = this.score.toString();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            const bestEl = document.getElementById('best-display');
            if (bestEl) bestEl.textContent = this.highScore.toString();
            localStorage.setItem('flag_fusion_2026_highscore', this.highScore.toString());
        }
    }

    update(_time: number, delta: number) {
        if (this.isGameOver) return;

        // get all active Ball instances in the scene
        const balls = this.children.getChildren().filter((child) => child instanceof Ball) as Ball[];

        // check if any ball is resting above the danger line
        const isAnyBallOverflowing = balls.some((ball) => {
            // only inspect the body if it exists
            const body = ball.body as MatterJS.BodyType;
            if (!body) return false;

            // is the ball resting / moving slowly? (avoid triggering while still in free-fall)
            const isSettled = Math.abs(body.velocity.y) < 0.25 && Math.abs(body.velocity.x) < 0.25;
            
            // Has the ball fallen past the drop hover area?
            const isInsidePlayfield = ball.y > DROP_Y + 40;

            // is the top of the ball above the danger line?
            const isAboveDangerLine = (ball.y - ball.radius) < DANGER_ZONE_Y;

            return isSettled && isInsidePlayfield && isAboveDangerLine;
        })

        // grace period timer
        if (isAnyBallOverflowing) {
            this.dangerTimer += delta;

            // if resting above line for 2.5 consecutive seconds -> GAME OVER
            if (this.dangerTimer >= 2500) {
                this.triggerGameOver();
            }
        } else {
            // reset timer if all balls settled back down
            this.dangerTimer = 0;
        }
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.canDrop = false;
        this.dropGuide?.destroy();
        this.currentBall?.destroy();

        // show game over overlay
        const modal = document.getElementById('game-over-modal');
        if (modal) {
            const finalScoreEl = document.getElementById('final-score');
            if (finalScoreEl) finalScoreEl.textContent = this.score.toString();

            const finalBestEl = document.getElementById('final-best');
            if (finalBestEl) finalBestEl.textContent = this.highScore.toString();

            modal.classList.add('visible');
        }
    }
}

