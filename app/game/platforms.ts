import { gameWidth, gameHeight } from "@/app/ui/canvasUI";

const platformSpacing = 70;

export let riseSpeed = 0;
let startSpeed = 0.25;

export interface Spike {
    x: number;
    width: number;
}

export interface Platform {
    x: number;
    y: number;
    width: number;
    spikes?: Spike[];
}

export function startGame() {
    if (riseSpeed == 0) {
        riseSpeed = startSpeed;
    }
}

export function increaseSpeed() {
    riseSpeed += 0.5;
}

export function setSpeed(speed: number) {
    riseSpeed = speed;
}

function createSpikes(platformWidth: number): Spike[] {
    const spikes: Spike[] = [];
    const spikeWidth = 8;
    const maxSpikes = Math.floor(platformWidth / 5);
    const numSpikes = Math.floor(Math.random() * maxSpikes) + 1;

    for (let i = 0; i < numSpikes; i++) {
        const x = Math.random() * (platformWidth - spikeWidth);
        spikes.push({
            x,
            width: spikeWidth
        });
    }

    return spikes;
}

export function createPlatforms(num: number): Platform[] {
    const platforms: Platform[] = [];

    platforms.push({
        x: 0,
        y: gameHeight - 30,
        width: gameWidth,
    });

    for (let i = 1; i < num; i++) {
        let numPlatform = (Math.floor(Math.random() * 4) + 1);

        for (let j = 0; j < numPlatform; j++) {
            const width: number = (Math.random() * 120) + 80;
            const x: number = Math.random() * (gameWidth - width);
            const y: number = gameHeight - (i * platformSpacing) - 50;

            const platform: Platform = { x, y, width };

            if (Math.random() < 0.3) {
                platform.spikes = createSpikes(width);
            }

            platforms.push(platform);
        }
    }

    return platforms;
}

export function movePlatforms(platforms: Platform[]): Platform[] {
    let newPlatforms = platforms.map((platform: Platform) => ({
        ...platform, y: platform.y + riseSpeed
    }));

    newPlatforms = newPlatforms.filter((platform) => (
        platform.y < gameHeight + 20
    ));

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

            const platform: Platform = {
                x,
                y: newY,
                width
            };

            if (Math.random() < 0.1) {
                platform.spikes = createSpikes(width);
            }

            newPlatforms.push(platform);
        }
    }

    return newPlatforms;
}

/*
// SVG code created with https://www.svgviewer.dev
export function createPlatformSVG(width: number, height: number = 20): string {
    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="4" width="${width}" height="${height - 4}" fill="#8B4513" stroke="#654321" stroke-width="1"/>
            
            <rect x="0" y="0" width="${width}" height="6" fill="#228B22"/>
            
            ${Array.from({ length: Math.floor(width / 8) }, (_, i) => {
        const x = i * 8 + Math.random() * 4;
        return `<path d="M${x},6 L${x + 1},2 L${x + 2},6" fill="#32CD32" opacity="0.8"/>`;
    }).join('')}
            
            ${Array.from({ length: Math.floor(width / 15) }, (_, i) => {
        const x = Math.random() * width;
        const y = 8 + Math.random() * (height - 12);
        return `<circle cx="${x}" cy="${y}" r="1" fill="#A0522D" opacity="0.6"/>`;
    }).join('')}
        </svg>
    `;
}

export function createSpikeSVG(width: number = 8, height: number = 6): string {
    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,${height} ${width/2},0 ${width},${height}" fill="#DC143C" stroke="#8B0000" stroke-width="0.5"/>
        </svg>
    `;
}
 */