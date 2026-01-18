/**
 * Shared types for audio visualization components.
 * Provides consistent type definitions across the component library.
 */

/**
 * Agent state for voice assistant visualizations.
 * Used by BarVisualizer, Orb, and other voice-enabled components.
 */
export type AgentState =
  | "connecting"
  | "initializing"
  | "listening"
  | "speaking"
  | "thinking"

/**
 * Extended agent state that includes null for the Orb component.
 * Represents idle/disconnected state.
 */
export type OrbAgentState = AgentState | "talking" | null

/**
 * Audio analyzer configuration options.
 */
export interface AudioAnalyserOptions {
  /** FFT size for frequency analysis (power of 2, e.g., 32, 64, 128, 256) */
  fftSize?: number
  /** Smoothing time constant (0-1, higher = smoother) */
  smoothingTimeConstant?: number
  /** Minimum decibels for analysis range */
  minDecibels?: number
  /** Maximum decibels for analysis range */
  maxDecibels?: number
}

/**
 * Multi-band audio analysis options.
 */
export interface MultiBandVolumeOptions {
  /** Number of frequency bands to analyze */
  bands?: number
  /** Low frequency cutoff (Hz bin index) */
  loPass?: number
  /** High frequency cutoff (Hz bin index) */
  hiPass?: number
  /** Update interval in milliseconds */
  updateInterval?: number
  /** Underlying analyser configuration */
  analyserOptions?: AudioAnalyserOptions
}

/**
 * Default options for multi-band volume analysis.
 */
export const DEFAULT_MULTIBAND_OPTIONS: Required<MultiBandVolumeOptions> = {
  bands: 5,
  loPass: 100,
  hiPass: 600,
  updateInterval: 32,
  analyserOptions: { fftSize: 2048 },
}

/**
 * Waveform bar styling configuration.
 */
export interface WaveformBarConfig {
  /** Width of each bar in pixels */
  barWidth?: number
  /** Minimum height of bars in pixels */
  barHeight?: number
  /** Gap between bars in pixels */
  barGap?: number
  /** Border radius of bars in pixels */
  barRadius?: number
  /** Color of bars (CSS color value) */
  barColor?: string
}

/**
 * Matrix frame type - 2D array of brightness values (0-1).
 */
export type Frame = number[][]
