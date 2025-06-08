import { gameWidth, gameHeight } from "@/app/game/canvasUI";

const platformSpacing = 60;
export const riseSpeed = 0.0;

export interface Platform {
    x : number;
    y : number;
    width : number;
}

export function createPlatforms(num : number) : Platform[] {
    const platforms : Platform[] = [];

    platforms.push({
        x: 0,
        y: gameHeight-30,
        width: gameWidth,
    })

    for (let i = 1; i < num; i++) {
        let numPlatform = (Math.floor(Math.random() * 4) + 1);

        for (let j = 0; j < numPlatform; j++) {
            const width : number = (Math.random() * 120) + 80;
            const x : number = Math.random() * (gameWidth - width);
            const y : number = gameHeight - (i * platformSpacing) - 50;

            platforms.push({ x, y, width })
        }
    }

    return platforms;
}

export function movePlatforms(platforms: Platform[]) : Platform[] {
    let newPlatforms = platforms.map((platform: Platform)  => ({
        ...platform, y: platform.y + riseSpeed
    }));

    newPlatforms = newPlatforms.filter((platform) => (
        platform.y < gameHeight + 20
    ));

    if (newPlatforms[0].y > gameHeight) {
        /*
        newPlatforms.shift();
        newPlatforms.push({
            x: Math.random() * (gameWidth - 200),
            y: (newPlatforms[newPlatforms.length - 1].y - platformSpacing),
            width: 100 + Math.random() * 100,
        )};
         */
    }

    while (newPlatforms.length < 20) {
        const highestPlatform = newPlatforms.slice(1).reduce((highest, platform) => {
            if (platform.y < highest.y) {
                return platform;
            }
            return highest;
        });

        const maxPlatforms = Math.floor(Math.random() * 4) + 1;
        let newY: number = highestPlatform.y - platformSpacing;

        for (let j = 0; j < maxPlatforms; j++) {
            const width = (Math.random() * 120) + 80;
            const x = Math.random() * (gameWidth - width);

            newPlatforms.push({
                x,
                y: newY,
                width
            });
        }
    }

    return newPlatforms;
}