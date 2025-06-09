"use client";

import { createPlatforms, increaseSpeed, movePlatforms, Platform, riseSpeed, setSpeed, startGame, updateCannonsAndProjectiles, getProjectiles, checkProjectileCollision } from "../game/platforms";
import { useEffect, useRef, useState } from "react";
import { getWinner, Player, updatePlayer } from "../game/player";
import { StartMenu } from "@/app/ui/startMenu";
import { formatTime } from "@/app/game/util";

export const gameWidth = 800;
export const gameHeight = 600;
export let gameLevel = 1;

export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showStartMenu, setShowStartMenu] = useState(true);
    const [gameTime, setGameTime] = useState(0);
    const gameStartTime = useRef<number>(0);
    const [players, setPlayers] = useState<Player[]>([
        {
            x: 100,
            y: gameHeight - 50,
            vy: 0,
            touchingPlatform: false,
            color: "orange",
            left: "a",
            right: "d",
            up: "w",
            spikeSlow: undefined,
        },
        {
            x: 600,
            y: gameHeight - 50,
            vy: 0,
            touchingPlatform: false,
            color: "yellow",
            left: "ArrowLeft",
            right: "ArrowRight",
            up: "ArrowUp",
            spikeSlow: undefined,
        },
    ]);

    const [platforms, setPlatforms] = useState<Platform[]>(createPlatforms(45));
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const keys = useRef<Record<string, boolean>>({});
    const animationRef = useRef<number | null>(null);

    const drawPlatform = (
        ctx: CanvasRenderingContext2D,
        platform: Platform,
    ) => {
        const platformHeight = 20;

        const topC = "#2e8b22";

        ctx.fillStyle = "#7c4a02";
        ctx.fillRect(platform.x, platform.y + 4, platform.width, platformHeight - 4);

        ctx.fillStyle = topC;
        ctx.fillRect(platform.x, platform.y, platform.width, 4);
        
        if (platform.spikes?.length) {
            ctx.fillStyle = "#DC143C";
            ctx.strokeStyle = "#8B0000";
            ctx.lineWidth = 1;

            platform.spikes.forEach((spike) => {
                const sx = platform.x + spike.x;
                const sy = platform.y;
                const h = 12;

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + spike.width / 2, sy - h);
                ctx.lineTo(sx + spike.width, sy);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });
        }

        if (platform.cannons?.length) {
            platform.cannons.forEach((cannon) => {
                const cannonX = platform.x + cannon.x;
                const cannonY = cannon.y;

                ctx.fillStyle = "#4A4A4A";
                ctx.strokeStyle = "#2A2A2A";
                ctx.lineWidth = 1;
                ctx.fillRect(cannonX + 2, cannonY + 4, 6, 4);
                ctx.strokeRect(cannonX + 2, cannonY + 4, 6, 4);

                ctx.fillStyle = "#606060";
                ctx.beginPath();
                ctx.arc(cannonX + 5, cannonY + 2, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#2A2A2A";
                ctx.fillRect(cannonX + 4, cannonY, 2, 4);
            });
        }
    };

    const drawProjectiles = (ctx: CanvasRenderingContext2D) => {
        const projectiles = getProjectiles();

        projectiles.forEach((projectile) => {
            ctx.fillStyle = "#FF8C00";
            ctx.strokeStyle = "#FF4500";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius - 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#FFD700";
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(projectile.x - 1, projectile.y - 1, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    };

    const handleGameStart = (selectedColors: string[]) => {
        setPlayers((prev) => [
            { ...prev[0], color: selectedColors[0] },
            { ...prev[1], color: selectedColors[1] },
        ]);

        setShowStartMenu(false);
        setGameStarted(true);
        gameStartTime.current = Date.now();
        setGameTime(0);

        startGame();
    };

    const restartGame = () => {
        setGameOver(false);
        setGameStarted(false);
        setShowStartMenu(true);
        setGameTime(0);
        setPlayers([
            {
                x: 100,
                y: gameHeight - 50,
                vy: 0,
                touchingPlatform: false,
                color: "orange",
                left: "a",
                right: "d",
                up: "w",
                spikeSlow: undefined,
            },
            {
                x: 600,
                y: gameHeight - 50,
                vy: 0,
                touchingPlatform: false,
                color: "yellow",
                left: "ArrowLeft",
                right: "ArrowRight",
                up: "ArrowUp",
                spikeSlow: undefined,
            },
        ]);

        setPlatforms(createPlatforms(30));
    };

    useEffect(() => {
        const down = (event: KeyboardEvent) => {
            keys.current[event.key] = true;
            if (event.key === " " && gameOver) {
                event.preventDefault();
                restartGame();
            }
        };
        const up = (e: KeyboardEvent) => {
            keys.current[e.key] = false;
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, [gameOver]);

    useEffect(() => {
        if (!gameStarted || showStartMenu) {
            return;
        }

        const loop = () => {
            if (!gameOver) {
                const elapsed = Date.now() - gameStartTime.current;
                setGameTime(elapsed);
                if (elapsed > 10000 * gameLevel) {
                    increaseSpeed();
                    gameLevel += 1;
                }

                updateCannonsAndProjectiles(platforms, Date.now());

                console.log(riseSpeed);
            }

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.fillStyle = "#87CEEB";
                    ctx.fillRect(0, 0, gameWidth, gameHeight);

                    platforms.forEach((p) => drawPlatform(ctx, p));

                    drawProjectiles(ctx);

                    let projectileHit = false;

                    if (!gameOver) {
                        const updatedPlayers = updatePlayer(players, keys.current, platforms);
                        const alive = updatedPlayers.filter((pl) => pl.y < gameHeight + 50);

                        projectileHit = updatedPlayers.some(player =>
                            checkProjectileCollision(player.x, player.y, 20, 20)
                        );

                        if (projectileHit) {
                            updatedPlayers.forEach(player => {
                                player.spikeSlow = Date.now() + 2000;
                            });
                        }

                        if (alive.length < updatedPlayers.length) {
                            setGameOver(true);
                        } else {
                            setPlayers(updatedPlayers);
                            setPlatforms(movePlatforms(platforms));
                        }
                    }

                    const now = Date.now();
                    players.forEach((pl) => {
                        const slowed = pl.spikeSlow && now < pl.spikeSlow;

                        if (slowed) {
                            ctx.fillStyle = "#FF6B6B";
                            ctx.fillRect(pl.x - 2, pl.y - 2, 24, 24);
                        }

                        ctx.fillStyle = pl.color;
                        ctx.fillRect(pl.x, pl.y, 20, 20);

                        ctx.strokeStyle = slowed ? "#FF0000" : "black";
                        ctx.lineWidth = slowed ? 2 : 1;
                        ctx.strokeRect(pl.x, pl.y, 20, 20);
                    });

                    const timeTxt = formatTime(gameTime);
                    ctx.font = "24px Arial";
                    ctx.textAlign = "right";
                    const w = ctx.measureText(timeTxt).width;
                    const pad = 10;
                    ctx.fillStyle = "red";
                    ctx.fillRect(gameWidth - w - pad * 2 - 10, 10, w + pad * 2, 34);
                    ctx.fillStyle = "white";
                    ctx.fillText(timeTxt, gameWidth - pad - 10, 35);

                    if (gameOver) {
                        gameLevel = 1;
                        setSpeed(0);
                        ctx.fillStyle = "rgba(0,0,0,0.7)";
                        ctx.fillRect(0, 0, gameWidth, gameHeight);

                        ctx.fillStyle = "white";
                        ctx.font = "48px Arial";
                        ctx.textAlign = "center";
                        ctx.fillText(getWinner(players), gameWidth / 2, gameHeight / 2);
                        ctx.font = "24px Arial";
                        ctx.fillText(`Time Lasted: ${timeTxt}`, gameWidth / 2, gameHeight / 2 + 50);
                        ctx.fillText("Press spacebar to play again", gameWidth / 2, gameHeight / 2 + 100);
                    }
                }
            }

            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [players, platforms, gameOver, gameStarted, showStartMenu, gameTime]);

    return (
        <div
            className="absolute bg-black border-2 border-gray-400 flex flex-col items-center justify-center"
            style={{ width: `${ gameWidth }px`, height: `${ gameHeight }px`, left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
            }}
        >
            {showStartMenu && <StartMenu onGameStart={handleGameStart} />}

            <canvas ref={ canvasRef } width={ gameWidth } height={ gameHeight } className="border-2 border-gray-400 bg-sky-200"
            />
        </div>
    );
}