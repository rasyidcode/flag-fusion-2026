import { AUTO, Game, Scale, type Types } from "phaser";
import { Game as MainGame } from "./scenes/Game";

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        MainGame
    ]
}

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;