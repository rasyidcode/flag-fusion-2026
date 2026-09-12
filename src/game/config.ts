import { BALL_DEFINITION_FIT, type BallDefinition } from "./types.ts";

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

// Muscal notes for Tiers 1 through 11 (C Major scale risng up to G5)
export const TIER_FREQUENCIES: number[] = [
    261.63, // Tier 1 (Colombia)  - C4
    293.66, // Tier 2 (Brazil)    - D4
    329.63, // Tier 3 (Portugal)  - E4
    349.23, // Tier 4 (Switz)     - F4
    392.00, // Tier 5 (Morocco)   - G4
    440.00, // Tier 6 (Belgium)   - A4
    493.88, // Tier 7 (Norway)    - B4
    523.25, // Tier 8 (France)    - C5
    587.33, // Tier 9 (England)   - D5
    659.25, // Tier 10 (Argentina)- E5
    783.99, // Tier 11 (Spain)    - G5
];