/**
 * Maps a value from one range to another
 * @param value The input value to map
 * @param inMin The minimum of the input range
 * @param inMax The maximum of the input range
 * @param outMin The minimum of the output range
 * @param outMax The maximum of the output range
 * @returns The mapped value
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  // First clamp the value to the input range
  const clampedValue = Math.max(inMin, Math.min(inMax, value));
  
  // Calculate the normalized position in the input range (0 to 1)
  const normalized = (clampedValue - inMin) / (inMax - inMin);
  
  // Map to the output range
  return outMin + normalized * (outMax - outMin);
};

/**
 * Smooths transitions between audio data frames
 * @param currentData Current audio data array
 * @param previousData Previous audio data array
 * @param smoothingFactor Smoothing factor (0-1), higher = more smoothing
 * @returns Smoothed audio data array
 */
export const smoothAudioData = (
  currentData: Uint8Array,
  previousData: Uint8Array | null,
  smoothingFactor: number = 0.3
): Uint8Array => {
  if (!previousData) return currentData;
  
  const result = new Uint8Array(currentData.length);
  
  for (let i = 0; i < currentData.length; i++) {
    result[i] = previousData[i] * smoothingFactor + currentData[i] * (1 - smoothingFactor);
  }
  
  return result;
};

/**
 * Normalizes audio data to a given range
 * @param data Audio data array
 * @param min Minimum output value
 * @param max Maximum output value
 * @returns Normalized audio data array
 */
export const normalizeAudioData = (
  data: Uint8Array,
  min: number = 0,
  max: number = 1
): number[] => {
  // Find the actual min/max in the data
  let dataMin = 255;
  let dataMax = 0;
  
  for (let i = 0; i < data.length; i++) {
    dataMin = Math.min(dataMin, data[i]);
    dataMax = Math.max(dataMax, data[i]);
  }
  
  // If all values are the same, return a flat array
  if (dataMax === dataMin) {
    return Array(data.length).fill((min + max) / 2);
  }
  
  // Normalize the values
  return Array.from(data).map(value => 
    mapRange(value, dataMin, dataMax, min, max)
  );
};