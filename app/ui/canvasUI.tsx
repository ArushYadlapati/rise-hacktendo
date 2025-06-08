"use client";

import {createPlatforms, Platform, movePlatforms, startGame} from "../game/platforms";
import { useEffect, useRef, useState } from "react";
import {getWinner, Player, updatePlayer} from "../game/player";
import {StartMenu} from "@/app/ui/startMenu";

export const gameWidth = 800;
export const gameHeight = 600;

export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showStartMenu, setShowStartMenu] = useState(true);
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
    const [gameStarted, setGameStarted] = useState(false);
    const keys = useRef<Record<string, boolean>>({});
    const animationRef = useRef<number | null>(null);

    // Handle game start from menu
    const handleGameStart = (selectedColors: string[]) => {
        // Update player colors with selected colors
        setPlayers(prevPlayers => [
            { ...prevPlayers[0], color: selectedColors[0] },
            { ...prevPlayers[1], color: selectedColors[1] }
        ]);

        // Hide start menu and start the game
        setShowStartMenu(false);
        setGameStarted(true);

        // Call the startGame function from platforms.ts
        startGame();
    };

    // Handle restart game
    const restartGame = () => {
        setGameOver(false);
        setGameStarted(false);
        setShowStartMenu(true);
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
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            keys.current[event.key] = true;

            // Handle spacebar for game over restart
            if (event.key === " " && gameOver) {
                event.preventDefault();
                restartGame();
            }
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
    }, [gameOver]);

    useEffect(() => {
        // Only start game loop if game has started and start menu is not showing
        if (!gameStarted || showStartMenu) {
            return;
        }

        const gameLoop = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext("2d");
                if (context) {
                    // Clear canvas
                    context.fillStyle = "#87CEEB";
                    context.fillRect(0, 0, gameWidth, gameHeight);

                    // Draw platforms
                    context.fillStyle = "black";
                    platforms.forEach(platform => {
                        context.fillRect(platform.x, platform.y, platform.width, 5);
                    });

                    // Draw players
                    players.forEach(player => {
                        context.fillStyle = player.color;
                        context.fillRect(player.x, player.y, 20, 20);
                    });

                    // Draw game over screen
                    if (gameOver) {
                        context.fillStyle = "rgba(0, 0, 0, 0.7)";
                        context.fillRect(0, 0, gameWidth, gameHeight);

                        context.fillStyle = "white";
                        context.font = "48px Arial";
                        context.textAlign = "center";
                        context.fillText(getWinner(players), gameWidth / 2, gameHeight / 2);
                        context.font = "24px Arial";
                        context.fillText("Press spacebar to play again", gameWidth / 2, gameHeight / 2 + 50);
                    }
                }
            }

            if (!gameOver) {
                const updatedPlayers = updatePlayer(players, keys.current, platforms);
                const playersAlive = updatedPlayers.filter(player => player.y < gameHeight + 50);

                if (playersAlive.length < updatedPlayers.length) {
                    setGameOver(true);
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
    }, [players, platforms, gameOver, gameStarted, showStartMenu]);

    return (
        <div
            className="absolute bg-black border-2 border-gray-400 flex flex-col items-center justify-center"
            style={{
                width: '800px',
                height: '600px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }}
        >
            {showStartMenu && (
                <StartMenu onGameStart={handleGameStart} />
            )}
            <canvas
                ref={canvasRef}
                width={gameWidth}
                height={gameHeight}
                className="border-2 border-gray-400 bg-sky-200"
            />
        </div>
    );
}