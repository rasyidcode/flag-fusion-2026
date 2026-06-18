import { GameObjects, Input, Scene, Math as PhaserMath, Physics } from "phaser";
import { DROP_Y, FLAGS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { FlagRenderer } from "../visuals/FlagRenderer";
import { getRadiusByRank, getRandomFlag } from "../utils";
import type { Flag } from "../types";

export class Game extends Scene {

    flagRenderer: FlagRenderer | null = null;

    currentFlag: Flag | null = null;

    currentFlagObject: GameObjects.Image | null = null;

    canDrop: boolean = false;

    constructor() {
        super('Game');
    }

    init() {
        this.flagRenderer = null;
        this.currentFlag = null;
        this.currentFlagObject = null;
    }

    preload() {
        this.load.setPath('assets');

        // load all flags image
        FLAGS.forEach((flag) => {
            this.load.image(flag.code, `flags/${flag.code}.png`);
        });

        // create canvas texture for each flags
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

    create() {
        this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 32, true, true, true, true);

        this.flagRenderer = new FlagRenderer(this);

        this.spawnFlag(null);

        // move the flag based on pointer.x position
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            this.moveCurrentFlag(pointer.x);
        });

        // drop the flag
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            if (!this.currentFlag || !this.currentFlagObject) return;

            // @ts-ignore
            this.currentFlagObject?.setStatic(false); // drop the flag

            // reset the flag
            this.currentFlag = null;
            this.currentFlagObject = null;

            this.time.delayedCall(1000, () => {
                this.spawnFlag(pointer.x);
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


    spawnFlag(posX: number | null) {
        const randomFlag = getRandomFlag();
        const radius = getRadiusByRank(randomFlag.rank);
        let spawnX = GAME_WIDTH / 2 - radius;
        if (posX != null) {
            spawnX = posX;
        }
        const flag = this.flagRenderer?.createFlag(spawnX, 100, radius, randomFlag.code);
        // @ts-ignore
        flag?.setStatic(true);

        this.currentFlag = randomFlag;
        this.currentFlagObject = flag ?? null;
    }

    private moveCurrentFlag(rawX: number) {
        if (!this.currentFlag || !this.currentFlagObject) return;

        const radius = getRadiusByRank(this.currentFlag.rank);
        const clampedX = PhaserMath.Clamp(
            rawX,
            radius,
            GAME_WIDTH - radius
        )
        this.currentFlagObject.setPosition(clampedX, DROP_Y);
    }

}
