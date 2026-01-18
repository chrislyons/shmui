/**
 * Math utilities for audio visualization components.
 * Centralizes common math operations used across multiple components.
 */

/**
 * Clamps a value between 0 and 1, handling non-finite values.
 * @param n - The value to clamp
 * @returns The clamped value between 0 and 1
 */
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/**
 * Clamps a value between min and max bounds.
 * @param value - The value to clamp
 * @param min - Minimum bound (default: 0)
 * @param max - Maximum bound (default: 1)
 * @returns The clamped value
 */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Linear interpolation between two values.
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Inverse linear interpolation - finds t given a value between a and b.
 * @param a - Start value
 * @param b - End value
 * @param value - Value to find t for
 * @returns The interpolation factor t
 */
export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0
  return (value - a) / (b - a)
}

/**
 * Remaps a value from one range to another.
 * @param value - The value to remap
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns The remapped value
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = inverseLerp(inMin, inMax, value)
  return lerp(outMin, outMax, t)
}

/**
 * Creates a seeded pseudo-random number generator using the splitmix32 algorithm.
 * Useful for deterministic "random" values in animations.
 * @param seed - The seed value
 * @returns A function that returns the next random number (0-1)
 */
export function splitmix32(seed: number): () => number {
  return function () {
    let a = seed | 0
    a = (a + 0x9e3779b9) | 0
    let t = a ^ (a >>> 16)
    t = Math.imul(t, 0x21f0aaad)
    t = t ^ (t >>> 15)
    t = Math.imul(t, 0x735a2d97)
    seed = a
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
  }
}

/**
 * Creates a simple seeded random function for predictable sequences.
 * @param seedValue - The seed value
 * @returns A pseudo-random number (0-1)
 */
export function seededRandom(seedValue: number): number {
  const x = Math.sin(seedValue) * 10000
  return x - Math.floor(x)
}

/**
 * Normalizes a decibel value to a 0-1 range.
 * @param value - The decibel value
 * @param minDb - Minimum decibel threshold (default: -100)
 * @param maxDb - Maximum decibel threshold (default: -10)
 * @returns Normalized value (0-1)
 */
export function normalizeDb(
  value: number,
  minDb = -100,
  maxDb = -10
): number {
  if (value === -Infinity) return 0
  const db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100
  return Math.sqrt(db)
}

/**
 * Smooth step function for easing transitions.
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Input value
 * @returns Smoothed value (0-1)
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
