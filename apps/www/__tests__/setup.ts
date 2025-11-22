/**
 * Test setup file for Shmui
 * Provides mocks for Web Audio API, Canvas, MediaStream, and other browser APIs
 */

import { vi } from "vitest"
import "@testing-library/jest-dom/vitest"

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number
})

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id)
})

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock Web Audio API
export class MockAnalyserNode {
  fftSize = 2048
  frequencyBinCount = 1024
  minDecibels = -100
  maxDecibels = -30
  smoothingTimeConstant = 0.8

  getByteFrequencyData = vi.fn((array: Uint8Array) => {
    // Fill with mock frequency data (simulating audio)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  })

  getByteTimeDomainData = vi.fn((array: Uint8Array) => {
    // Fill with mock waveform data (centered around 128)
    for (let i = 0; i < array.length; i++) {
      array[i] = 128 + Math.floor(Math.random() * 50 - 25)
    }
  })

  getFloatFrequencyData = vi.fn((array: Float32Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = -100 + Math.random() * 70
    }
  })

  getFloatTimeDomainData = vi.fn((array: Float32Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.random() * 2 - 1
    }
  })

  connect = vi.fn().mockReturnThis()
  disconnect = vi.fn()
}

export class MockGainNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect = vi.fn().mockReturnThis()
  disconnect = vi.fn()
}

export class MockMediaStreamAudioSourceNode {
  connect = vi.fn().mockReturnThis()
  disconnect = vi.fn()
}

export class MockAudioContext {
  state: AudioContextState = "running"
  sampleRate = 44100
  currentTime = 0
  destination = {}

  createAnalyser = vi.fn(() => new MockAnalyserNode())
  createGain = vi.fn(() => new MockGainNode())
  createMediaStreamSource = vi.fn(() => new MockMediaStreamAudioSourceNode())
  createMediaElementSource = vi.fn(() => ({
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  }))
  createOscillator = vi.fn(() => ({
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440 },
  }))

  resume = vi.fn().mockResolvedValue(undefined)
  suspend = vi.fn().mockResolvedValue(undefined)
  close = vi.fn().mockResolvedValue(undefined)

  decodeAudioData = vi.fn().mockResolvedValue({
    duration: 10,
    length: 441000,
    numberOfChannels: 2,
    sampleRate: 44100,
    getChannelData: vi.fn(() => new Float32Array(441000)),
  })
}

global.AudioContext = MockAudioContext as unknown as typeof AudioContext
global.webkitAudioContext = MockAudioContext as unknown as typeof AudioContext

// Mock MediaStream API
export class MockMediaStream {
  id = "mock-stream-id"
  active = true

  getTracks = vi.fn(() => [
    {
      kind: "audio",
      id: "mock-track-id",
      enabled: true,
      stop: vi.fn(),
      getSettings: vi.fn(() => ({
        channelCount: 1,
        sampleRate: 44100,
      })),
    },
  ])

  getAudioTracks = vi.fn(() => this.getTracks())
  getVideoTracks = vi.fn(() => [])
  addTrack = vi.fn()
  removeTrack = vi.fn()
}

global.MediaStream = MockMediaStream as unknown as typeof MediaStream

// Mock navigator.mediaDevices
Object.defineProperty(navigator, "mediaDevices", {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
    enumerateDevices: vi.fn().mockResolvedValue([
      {
        deviceId: "default",
        kind: "audioinput",
        label: "Default Microphone",
        groupId: "default",
      },
    ]),
  },
  writable: true,
})

// Mock Canvas API
export class MockCanvasRenderingContext2D {
  canvas = { width: 800, height: 600 }
  fillStyle = "#000000"
  strokeStyle = "#000000"
  lineWidth = 1
  lineCap: CanvasLineCap = "butt"
  lineJoin: CanvasLineJoin = "miter"
  globalAlpha = 1
  globalCompositeOperation: GlobalCompositeOperation = "source-over"
  font = "10px sans-serif"
  textAlign: CanvasTextAlign = "start"
  textBaseline: CanvasTextBaseline = "alphabetic"

  // Drawing methods
  fillRect = vi.fn()
  strokeRect = vi.fn()
  clearRect = vi.fn()
  fill = vi.fn()
  stroke = vi.fn()
  beginPath = vi.fn()
  closePath = vi.fn()
  moveTo = vi.fn()
  lineTo = vi.fn()
  arc = vi.fn()
  arcTo = vi.fn()
  quadraticCurveTo = vi.fn()
  bezierCurveTo = vi.fn()
  rect = vi.fn()
  roundRect = vi.fn()
  ellipse = vi.fn()

  // Text methods
  fillText = vi.fn()
  strokeText = vi.fn()
  measureText = vi.fn(() => ({ width: 50 }))

  // Transformation methods
  save = vi.fn()
  restore = vi.fn()
  scale = vi.fn()
  rotate = vi.fn()
  translate = vi.fn()
  transform = vi.fn()
  setTransform = vi.fn()
  resetTransform = vi.fn()

  // Gradient and pattern
  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }))
  createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }))
  createPattern = vi.fn()

  // Image methods
  drawImage = vi.fn()
  createImageData = vi.fn()
  getImageData = vi.fn(() => ({
    data: new Uint8ClampedArray(800 * 600 * 4),
    width: 800,
    height: 600,
  }))
  putImageData = vi.fn()

  // Clipping
  clip = vi.fn()

  // Pixel manipulation
  isPointInPath = vi.fn(() => false)
  isPointInStroke = vi.fn(() => false)
}

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(function (
  this: HTMLCanvasElement,
  contextId: string
) {
  if (contextId === "2d") {
    const ctx = new MockCanvasRenderingContext2D()
    ctx.canvas = { width: this.width, height: this.height } as HTMLCanvasElement
    return ctx as unknown as CanvasRenderingContext2D
  }
  if (contextId === "webgl" || contextId === "webgl2") {
    return {
      canvas: this,
      drawingBufferWidth: this.width,
      drawingBufferHeight: this.height,
      getExtension: vi.fn(),
      getParameter: vi.fn(),
      createShader: vi.fn(),
      createProgram: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
      drawArrays: vi.fn(),
      clear: vi.fn(),
      clearColor: vi.fn(),
      viewport: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      blendFunc: vi.fn(),
    } as unknown as WebGLRenderingContext
  }
  return null
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,")
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob([""], { type: "image/png" }))
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url")
global.URL.revokeObjectURL = vi.fn()

// Mock fetch for any API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
  text: vi.fn().mockResolvedValue(""),
  blob: vi.fn().mockResolvedValue(new Blob()),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
})

// Mock HTMLMediaElement
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  value: vi.fn().mockResolvedValue(undefined),
})

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  value: vi.fn(),
})

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  value: vi.fn(),
})

// Export test utilities
export const createMockAudioContext = () => new MockAudioContext()
export const createMockAnalyser = () => new MockAnalyserNode()
export const createMockMediaStream = () => new MockMediaStream()
export const createMockCanvas2DContext = () => new MockCanvasRenderingContext2D()

// Helper to simulate audio data
export const simulateAudioData = (
  analyser: MockAnalyserNode,
  options: {
    amplitude?: number // 0-255 for byte data
    frequency?: number // dominant frequency bin
  } = {}
) => {
  const { amplitude = 128, frequency = 10 } = options

  analyser.getByteFrequencyData.mockImplementation((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      // Create a peak at the specified frequency
      const distance = Math.abs(i - frequency)
      array[i] = Math.max(0, amplitude - distance * 5)
    }
  })

  analyser.getByteTimeDomainData.mockImplementation((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      // Simulate a sine wave
      array[i] = 128 + Math.sin((i / array.length) * Math.PI * 2) * (amplitude / 2)
    }
  })
}

// Helper to advance timers and animation frames
export const advanceTimersAndFrames = async (ms: number) => {
  vi.advanceTimersByTime(ms)
  await Promise.resolve() // flush microtasks
}
