import { gameWidth, gameHeight } from "@/app/game/canvas";

const platformSpacing = 100;

export const riseSpeed = 1;

export interface Platform {
    x : number;
    y : number;
    width : number;
}

export function createPlatforms(num : number) : Platform[] {
    const platforms : Platform[] = [];
    for (let i = 0; i < num; i++) {
        const x : number = Math.random() * gameWidth;
        const y : number = gameHeight - (i * platformSpacing) - 50;
        const width : number = 0;
        platforms.push({x, y, width})
    }

    return platforms;
}

export function movePlatforms() {

}