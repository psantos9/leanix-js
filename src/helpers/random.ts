/**
 * Get a random floating point number between `min` and `max`.
 * 
 * @param {number} min - min number
 * @param {number} max - max number
 * @param {number} digits - Optional. The number of digits after the decimal point.
 * @return {number} a random floating point number
 */
export const getRandomFloat = (min: number, max: number, digits?: number): number => {
  const value = Math.random() * (max - min) + min
  return digits !== undefined ? Number(value.toFixed(digits)) : value
}

/**
 * Get a random integer between `min` and `max`.
 * 
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} a random integer
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Get a random boolean value.
 * 
 * @return {boolean} a random true/false
 */
export const getRandomBool = (): boolean => {
  return Math.random() >= 0.5
}