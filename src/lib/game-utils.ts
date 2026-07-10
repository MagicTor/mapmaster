import { randomBytes } from "crypto";

/**
 * Generate a unique game ID
 */
export function generateGameId(): string {
  return randomBytes(12).toString("hex");
}

/**
 * Convert question types array to URL-safe string (hyphen-separated)
 * @example ["countries", "capitals"] -> "countries-capitals"
 */
export function questionTypesToCombo(types: string[]): string {
  return types.sort().join("-");
}

/**
 * Convert URL-safe combo string to question types array
 * @example "countries-capitals" -> ["countries", "capitals"]
 */
export function comboToQuestionTypes(combo: string): string[] {
  return combo.split("-").filter((t) => t.length > 0);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calculate points based on game result
 */
export function calculateScore(
  livesRemaining: number,
  incorrectGuesses: number,
  totalCountries: number
): number {
  // Base points for completion
  let score = 1000;

  // Bonus for lives remaining (50 points per life)
  score += livesRemaining * 50;

  // Penalty for incorrect guesses (-10 points per)
  score -= incorrectGuesses * 10;

  // Accuracy bonus (1-100 points based on accuracy)
  const correctGuesses = totalCountries;
  const totalGuesses = correctGuesses + incorrectGuesses;
  const accuracy = totalGuesses > 0 ? correctGuesses / totalGuesses : 1;
  score += Math.floor(accuracy * 100);

  return Math.max(0, score);
}

/**
 * Get all valid question type combinations
 */
export function getAllQuestionCombos(): string[] {
  return [
    "countries",
    "capitals",
    "flags",
    "capitals-countries",
    "countries-flags",
    "capitals-flags",
    "capitals-countries-flags",
  ];
}

/**
 * Get all valid regions
 */
export function getAllRegions(): string[] {
  return [
    "North America",
    "South America",
    "Asia",
    "Europe",
    "Oceania",
    "Africa",
    "World",
  ];
}

/**
 * Validate region name
 */
export function isValidRegion(region: string): boolean {
  return getAllRegions().includes(region);
}

/**
 * Validate question types
 */
export function areValidQuestionTypes(types: string[]): boolean {
  if (types.length === 0) return false;
  const valid = ["countries", "capitals", "flags"];
  return types.every((t) => valid.includes(t));
}
