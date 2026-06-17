import { GameObjects, Input, Scene, Math as PhaserMath } from "phaser";
import { FLAGS, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { FlagRenderer } from "../visuals/FlagRenderer";
import { getRadiusByRank, getRandomFlag } from "../utils";

export class Game extends Scene {

    private flagRenderer: FlagRenderer | null;

    private currentFlag: GameObjects.Image | null;

    //private canDrop: boolean;

    constructor() {
        super('Game');

        this.flagRenderer = null;
        this.currentFlag = null;
        //this.canDrop = true;
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
        this.flagRenderer?.initAllCircularTexture();

        this.spawnFlag(GAME_WIDTH / 2 - 18);

        // move the flag based on pointer.x position
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            if (!this.currentFlag) return;

            const clampedX = PhaserMath.Clamp(
                pointer.x,
                18,
                GAME_WIDTH - 18
            )
            this.currentFlag?.setPosition(clampedX, 100);
        });

        // drop the flag
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            // @ts-ignore
            this.currentFlag?.setStatic(false);
            this.currentFlag = null;

            this.time.delayedCall(1000, () => {
                this.spawnFlag(pointer.x);
            })
        });
    }

    private spawnFlag(spawnX: number) {
        const randomFlag = getRandomFlag();
        const radius = getRadiusByRank(randomFlag.rank);
        const flag = this.flagRenderer?.createFlag(spawnX, 100, radius, randomFlag.code);
        // @ts-ignore
        flag?.setStatic(true);

        this.currentFlag = flag ?? null;
        //this.canDrop = true;
    }

}
