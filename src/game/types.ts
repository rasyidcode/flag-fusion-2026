// @ts-ignore
export enum BALL_DEFINITION_FIT {
    NORMAL,
    COVER
}

export interface BallDefinition {
    code: string;
    name: string;
    radius: number;
    level: number;
    score: number;
    fit: BALL_DEFINITION_FIT;
    colors: string[];
}
