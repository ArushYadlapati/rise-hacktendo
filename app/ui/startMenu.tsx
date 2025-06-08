import React, { useState, useEffect } from 'react';


interface StartMenuProps {
    onGameStart: (colors: string[]) => void;
}

export let StartMenu: React.FC<StartMenuProps> = ({ onGameStart }) => {
    const [useColor, setUseColor] = useState(['red', 'blue']);

    const colors = ["red", "orange", "yellow", "green", "blue", "purple"];

    const handleColorSelect = (playerIndex: number, color: string) => {
        if (useColor[-playerIndex + 1] === color) {
            return;
        }

        const newColors = [...useColor];
        newColors[playerIndex] = color;
        setUseColor(newColors);
    };

    const handleStart = () => {
        onGameStart(useColor);
    };

    useEffect(() => {
        const handleKeyPress = (event: { code: string; preventDefault: () => void; }) => {
            if (event.code === "Space") {
                event.preventDefault();
                handleStart();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [useColor]);

    return (
        <div className="absolute bg-black border-2 border-gray-400 flex flex-col items-center justify-center"
            style={{ width: "800px", height: "600px", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
            <h1 className="text-4xl font-bold mb-8">
                Rise - A Hacktendo Game
            </h1>

            <div className="flex gap-16 mb-8">
                {[0, 1].map(playerIndex => (
                    <div key={ playerIndex } className="text-center">
                        <h3 className="text-xl font-bold mb-4">
                            Player { playerIndex  + 1 }
                        </h3>

                        <div className="flex gap-2 mb-4">
                            { colors.map(color => (
                                <button key={ color } onClick={ () => handleColorSelect(playerIndex, color) } className={`w-12 h-12 border-2 
                                 
                                `}
                                    style={{ backgroundColor: color }} disabled={ useColor[-playerIndex + 1] === color }
                                />
                            ))}
                        </div>

                        <p>
                            Selected: { useColor[playerIndex] }
                        </p>
                    </div>
                ))}
            </div>

            <div className="text-center mb-8">
                <h3 className="text-lg font-bold mb-2">Controls</h3>
                <p>
                    Player 1 (Left): A/D to move, W to jump
                </p>
                <p>
                    Player 2 (Right): Arrow keys to move and jump
                </p>
            </div>

            <button onClick={ handleStart } className="bg-black text-white px-8 py-4 text-xl font-bold">
                Start Game
            </button>

            <p className="mt-4">
                Press Space to start
            </p>
        </div>
    );
};

