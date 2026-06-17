import { GameObjects, Input, Scene, Math as PhaserMath } from "phaser";
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
        this.canDrop = true;
    }

    preload() {
        this.load.setPath('assets');

        FLAGS.forEach((flag) => {
            this.load.image(flag.code, `flags/${flag.code}.png`);
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
            // @ts-ignore
            this.currentFlagObject?.setStatic(false);

            this.currentFlag = null;
            this.currentFlagObject = null;

            this.time.delayedCall(1000, () => {
                this.spawnFlag(pointer.x);
            })
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
        //this.canDrop = true;
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
