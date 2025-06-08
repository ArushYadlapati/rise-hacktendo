"use client";

import {createPlatforms, Platform, movePlatforms, startGame} from "./platforms";
import { useEffect, useRef, useState } from "react";
import {getWinner, Player, updatePlayer} from "./player";
import StartMenu from "@/app/game/startMenu";

export const gameWidth = 800;
export const gameHeight = 600;

export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [players, setPlayers] = useState<Player[]>([
        {
            x: 100,
            y: gameHeight - 50,
            vy: 0,
            touchingPlatform: false,
            color: "orange",
            left: "a",
            right: "d",
            up: "w"
        },
        {
            x: 600,
            y: gameHeight - 50,
            vy: 0,
            touchingPlatform: false,
            color: "yellow",
            left: "ArrowLeft",
            right: "ArrowRight",
            up: "ArrowUp"
        }
    ]);

    const [platforms, setPlatforms] = useState<Platform[]>(createPlatforms(15));
    const [gameOver, setGameOver] = useState(false);
    const [gameStart, setGameStart] = useState(false);
    const keys = useRef<Record<string, boolean>>({});
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            keys.current[event.key] = true;
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            keys.current[event.key] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const gameLoop = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext("2d");
                if (context) {
                    if (gameStart) {
                        context.fillStyle = "red";
                        context.font = "48px Arial";
                        context.textAlign = "center";
                        context.fillText("RISE: A HACKTENDO GAME", gameWidth / 2, gameHeight / 2 - 50);
                        context.font = "24px Arial";
                        context.fillText("Press spacebar to start", gameWidth / 2, gameHeight / 2 + 50);
                    }

                    context.fillStyle = "#87CEEB";
                    context.fillRect(0, 0, gameWidth, gameHeight);

                    context.fillStyle = "black";
                    platforms.forEach(platform => {
                        context.fillRect(platform.x, platform.y, platform.width, 5);
                    });

                    players.forEach(player => {
                        context.fillStyle = player.color;
                        context.fillRect(player.x, player.y, 20, 20);
                    });

                    if (gameOver) {
                        context.fillStyle = "red";
                        context.font = "48px Arial";
                        context.textAlign = "center";
                        context.fillText(getWinner(players), gameWidth / 2, gameHeight / 2);
                        context.font = "24px Arial";
                        context.fillText("Press spacebar to play again", gameWidth / 2, gameHeight / 2 + 50);
                        if (keys.current[" "]) {
                            setGameOver(false);
                            setPlayers([
                                {
                                    x: 100,
                                    y: gameHeight - 50,
                                    vy: 0,
                                    touchingPlatform: false,
                                    color: "orange",
                                    left: "a",
                                    right: "d",
                                    up: "w"
                                },
                                {
                                    x: 600,
                                    y: gameHeight - 50,
                                    vy: 0,
                                    touchingPlatform: false,
                                    color: "yellow",
                                    left: "ArrowLeft",
                                    right: "ArrowRight",
                                    up: "ArrowUp"
                                }
                            ]);
                            setPlatforms(createPlatforms(15));
                        }
                    }
                }
            }

            if (!gameOver) {
                const updatedPlayers = updatePlayer(players, keys.current, platforms);

                const playersAlive = updatedPlayers.filter(player => player.y < gameHeight + 50);

                if (!gameStart) {
                    setGameStart(true);
                }
                if (playersAlive.length < updatedPlayers.length) {
                    setGameOver(true);
                    // setGameOver(false);
                } else {
                    setPlayers(updatedPlayers);

                    const updatedPlatforms = movePlatforms(platforms);
                    setPlatforms(updatedPlatforms);
                }
            }

            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);


        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [players, platforms, gameOver]);
    // }, [players, platforms]);

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-2xl font-bold">
                Rise - A Hacktendo Game
            </h1>
            <div className="text-sm text-white">
                <p>
                    Green Player: WASD keys | Yellow Player: Arrow keys
                </p>
            </div>
            <canvas ref={ canvasRef }  width={ gameWidth } height={ gameHeight }
                className="border-2 border-gray-400 bg-black"
            />
        </div>
    );
}