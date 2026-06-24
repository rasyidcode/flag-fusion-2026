import {BALL_DEFINITION_FIT, type BallDefinition} from "./types.ts";

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;

export const DROP_Y = 50;

export const BALL_DEFINITIONS: BallDefinition[] = [
    {
        code: 'au',
        name: 'Australia',
        radius: 16,
        level: 1,
        score: 1,
        fit: BALL_DEFINITION_FIT.NORMAL,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'sn',
        name: 'Senegal',
        radius: 22,
        level: 2,
        score: 2,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x009243', '0xFCFB44', '0xFF0009']
    },
    {
        code: 'jp',
        name: 'Japan',
        radius: 28,
        level: 3,
        score: 4,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'pt',
        name: 'Portugal',
        radius: 34,
        level: 4,
        score: 8,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'br',
        name: 'Brazil',
        radius: 40,
        level: 5,
        score: 16,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'gb-eng',
        name: 'England',
        radius: 48,
        level: 6,
        score: 32,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'nl',
        name: 'Netherlands',
        radius: 56,
        level: 7,
        score: 64,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'ma',
        name: 'Morocco',
        radius: 62,
        level: 8,
        score: 128,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'hr',
        name: 'Croatia',
        radius: 70,
        level: 9,
        score: 256,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'fr',
        name: 'France',
        radius: 78,
        level: 10,
        score: 512,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
    {
        code: 'ar',
        name: 'Argentina',
        radius: 86,
        level: 11,
        score: 1024,
        fit: BALL_DEFINITION_FIT.COVER,
        colors: ['0x080069', '0xFF0019']
    },
];