import { BASE_PALETTE } from 'shared/types/colors';

export function hashStringToSeed(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

export function generateId(): string {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2) + '-' + Date.now();
}

export function getRandomColor(): string {
  const colors = BASE_PALETTE;

  return colors[Math.floor(Math.random() * colors.length)];
}
  
export function getRandomStrokeWidth(): number {
  return getRandomFromArray([3, 4, 5]);
}

export function getRandom(min: number, max: number, int = false): number {
  const rand = Math.random() * (max - min) + min;

  return int ? Math.floor(rand) : rand;
}

export function getRandomFromArray<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Array must not be empty');
  }

  const idx = Math.floor(Math.random() * arr.length);
  
  return arr[idx];
}
