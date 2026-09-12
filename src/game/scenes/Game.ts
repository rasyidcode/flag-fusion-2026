import { Input, Scene, Physics, Math as PhaserMath, GameObjects, Display } from "phaser";
import { BALL_DEFINITIONS, DANGER_ZONE_Y, DROP_Y, GAME_HEIGHT, GAME_WIDTH } from "../config";
import type { BallDefinition } from "../types";
import { Ball } from "../gameobjects/Ball";
import { soundManager } from "../audio";

export class Game extends Scene {

    currentBall: GameObjects.Image | null = null;

    canDrop: boolean = true;

    dropGuide: GameObjects.Image | null = null;

    score: number = 0;

    highScore: number = 0;

    nextBallDef: BallDefinition | null = null;

    isGameOver: boolean = false;

    dangerTimer: number = 0;

    dangerLine: GameObjects.Image | null = null;

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
        this.dangerLine = null;

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
        this.dangerLine = this.add.image(GAME_WIDTH / 2, DANGER_ZONE_Y, 'danger-zone');
        this.dangerLine.setDepth(1);
        this.dangerLine.setAlpha(0);

        this.spawnBall();

        const updateBallAim = (pointerX: number) => {
            if (!this.currentBall || !this.dropGuide) return;
            const radius = this.currentBall.getData('radius') as number;
            const clampedX = PhaserMath.Clamp(
                pointerX,
                15 + radius,
                GAME_WIDTH - 15 - radius
            )
            this.currentBall.setX(clampedX);
            this.dropGuide.setX(clampedX);
        }

        // Aim while moving (desktop hover or mobile drag)
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            updateBallAim(pointer.x);
        });

        // Touch down snaps the ball to the finger position
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            updateBallAim(pointer.x);
        });

        // Releasing finger/mouse drop the ball
        this.input.on('pointerup', (_pointer: Input.Pointer) => {
            if (this.currentBall) {
                this.dropBall(this.currentBall.x);
            }
        });

        // check collision between balls
        this.matter.world.on('collisionstart', (event: Physics.Matter.Events.CollisionStartEvent) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA.gameObject;
                const b = pair.bodyB.gameObject;

                if (a instanceof Ball && b instanceof Ball) {
                    this.mergeBalls(a, b);
                }

                if (a instanceof Ball || b instanceof Ball) {
                    const relSpeed = Math.hypot(
                        pair.bodyA.velocity.x - pair.bodyB.velocity.x,
                        pair.bodyA.velocity.y - pair.bodyB.velocity.y
                    )
                    if (relSpeed > 1.2) {
                        soundManager.playBounce(relSpeed / 10);
                    }
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

        // wire up sound toggle button
        const soundBtn = document.getElementById('sound-toggle-btn');
        const soundIcon = document.getElementById('sound-icon');
        const updateSoundUI = () => {
            if (soundIcon && soundBtn) {
                soundIcon.textContent = soundManager.isMuted ? '🔇' : '🔊';
                soundBtn.classList.toggle('muted', soundManager.isMuted);
                soundBtn.setAttribute('title', soundManager.isMuted ? 'Unmute Sound' : 'Mute Sound');
            }
        }

        // initialize state (loads any saved mute preference from localStorage)
        updateSoundUI();

        if (soundBtn) {
            soundBtn.onclick = () => {
                soundManager.toggleMute();
                updateSoundUI();
            }
        }

        this.setupDebugControls();
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

        soundManager.playDrop();

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

        const newBallDef = BALL_DEFINITIONS.find((ballDef) => ballDef.level === newLevel);
        if (newBallDef) {
            const newBall = new Ball(
                this,
                x,
                y,
                `ball-${newBallDef?.code}`,
                newBallDef.radius,
                newBallDef.level,
                newBallDef.colors
            );

            // elastic pop-in (displaces surrounding balls smoothly)
            newBall.setScale(0.2);
            this.tweens.add({
                targets: newBall,
                scale: 1,
                duration: 200,
                ease: 'Back.easeOut',
            });

            // award points based on ball definition tier score
            this.updateScore(newBallDef.score);

            // floating score popup
            this.createScorePopup(x, y, newBallDef.score);

            soundManager.playMerge(newLevel);

            // camera shake based on tier
            this.triggerMergeCameraShake(newLevel);

            // grand finale celebration if spain is fused!
            if (newLevel === 11) {
                this.triggerChampionCelebration(x, y);
            }
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

    triggerGameOver() {
        this.isGameOver = true;
        this.canDrop = false;
        this.dropGuide?.destroy();
        this.currentBall?.destroy();

        soundManager.playGameOver();

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

    // trigger camera shake effect based on ball tier
    triggerMergeCameraShake(level: number) {
        // only shake for mid-to-high tiers (tier 5 and up)
        if (level < 5) return;

        // scale intensity with level
        // Tier 5-6 (Morocco, Belgium): gentle micro-bump
        // Tier 7-8 (Norway, France): medium punch
        // Tier 9-10 (England, Argentina): heavy impact
        // Tier 11 (Spain): massive rumble
        let duration = 80;
        let intensity = 0.003;

        if (level >= 11) {
            duration = 300;
            intensity = 0.02;
        } else if (level >= 9) {
            duration = 180;
            intensity = 0.01;
        } else if (level >= 7) {
            duration = 120;
            intensity = 0.006;
        }

        this.cameras.main.shake(duration, intensity);
    }

    createScorePopup(x: number, y: number, points: number) {
        const text = this.add.text(x, y, `+${points}`, {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: points >= 64 ? '24px' : '20px',
            fontStyle: 'bold',
            color: '#ffe066',
            stroke: '#1a1a1a',
            strokeThickness: 3,
        });
        text.setOrigin(0.5);
        text.setDepth(10);

        this.tweens.add({
            targets: text,
            y: y - 45,
            scale: { start: 0.6, to: 1.1 },
            alpha: { start: 1, to: 0 },
            duration: 850,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    triggerChampionCelebration(x: number, y: number) {
        soundManager.playChampion();

        // create a rectangular confetti texture if not already created
        if (!this.textures.exists('confetti-piece')) {
            const canvas = this.textures.createCanvas('confetti-piece', 8, 12);
            if (canvas?.context) {
                canvas.context.fillStyle = '#ffffff';
                canvas.context.fillRect(0, 0, 8, 12);
                canvas.refresh();
            }
        }

        // confetti fountain emitter
        const confettiColors = [0xF1BF00, 0xAA151B, 0xFFFFFF, 0x00E676, 0x2979FF];
        const emitter = this.add.particles(x, y, 'confetti-piece', {
            speed: { min: 200, max: 450 },
            angle: { min: 210, max: 330 }, // shoots upward like a fountain
            gravityY: 320, // gravity pulls confetti down
            rotate: { start: 0, end: 720 }, // Fluttering spin
            tint: confettiColors,
            lifespan: 3000,
            quantity: 50,
            maxParticles: 75,
            scale: { start: 1, end: 0 },
        });
        emitter.setDepth(15);

        // auto clean emitter
        this.time.delayedCall(3200, () => {
            emitter.destroy();
        });

        // triumphant floating banner
        const banner = this.add.text(GAME_WIDTH / 2, 240, '🏆 2026 WORLD CHAMPION! 🏆', {
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '22px',
            fontStyle: '900',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: 'rgba(0, 0, 0, 0.6)',
                blur: 8,
                fill: true
            }
        });
        banner.setOrigin(0.5);
        banner.setDepth(20);

        // pop in with elastic overshoot, float up, and fade
        banner.setScale(0.2);
        this.tweens.add({
            targets: banner,
            scale: 1.1,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: banner,
                    y: 200,
                    alpha: 0,
                    duration: 1500,
                    ease: 'Power2',
                    onComplete: () => {
                        banner.destroy();
                    }
                });
            }
        });
    }

    // setup debug controls for development mode
    setupDebugControls() {
        if (!import.meta.env.DEV) return;

        // press 'D' -> Spawn ball in Critical Danger zone
        this.input.keyboard?.on('keydown-D', () => {
            const def = BALL_DEFINITIONS[4]; // always spawn the highest tier ball for testing
            const ball = new Ball(
                this,
                GAME_WIDTH / 2,
                DANGER_ZONE_Y + 10,
                `ball-${def.code}`,
                def.radius,
                def.level,
                def.colors
            );
            ball.setStatic(true);
        });

        // press 'W' -> Spawn ball in Warning zone (approaching danger line)
        this.input.keyboard?.on('keydown-W', () => {
            const def = BALL_DEFINITIONS[4]; // always spawn the highest tier ball for testing
            const ball = new Ball(
                this,
                GAME_WIDTH / 2,
                DANGER_ZONE_Y + 60,
                `ball-${def.code}`,
                def.radius,
                def.level,
                def.colors
            );
            ball.setStatic(true);
        });

        // press 'C' -> Clear all balls in the playfield
        this.input.keyboard?.on('keydown-C', () => {
            const balls = this.children.getChildren().filter((child) => child instanceof Ball) as Ball[];
            balls.forEach((ball) => ball.destroy());
            this.dangerTimer = 0;
        });

        // press 'S' -> Test Spain celebration (grand finale)
        this.input.keyboard?.on('keydown-S', () => {
            this.triggerChampionCelebration(GAME_WIDTH / 2, GAME_HEIGHT / 2);
            this.triggerMergeCameraShake(11); // simulate Spain merge camera shake
        });
    }

    update(time: number, delta: number) {
        if (this.isGameOver) return;

        // get all active Ball instances in the scene
        const balls = this.children.getChildren().filter((child) => child instanceof Ball) as Ball[];

        // track the highest settled ball in the playfield
        let highestBallTop = GAME_HEIGHT;

        for (const ball of balls) {
            const body = ball.body as MatterJS.BodyType;
            if (!body) continue;

            const isSettled = Math.abs(body.velocity.y) < 0.25 && Math.abs(body.velocity.x) < 0.25;
            const isInsidePlayfield = ball.y > DROP_Y + 40;

            if (isSettled && isInsidePlayfield) {
                const topEdge = ball.y - ball.radius;
                if (topEdge < highestBallTop) {
                    highestBallTop = topEdge;
                }
            }
        }

        // check if any ball is resting above the danger line
        const isAnyBallOverflowing = highestBallTop < DANGER_ZONE_Y;
        const isNearDanger = highestBallTop < DANGER_ZONE_Y + 70; // warning treshold (within 70px)

        // -- danger line visual feedback
        if (this.dangerLine) {
            if (isAnyBallOverflowing) {
                // PANIC
                const pulse = 0.5 + 1.0 * ((Math.sin(time * 0.015) + 1) / 2);
                this.dangerLine.setAlpha(pulse);
            } else if (isNearDanger) {
                // WARNING
                this.dangerLine.setAlpha(1.0);
            } else {
                // SAFE
                this.dangerLine.setAlpha(0);
            }
        }

        // grace period timer
        if (isAnyBallOverflowing) {
            this.dangerTimer += delta;

            // if resting above line for 2.5 consecutive seconds -> GAME OVER
            if (this.dangerTimer >= 2500) {
                this.dangerLine?.setAlpha(1.0); // solid red line final game over
                this.triggerGameOver();
            }
        } else {
            // reset timer if all balls settled back down
            this.dangerTimer = 0;
        }
    }

}

