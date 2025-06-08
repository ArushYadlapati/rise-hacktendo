export interface Player {
    x: number;
    y: number;
    vy: number;
    touchingPlatform: boolean;
    color: string;
    left: string;
    right: string;
    up: string;
}

const speed: number = 5;
const gravity : number = 0.5;
const velocity: number = -10;

export function updatePlayer(players: Player[], keys: Record<string, boolean>,
                             platforms: { x: number; y: number; width: number;}[]): Player[] {
    return players.map(player => {
        let vx = 0;
        let vy = player.vy + gravity
        let newY = player.y + vy;
        let newX = player.x ;
        let touchingPlatform = false;

        if (keys[player.left]) {
            vx -= speed;
        }
        if (keys[player.right]) {
            vx += speed;
        }

        newX += vx;
        newX = Math.max(0, Math.min(newX, 780));

        for (const platform of platforms) {
            const playerLeft = newX;
            const playerRight = newX + 20;
            const playerTop = newY;
            const playerBottom = newY + 20;

            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;
            const platformTop = platform.y;
            const platformBottom = platform.y + 20;

            if ((playerRight > platformLeft && playerLeft < platformRight)
                && (playerBottom >= platformTop && playerBottom <= platformBottom + 5
                    && vy > 0)
                ) {

                vy = 0;
                newY = platformTop - 20;
                touchingPlatform = true;
                break;
            }
        }

        if (touchingPlatform && keys[player.up]) {
            vy = velocity;
            newY += vy;
            touchingPlatform = false;
        }
        return {
            ...player,
            x: player.x + vx,
            y: newY,
            vy,
            touchingPlatform
        };
    });
}

export function getWinner(players: Player[]): string {

    if (players.length > 1) {
        if (players[0].y < players[1].y) {
            return (players[0].color +" Wins!");
        } else if (players[0].y > players[1].y) {
            return (players[1].color +" Wins!");
        }
    }

    return "Tie! Great!";
}