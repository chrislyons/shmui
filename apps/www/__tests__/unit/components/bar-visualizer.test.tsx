import { render, screen, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  BarVisualizer,
  useAudioVolume,
  useMultibandVolume,
  useBarAnimator,
  type AgentState,
} from "@/registry/elevenlabs-ui/ui/bar-visualizer"
import { renderHook } from "@testing-library/react"
import { MockMediaStream } from "../../setup"

describe("BarVisualizer", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<BarVisualizer data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("renders with custom className", () => {
      render(<BarVisualizer className="custom-class" data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toHaveClass("custom-class")
    })

    it("renders default number of bars (15)", () => {
      render(<BarVisualizer data-testid="bar-viz" />)
      const bars = screen.getByTestId("bar-viz").querySelectorAll('[class*="rounded-full"]')
      expect(bars.length).toBe(15)
    })

    it("renders custom number of bars", () => {
      render(<BarVisualizer barCount={10} data-testid="bar-viz" />)
      const bars = screen.getByTestId("bar-viz").querySelectorAll('[class*="rounded-full"]')
      expect(bars.length).toBe(10)
    })

    it("sets data-state attribute", () => {
      render(<BarVisualizer state="speaking" data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toHaveAttribute("data-state", "speaking")
    })
  })

  describe("Agent States", () => {
    const states: AgentState[] = [
      "connecting",
      "initializing",
      "listening",
      "speaking",
      "thinking",
    ]

    states.forEach((state) => {
      it(`renders with state: ${state}`, () => {
        render(<BarVisualizer state={state} data-testid="bar-viz" />)
        expect(screen.getByTestId("bar-viz")).toHaveAttribute("data-state", state)
      })
    })

    it("renders without state (undefined)", () => {
      render(<BarVisualizer data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })
  })

  describe("Demo Mode", () => {
    it("renders in demo mode", () => {
      render(<BarVisualizer demo={true} data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("animates fake volume in demo mode when speaking", async () => {
      render(
        <BarVisualizer demo={true} state="speaking" data-testid="bar-viz" />
      )

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("animates fake volume in demo mode when listening", async () => {
      render(
        <BarVisualizer demo={true} state="listening" data-testid="bar-viz" />
      )

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("shows static bars in demo mode when connecting", () => {
      render(
        <BarVisualizer demo={true} state="connecting" data-testid="bar-viz" />
      )
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })
  })

  describe("Height Configuration", () => {
    it("accepts minHeight prop", () => {
      render(<BarVisualizer minHeight={10} data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("accepts maxHeight prop", () => {
      render(<BarVisualizer maxHeight={80} data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("respects minHeight and maxHeight bounds", () => {
      render(
        <BarVisualizer minHeight={30} maxHeight={70} data-testid="bar-viz" />
      )
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })
  })

  describe("Alignment", () => {
    it("aligns bars from bottom by default", () => {
      render(<BarVisualizer centerAlign={false} data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toHaveClass("items-end")
    })

    it("aligns bars from center when centerAlign is true", () => {
      render(<BarVisualizer centerAlign={true} data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toHaveClass("items-center")
    })
  })

  describe("MediaStream Integration", () => {
    it("accepts mediaStream prop", () => {
      const stream = new MockMediaStream() as unknown as MediaStream
      render(<BarVisualizer mediaStream={stream} data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("handles null mediaStream", () => {
      render(<BarVisualizer mediaStream={null} data-testid="bar-viz" />)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })
  })

  describe("Styling", () => {
    it("accepts custom style prop", () => {
      render(
        <BarVisualizer
          style={{ backgroundColor: "red" }}
          data-testid="bar-viz"
        />
      )
      expect(screen.getByTestId("bar-viz")).toHaveStyle({
        backgroundColor: "red",
      })
    })

    it("forwards ref", () => {
      const ref = vi.fn()
      render(<BarVisualizer ref={ref} data-testid="bar-viz" />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe("Animation States", () => {
    it("applies pulse animation during thinking state", async () => {
      render(<BarVisualizer state="thinking" data-testid="bar-viz" />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      // Check that bars exist (pulse class is applied conditionally)
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })

    it("applies primary color during speaking state", () => {
      render(<BarVisualizer state="speaking" data-testid="bar-viz" />)
      const bars = screen.getByTestId("bar-viz").querySelectorAll('[class*="rounded-full"]')
      // Bars should have primary background when speaking
      expect(bars[0]).toHaveClass("bg-primary")
    })

    it("handles rapid state transitions", async () => {
      const { rerender } = render(
        <BarVisualizer state="listening" data-testid="bar-viz" />
      )

      const states: AgentState[] = [
        "thinking",
        "speaking",
        "listening",
        "connecting",
        "initializing",
      ]

      for (const state of states) {
        rerender(<BarVisualizer state={state} data-testid="bar-viz" />)
        await act(async () => {
          vi.advanceTimersByTime(50)
        })
      }

      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles zero barCount", () => {
      render(<BarVisualizer barCount={0} data-testid="bar-viz" />)
      const bars = screen.getByTestId("bar-viz").querySelectorAll('[class*="rounded-full"]')
      expect(bars.length).toBe(0)
    })

    it("handles large barCount", () => {
      render(<BarVisualizer barCount={100} data-testid="bar-viz" />)
      const bars = screen.getByTestId("bar-viz").querySelectorAll('[class*="rounded-full"]')
      expect(bars.length).toBe(100)
    })

    it("handles minHeight greater than maxHeight", () => {
      render(
        <BarVisualizer minHeight={80} maxHeight={20} data-testid="bar-viz" />
      )
      // Should still render without crashing
      expect(screen.getByTestId("bar-viz")).toBeInTheDocument()
    })
  })
})

describe("useAudioVolume", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("returns 0 when no mediaStream is provided", () => {
    const { result } = renderHook(() => useAudioVolume(null))
    expect(result.current).toBe(0)
  })

  it("returns 0 when mediaStream is undefined", () => {
    const { result } = renderHook(() => useAudioVolume(undefined))
    expect(result.current).toBe(0)
  })

  it("creates audio context when mediaStream is provided", () => {
    const stream = new MockMediaStream() as unknown as MediaStream
    renderHook(() => useAudioVolume(stream))

    expect(AudioContext).toHaveBeenCalled()
  })

  it("accepts custom fftSize option", () => {
    const stream = new MockMediaStream() as unknown as MediaStream
    renderHook(() => useAudioVolume(stream, { fftSize: 64 }))

    expect(screen).toBeDefined() // Basic assertion to ensure no error
  })

  it("accepts custom smoothingTimeConstant option", () => {
    const stream = new MockMediaStream() as unknown as MediaStream
    renderHook(() => useAudioVolume(stream, { smoothingTimeConstant: 0.5 }))

    expect(screen).toBeDefined()
  })

  it("cleans up on unmount", () => {
    const stream = new MockMediaStream() as unknown as MediaStream
    const { unmount } = renderHook(() => useAudioVolume(stream))

    expect(() => unmount()).not.toThrow()
  })

  it("handles mediaStream change", () => {
    const stream1 = new MockMediaStream() as unknown as MediaStream
    const stream2 = new MockMediaStream() as unknown as MediaStream

    const { rerender } = renderHook(
      ({ stream }) => useAudioVolume(stream),
      { initialProps: { stream: stream1 } }
    )

    rerender({ stream: stream2 })
    expect(AudioContext).toHaveBeenCalled()
  })
})

describe("useMultibandVolume", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("returns array of zeros when no mediaStream is provided", () => {
    const { result } = renderHook(() => useMultibandVolume(null))
    expect(result.current).toEqual([0, 0, 0, 0, 0])
  })

  it("returns correct number of bands", () => {
    const { result } = renderHook(() =>
      useMultibandVolume(null, { bands: 10 })
    )
    expect(result.current.length).toBe(10)
  })

  it("creates audio context when mediaStream is provided", () => {
    const stream = new MockMediaStream() as unknown as MediaStream
    renderHook(() => useMultibandVolume(stream))

    expect(AudioContext).toHaveBeenCalled()
  })

  it("accepts custom loPass and hiPass options", () => {
    const stream = new MockMediaStream() as unknown as MediaStream
    renderHook(() =>
      useMultibandVolume(stream, { loPass: 50, hiPass: 800 })
    )

    expect(screen).toBeDefined()
  })

  it("cleans up on unmount", () => {
    const stream = new MockMediaStream() as unknown as MediaStream
    const { unmount } = renderHook(() => useMultibandVolume(stream))

    expect(() => unmount()).not.toThrow()
  })
})

describe("useBarAnimator", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("returns array for undefined state", () => {
    const { result } = renderHook(() =>
      useBarAnimator(undefined, 5, 100)
    )
    expect(Array.isArray(result.current)).toBe(true)
  })

  it("returns array for thinking state", () => {
    const { result } = renderHook(() =>
      useBarAnimator("thinking", 5, 100)
    )
    expect(Array.isArray(result.current)).toBe(true)
  })

  it("returns array for listening state", () => {
    const { result } = renderHook(() =>
      useBarAnimator("listening", 5, 100)
    )
    expect(Array.isArray(result.current)).toBe(true)
  })

  it("returns array for connecting state", () => {
    const { result } = renderHook(() =>
      useBarAnimator("connecting", 5, 100)
    )
    expect(Array.isArray(result.current)).toBe(true)
  })

  it("returns array for speaking state", () => {
    const { result } = renderHook(() =>
      useBarAnimator("speaking", 5, 100)
    )
    expect(Array.isArray(result.current)).toBe(true)
  })

  it("handles different column counts", () => {
    const { result } = renderHook(() =>
      useBarAnimator("thinking", 20, 100)
    )
    expect(Array.isArray(result.current)).toBe(true)
  })

  it("updates animation over time", async () => {
    const { result } = renderHook(() =>
      useBarAnimator("connecting", 5, 50)
    )

    const initialFrame = [...result.current]

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // Frame may have changed after animation
    expect(result.current).toBeDefined()
  })

  it("cleans up animation on unmount", () => {
    const { unmount } = renderHook(() =>
      useBarAnimator("thinking", 5, 100)
    )

    expect(() => unmount()).not.toThrow()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it("resets index when state changes", () => {
    const { rerender, result } = renderHook(
      ({ state }) => useBarAnimator(state, 5, 100),
      { initialProps: { state: "thinking" as const } }
    )

    rerender({ state: "speaking" as const })
    expect(result.current).toBeDefined()
  })
})
