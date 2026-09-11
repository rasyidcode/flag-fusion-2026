import {BALL_DEFINITION_FIT, type BallDefinition} from "./types.ts";

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;

export const DROP_Y = 50;
export const DANGER_ZONE_Y = 190;

export const BALL_DEFINITIONS: BallDefinition[] = [
    {
        code: 'co',
        name: 'Colombia',
        radius: 16,
        level: 1,
        score: 1,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0xFCD116', '0x003893', '0xCE1126']
    },
    {
        code: 'br',
        name: 'Brazil',
        radius: 22,
        level: 2,
        score: 2,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x009440', '0xFFCB00']
    },
    {
        code: 'pt',
        name: 'Portugal',
        radius: 28,
        level: 3,
        score: 4,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x006600', '0xFF0000']
    },
    {
        code: 'ch',
        name: 'Switzerland',
        radius: 34,
        level: 4,
        score: 8,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0xDA291C', '0xFFFFFF']
    },
    {
        code: 'ma',
        name: 'Morocco',
        radius: 40,
        level: 5,
        score: 16,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0xC1272D', '0x006233']
    },
    {
        code: 'be',
        name: 'Belgium',
        radius: 48,
        level: 6,
        score: 32,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x000000', '0xFDDA24', '0xEF3340']
    },
    {
        code: 'no',
        name: 'Norway',
        radius: 56,
        level: 7,
        score: 64,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0xBA0C2F', '0xFFFFFF', '0x00205B']
    },
    {
        code: 'fr',
        name: 'France',
        radius: 62,
        level: 8,
        score: 128,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x002654', '0xFFFFFF', '0xCE1126']
    },
    {
        code: 'gb-eng',
        name: 'England',
        radius: 70,
        level: 9,
        score: 256,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0xC8102E', '0xFFFFFF']
    },
    {
        code: 'ar',
        name: 'Argentina',
        radius: 78,
        level: 10,
        score: 512,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x74ACDF', '0xFFFFFF']
    },
    {
        code: 'es',
        name: 'Spain',
        radius: 86,
        level: 11,
        score: 1024,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0xAA151B', '0xF1BF00']
    },
];