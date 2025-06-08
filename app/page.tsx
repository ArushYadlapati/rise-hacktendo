import GameCanvas from "@/app/game/canvasUI";
import StartMenu from "@/app/game/startMenu";

export default function Game() {
    return (
        <div className="min-h screen bg-black flex items-center justify-center">
            <GameCanvas/>
      </div>
    );
}
