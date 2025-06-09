export function capitalize(word : any): string {
    return (word.toString()).substring(0, 1).toUpperCase() + word.slice(1);
}

export const formatTime = (milliseconds: number): string => {
    const tS = Math.floor(milliseconds / 1000);
    const m = Math.floor(tS / 60);
    const s = tS % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${ m.toString().padStart(2, '0') }:${ s.toString().padStart(2, '0') }.${ ms.toString().padStart(2, '0') }`;
};