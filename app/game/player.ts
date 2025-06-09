import { capitalize } from "@/app/game/util";
import { Platform } from "../game/platforms";

export interface Player {
    x: number;
    y: number;
    vy: number;
    touchingPlatform: boolean;
    color: string;
    left: string;
    right: string;
    up: string;
    spikeSlow?: number;
}

const speed = 6.0;
const gravity = 1;
const yVelocity = -16;
const slowFactor = 0.4;
const spikeY = 12;
const spikeSlow = 2000;

const xMin = 0;
const xMax = 780;


export function updatePlayer(players: Player[], keys: Record<string, boolean>, platforms: Platform[]): Player[] {
    const now = Date.now();

    return players.map((player) => {
        const isSlowed = !!player.spikeSlow && player.spikeSlow > now;

        let spikeSlowTime = isSlowed ? player.spikeSlow : undefined;

        const moveSpeed = isSlowed ? speed * slowFactor : speed;
        const vSpeed = isSlowed ? gravity * (1 / slowFactor) : gravity;
        let vx = 0;
        if (keys[player.left]) vx -= moveSpeed;
        if (keys[player.right]) vx += moveSpeed;

        let vy = player.vy + vSpeed;

        let newX = player.x + vx;
        let newY = player.y + vy;
        let touchingPlatform = false;

        newX = Math.max(xMin, Math.min(newX, xMax));

        for (const platform of platforms) {
            const pLeft = platform.x;
            const pRight = platform.x + platform.width;
            const pTop = platform.y;
            const pBottom = platform.y + 20;

            const plLeft = newX;
            const plRight = newX + 20;
            const plTop = newY;
            const plBottom = newY + 20;

            const xOverlap = plRight > pLeft && plLeft < pRight;

            if (xOverlap && plBottom >= pTop && plTop < pTop && vy > 0) {
                vy = 0;
                newY = pTop - 20;
                touchingPlatform = true;
                break;
            }

            if (xOverlap && plTop <= pBottom && plBottom > pBottom && vy < 0) {
                vy = 0;
                newY = pBottom;
                break;
            }
        }

        for (const platform of platforms) {
            if (!platform.spikes?.length) continue;

            for (const spike of platform.spikes) {
                const sLeft = platform.x + spike.x;
                const sRight = sLeft + spike.width;
                const sTop = platform.y - spikeY;
                const sBottom = platform.y;

                const plLeft = newX;
                const plRight = newX + 20;
                const plTop = newY;
                const plBottom = newY + 20;

                const overlap =
                    plRight > sLeft &&
                    plLeft < sRight &&
                    plBottom > sTop &&
                    plTop < sBottom;

                if (overlap) {
                    spikeSlowTime = now + spikeSlow;
                    break;
                }
            }
            if (spikeSlowTime && spikeSlowTime > now) {
                break;
            }
        }

        if (touchingPlatform && keys[player.up]) {
            vy = yVelocity;
            newY += vy;
            touchingPlatform = false;
        }

        return {
            ...player,
            x: newX,
            y: newY,
            vy,
            touchingPlatform,
            spikeSlow: spikeSlowTime,
        };
    });
}

export function getWinner(players: Player[]): string {
    if (players.length > 1) {
        if (players[0].y < players[1].y) {
            return `${ capitalize(players[0].color) } Wins!`;
        }
        if (players[0].y > players[1].y) {
            return `${ capitalize(players[1].color) } Wins!`;
        }
    }
    return "Tie Game!";
}