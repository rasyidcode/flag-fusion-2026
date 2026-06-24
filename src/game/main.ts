import { AUTO, Game, type Types } from "phaser";
import { Game as MainGame } from "./scenes/Game";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import {Preloader} from "./scenes/Preloader.ts";

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    // backgroundColor: '#028af8',
    // scale: {
    //     mode: Scale.FIT,
    //     autoCenter: Scale.CENTER_BOTH
    // },
    transparent: true,
    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 1.5 },
            debug: true
        }
    },
    scene: [
        Preloader,
        MainGame
    ]
}

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;