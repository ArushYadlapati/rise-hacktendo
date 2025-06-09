import { gameWidth, gameHeight } from "@/app/ui/canvasUI";

const platformSpacing = 70;

export let riseSpeed = 0;
let startSpeed = 0.125;

export interface Spike {
    x: number;
    width: number;
}

export interface Cannon {
    x: number;
    y: number;
    side: "left" | "right";
    lastShot: number;
    shootInterval: number;
}

export interface Projectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

export interface Platform {
    x: number;
    y: number;
    width: number;
    spikes?: Spike[];
    cannons?: Cannon[];
}

let projectiles: Projectile[] = [];

export function startGame() {
    if (riseSpeed == 0) {
        riseSpeed = startSpeed;
    }
    projectiles = [];
}

export function increaseSpeed() {
    riseSpeed += 0.125;
}

export function setSpeed(speed: number) {
    riseSpeed = speed;
}

function createSpikes(platformWidth: number): Spike[] {
    const spikes: Spike[] = [];
    const spikeWidth = 8;
    const maxSpikes = Math.floor(platformWidth / 30);
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

function createCannons(platformWidth: number, platformY: number): Cannon[] {
    const cannons: Cannon[] = [];

    if (Math.random() < 0.3) {
        const numCannons = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numCannons; i++) {
            const side = Math.random() < 0.5 ? "left" : "right";
            const x = side === 'left' ? 5 : platformWidth - 15;
            const shootInterval = 2000 + Math.random() * 3000;

            cannons.push({
                x,
                y: platformY - 10,
                side,
                lastShot: 0,
                shootInterval
            });
        }
    }

    return cannons;
}

export function createPlatforms(num: number): Platform[] {
    const platforms: Platform[] = [];

    platforms.push({
        x: 0,
        y: gameHeight - 30,
        width: gameWidth,
    });

    for (let i = 1; i < num; i++) {
        let numPlatform = (Math.random() * 3) + 3;

        for (let j = 0; j < numPlatform; j++) {
            const width: number = (Math.random() * 120) + 80;
            const x: number = Math.random() * (gameWidth - width);
            const y: number = gameHeight - (i * platformSpacing) - 50;

            const platform: Platform = { x, y, width };

            if (Math.random() < 0.3) {
                platform.spikes = createSpikes(width);
            }

            if (i > 1) {
                platform.cannons = createCannons(width, y);
            }

            platforms.push(platform);
        }
    }

    return platforms;
}

export function movePlatforms(platforms: Platform[]): Platform[] {
    let newPlatforms = platforms.map((platform: Platform) => ({
        ...platform,
        y: platform.y + riseSpeed,
        cannons: platform.cannons?.map(cannon => ({
            ...cannon,
            y: cannon.y + riseSpeed
        }))
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

        const maxPlatforms = Math.floor(Math.random() * 4) + 3;
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

            platform.cannons = createCannons(width, newY);

            newPlatforms.push(platform as Required<Platform>);
        }
    }

    return newPlatforms;
}

export function updateCannon(platforms: Platform[], currentTime: number): void {
    platforms.forEach(platform => {
        if (platform.cannons) {
            platform.cannons.forEach(cannon => {
                if (currentTime - cannon.lastShot > cannon.shootInterval) {
                    const projectileSpeed = 3;
                    const angle = cannon.side === 'left' ? -Math.PI/4 : -3*Math.PI/4; // 45 degrees up and inward

                    projectiles.push({
                        x: platform.x + cannon.x + 5, // Center of cannon
                        y: cannon.y + 5,
                        vx: Math.cos(angle) * projectileSpeed,
                        vy: Math.sin(angle) * projectileSpeed,
                        radius: 4
                    });

                    cannon.lastShot = currentTime;
                }
            });
        }
    });

    projectiles = projectiles.map(projectile => ({
        ...projectile,
        x: projectile.x + projectile.vx,
        y: projectile.y + projectile.vy + riseSpeed,
        vy: projectile.vy + 0.1
    }));

    projectiles = projectiles.filter(projectile =>
        projectile.x > -20 &&
        projectile.x < gameWidth + 20 &&
        projectile.y > -20 &&
        projectile.y < gameHeight + 20
    );
}

export function getProjectiles(): Projectile[] {
    return projectiles;
}

export function checkProjectile(playerX: number, playerY: number, playerWidth: number, playerHeight: number): boolean {
    return projectiles.some(projectile => {
        const dx = (playerX + playerWidth/2) - projectile.x;
        const dy = (playerY + playerHeight/2) - projectile.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        return distance < (projectile.radius + Math.min(playerWidth, playerHeight)/2);
    });
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

export function createCannonSVG(width: number = 10, height: number = 8): string {
    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="6" height="4" fill="#4A4A4A" stroke="#2A2A2A" stroke-width="0.5"/>
            <circle cx="5" cy="2" r="3" fill="#606060" stroke="#2A2A2A" stroke-width="0.5"/>
            <rect x="4" y="0" width="2" height="4" fill="#2A2A2A"/>
        </svg>
    `;
}

export function createProjectileSVG(radius: number = 4): string {
    return `
        <svg width="${radius*2}" height="${radius*2}" viewBox="0 0 ${radius*2} ${radius*2}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${radius}" cy="${radius}" r="${radius-1}" fill="#FF8C00" stroke="#FF4500" stroke-width="1"/>
            <circle cx="${radius-1}" cy="${radius-1}" r="1" fill="#FFD700" opacity="0.8"/>
        </svg>
    `;
}
 */