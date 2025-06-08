export function capitalize(word : any): string {
    return (word.toString()).substring(0, 1).toUpperCase() + word.slice(1);
}