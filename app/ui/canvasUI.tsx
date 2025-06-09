"use client";

import {createPlatforms, Platform, movePlatforms, startGame, increaseSpeed, setSpeed} from "../game/platforms";
import { useEffect, useRef, useState } from "react";
import {getWinner, Player, updatePlayer} from "../game/player";
import {StartMenu} from "@/app/ui/startMenu";
import {formatTime} from "@/app/game/util";

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

    const [platforms, setPlatforms] = useState<Platform[]>(createPlatforms(30));
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const keys = useRef<Record<string, boolean>>({});
    const animationRef = useRef<number | null>(null);

    const handleGameStart = (selectedColors: string[]) => {
        setPlayers(prevPlayers => [
            { ...prevPlayers[0], color: selectedColors[0] },
            { ...prevPlayers[1], color: selectedColors[1] }
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
        if (!gameStarted || showStartMenu) {
            return;
        }

        const gameLoop = () => {


            // Update timer
            let currentTime;
            if (!gameOver) {
                currentTime = Date.now() - gameStartTime.current;
                setGameTime(currentTime);

                if (currentTime > 10000 * gameLevel) {
                    increaseSpeed();
                    gameLevel++;
                }
            }

            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext("2d");
                if (context) {
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

                    const timerText = formatTime(gameTime);
                    context.font = "24px Arial";
                    context.textAlign = "right";
                    const textWidth = context.measureText(timerText).width;
                    const padding = 10;

                    context.fillStyle = "red";
                    context.fillRect(gameWidth - textWidth - padding * 2 - 10, 10, textWidth + padding * 2, 34);

                    context.fillStyle = "white";
                    context.fillText(timerText, gameWidth - padding - 10, 35);


                    if (gameOver) {
                        gameLevel = 1;
                        setSpeed(0);

                        context.fillStyle = "rgba(0, 0, 0, 0.7)";
                        context.fillRect(0, 0, gameWidth, gameHeight);

                        context.fillStyle = "white";
                        context.font = "48px Arial";
                        context.textAlign = "center";
                        context.fillText(getWinner(players), gameWidth / 2, gameHeight / 2);
                        context.font = "24px Arial";
                        context.fillText("Time Lasted: " + timerText, gameWidth / 2, gameHeight / 2 + 50);
                        context.fillText("Press spacebar to play again", gameWidth / 2, gameHeight / 2 + 100);
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
    }, [players, platforms, gameOver, gameStarted, showStartMenu, gameTime]);

    return (
        <div
            className="absolute bg-black border-2 border-gray-400 flex flex-col items-center justify-center"
            style={{ width: '800px', height: '600px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
            { showStartMenu && (
                <StartMenu onGameStart={ handleGameStart } />
            ) }
            <canvas
                ref={ canvasRef }
                width={ gameWidth }
                height={ gameHeight }
                className="border-2 border-gray-400 bg-sky-200"
            />
        </div>
    );
}