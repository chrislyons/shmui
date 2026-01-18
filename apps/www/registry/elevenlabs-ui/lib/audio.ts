/**
 * Audio analysis utilities for visualization components.
 * Provides shared functions for Web Audio API operations.
 */

import type { AudioAnalyserOptions } from "./types"

/**
 * Creates a Web Audio API analyser connected to a media stream.
 * @param mediaStream - The media stream to analyze
 * @param options - Analyser configuration options
 * @returns Object containing analyser, audio context, and cleanup function
 */
export function createAudioAnalyser(
  mediaStream: MediaStream,
  options: AudioAnalyserOptions = {}
): {
  analyser: AnalyserNode
  audioContext: AudioContext
  cleanup: () => void
} {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext

  const audioContext = new AudioContextClass()
  const source = audioContext.createMediaStreamSource(mediaStream)
  const analyser = audioContext.createAnalyser()

  // Apply options
  if (options.fftSize) analyser.fftSize = options.fftSize
  if (options.smoothingTimeConstant !== undefined) {
    analyser.smoothingTimeConstant = options.smoothingTimeConstant
  }
  if (options.minDecibels !== undefined) {
    analyser.minDecibels = options.minDecibels
  }
  if (options.maxDecibels !== undefined) {
    analyser.maxDecibels = options.maxDecibels
  }

  source.connect(analyser)

  const cleanup = () => {
    source.disconnect()
    if (audioContext.state !== "closed") {
      audioContext.close()
    }
  }

  return { analyser, audioContext, cleanup }
}

/**
 * Calculates RMS volume from frequency data.
 * @param dataArray - Uint8Array of frequency data
 * @returns Normalized volume (0-1)
 */
export function calculateRmsVolume(dataArray: Uint8Array): number {
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    const a = dataArray[i]
    sum += a * a
  }
  return Math.sqrt(sum / dataArray.length) / 255
}

/**
 * Calculates average volume from frequency data.
 * @param dataArray - Uint8Array of frequency data
 * @returns Normalized average (0-1)
 */
export function calculateAverageVolume(dataArray: Uint8Array): number {
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i]
  }
  return sum / dataArray.length / 255
}

/**
 * Creates a throttled animation loop with configurable update rate.
 * @param callback - Function to call on each update
 * @param updateInterval - Minimum time between updates in ms
 * @returns Object with start and stop methods
 */
export function createAnimationLoop(
  callback: (timestamp: number) => void,
  updateInterval: number
): {
  start: () => void
  stop: () => void
} {
  let frameId: number | undefined
  let lastUpdate = 0

  const animate = (timestamp: number) => {
    if (timestamp - lastUpdate >= updateInterval) {
      callback(timestamp)
      lastUpdate = timestamp
    }
    frameId = requestAnimationFrame(animate)
  }

  return {
    start: () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animate)
      }
    },
    stop: () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
        frameId = undefined
      }
    },
  }
}

/**
 * Checks if values have changed significantly (for throttling state updates).
 * @param current - Current values
 * @param previous - Previous values
 * @param threshold - Minimum change threshold
 * @returns True if values have changed beyond threshold
 */
export function hasSignificantChange(
  current: number[],
  previous: number[],
  threshold = 0.01
): boolean {
  if (current.length !== previous.length) return true

  for (let i = 0; i < current.length; i++) {
    if (Math.abs(current[i] - previous[i]) > threshold) {
      return true
    }
  }
  return false
}
