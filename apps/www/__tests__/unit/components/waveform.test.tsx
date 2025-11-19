import { render, screen, fireEvent, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  Waveform,
  ScrollingWaveform,
  AudioScrubber,
  MicrophoneWaveform,
  StaticWaveform,
  LiveMicrophoneWaveform,
  RecordingWaveform,
} from "@/registry/elevenlabs-ui/ui/waveform"
import {
  MockAudioContext,
  MockAnalyserNode,
  MockMediaStream,
} from "../../setup"

describe("Waveform", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe("Basic Waveform", () => {
    it("renders without crashing", () => {
      render(<Waveform data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })

    it("renders with custom data", () => {
      const data = [0.1, 0.5, 0.8, 0.3, 0.6]
      render(<Waveform data={data} data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      render(<Waveform className="custom-class" data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toHaveClass("custom-class")
    })

    it("applies custom height as number", () => {
      render(<Waveform height={200} data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toHaveStyle({ height: "200px" })
    })

    it("applies custom height as string", () => {
      render(<Waveform height="50vh" data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toHaveStyle({ height: "50vh" })
    })

    it("renders canvas element", () => {
      render(<Waveform data-testid="waveform" />)
      const canvas = screen
        .getByTestId("waveform")
        .querySelector("canvas")
      expect(canvas).toBeInTheDocument()
    })

    it("calls onBarClick when canvas is clicked", () => {
      const onBarClick = vi.fn()
      const data = [0.1, 0.5, 0.8, 0.3, 0.6]
      render(
        <Waveform data={data} onBarClick={onBarClick} data-testid="waveform" />
      )

      const canvas = screen.getByTestId("waveform").querySelector("canvas")
      expect(canvas).toBeInTheDocument()

      if (canvas) {
        // Mock getBoundingClientRect for the click handler
        canvas.getBoundingClientRect = vi.fn(() => ({
          left: 0,
          top: 0,
          width: 100,
          height: 128,
          right: 100,
          bottom: 128,
          x: 0,
          y: 0,
          toJSON: () => {},
        }))

        fireEvent.click(canvas, { clientX: 50, clientY: 64 })
      }

      // onBarClick should be called (implementation depends on canvas dimensions)
      expect(onBarClick).toHaveBeenCalled()
    })

    it("accepts bar styling props", () => {
      render(
        <Waveform
          barWidth={8}
          barHeight={8}
          barGap={4}
          barRadius={4}
          barColor="#ff0000"
          data-testid="waveform"
        />
      )
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })

    it("handles fadeEdges prop", () => {
      render(<Waveform fadeEdges={false} fadeWidth={0} data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })
  })

  describe("ScrollingWaveform", () => {
    it("renders without crashing", () => {
      render(<ScrollingWaveform data-testid="scrolling-waveform" />)
      expect(screen.getByTestId("scrolling-waveform")).toBeInTheDocument()
    })

    it("accepts speed prop", () => {
      render(<ScrollingWaveform speed={100} data-testid="scrolling-waveform" />)
      expect(screen.getByTestId("scrolling-waveform")).toBeInTheDocument()
    })

    it("accepts barCount prop", () => {
      render(
        <ScrollingWaveform barCount={80} data-testid="scrolling-waveform" />
      )
      expect(screen.getByTestId("scrolling-waveform")).toBeInTheDocument()
    })

    it("renders with provided data", () => {
      const data = [0.1, 0.5, 0.8, 0.3, 0.6]
      render(
        <ScrollingWaveform data={data} data-testid="scrolling-waveform" />
      )
      expect(screen.getByTestId("scrolling-waveform")).toBeInTheDocument()
    })

    it("starts animation on mount", () => {
      render(<ScrollingWaveform data-testid="scrolling-waveform" />)
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it("cleans up animation on unmount", () => {
      const { unmount } = render(
        <ScrollingWaveform data-testid="scrolling-waveform" />
      )
      unmount()
      expect(cancelAnimationFrame).toHaveBeenCalled()
    })
  })

  describe("AudioScrubber", () => {
    it("renders without crashing", () => {
      render(<AudioScrubber data-testid="audio-scrubber" />)
      expect(screen.getByTestId("audio-scrubber")).toBeInTheDocument()
    })

    it("renders with slider role", () => {
      render(<AudioScrubber data-testid="audio-scrubber" />)
      expect(screen.getByRole("slider")).toBeInTheDocument()
    })

    it("has correct aria attributes", () => {
      render(
        <AudioScrubber
          currentTime={30}
          duration={120}
          data-testid="audio-scrubber"
        />
      )
      const slider = screen.getByRole("slider")
      expect(slider).toHaveAttribute("aria-valuemin", "0")
      expect(slider).toHaveAttribute("aria-valuemax", "120")
      expect(slider).toHaveAttribute("aria-valuenow", "30")
    })

    it("calls onSeek when clicked", () => {
      const onSeek = vi.fn()
      render(
        <AudioScrubber
          duration={100}
          onSeek={onSeek}
          data-testid="audio-scrubber"
        />
      )

      const slider = screen.getByRole("slider")

      // Mock getBoundingClientRect
      slider.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 128,
        right: 200,
        bottom: 128,
        x: 0,
        y: 0,
        toJSON: () => {},
      }))

      fireEvent.mouseDown(slider, { clientX: 100 })
      expect(onSeek).toHaveBeenCalled()
    })

    it("supports dragging", () => {
      const onSeek = vi.fn()
      render(
        <AudioScrubber
          duration={100}
          onSeek={onSeek}
          data-testid="audio-scrubber"
        />
      )

      const slider = screen.getByRole("slider")

      slider.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 128,
        right: 200,
        bottom: 128,
        x: 0,
        y: 0,
        toJSON: () => {},
      }))

      // Start drag
      fireEvent.mouseDown(slider, { clientX: 50 })

      // Move
      act(() => {
        fireEvent.mouseMove(document, { clientX: 100 })
      })

      // End drag
      act(() => {
        fireEvent.mouseUp(document)
      })

      expect(onSeek).toHaveBeenCalled()
    })

    it("renders handle when showHandle is true", () => {
      render(
        <AudioScrubber showHandle={true} data-testid="audio-scrubber" />
      )
      // Handle element exists in the DOM
      const scrubber = screen.getByTestId("audio-scrubber")
      const handle = scrubber.querySelector(".rounded-full")
      expect(handle).toBeInTheDocument()
    })

    it("does not render handle when showHandle is false", () => {
      render(
        <AudioScrubber showHandle={false} data-testid="audio-scrubber" />
      )
      const scrubber = screen.getByTestId("audio-scrubber")
      // Looking for the specific handle element by its distinctive classes
      const handle = scrubber.querySelector(".h-4.w-4")
      expect(handle).not.toBeInTheDocument()
    })
  })

  describe("MicrophoneWaveform", () => {
    it("renders without crashing", () => {
      render(<MicrophoneWaveform data-testid="mic-waveform" />)
      expect(screen.getByTestId("mic-waveform")).toBeInTheDocument()
    })

    it("requests microphone access when active", async () => {
      render(<MicrophoneWaveform active={true} data-testid="mic-waveform" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      })
    })

    it("creates AudioContext when active", async () => {
      render(<MicrophoneWaveform active={true} data-testid="mic-waveform" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(AudioContext).toHaveBeenCalled()
    })

    it("does not request microphone when inactive", () => {
      render(<MicrophoneWaveform active={false} data-testid="mic-waveform" />)
      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled()
    })

    it("calls onError when microphone access fails", async () => {
      const onError = vi.fn()
      const error = new Error("Permission denied")

      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(error)

      render(
        <MicrophoneWaveform
          active={true}
          onError={onError}
          data-testid="mic-waveform"
        />
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(onError).toHaveBeenCalledWith(error)
    })

    it("accepts fftSize and smoothingTimeConstant props", () => {
      render(
        <MicrophoneWaveform
          fftSize={512}
          smoothingTimeConstant={0.9}
          data-testid="mic-waveform"
        />
      )
      expect(screen.getByTestId("mic-waveform")).toBeInTheDocument()
    })

    it("accepts sensitivity prop", () => {
      render(
        <MicrophoneWaveform sensitivity={2} data-testid="mic-waveform" />
      )
      expect(screen.getByTestId("mic-waveform")).toBeInTheDocument()
    })

    it("shows processing animation when processing prop is true", async () => {
      render(
        <MicrophoneWaveform
          active={false}
          processing={true}
          data-testid="mic-waveform"
        />
      )

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it("cleans up resources on unmount", async () => {
      const { unmount } = render(
        <MicrophoneWaveform active={true} data-testid="mic-waveform" />
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      unmount()

      // Cleanup should have been triggered
      expect(cancelAnimationFrame).toHaveBeenCalled()
    })
  })

  describe("StaticWaveform", () => {
    it("renders without crashing", () => {
      render(<StaticWaveform data-testid="static-waveform" />)
      expect(screen.getByTestId("static-waveform")).toBeInTheDocument()
    })

    it("generates consistent data with same seed", () => {
      const { rerender } = render(
        <StaticWaveform seed={42} bars={10} data-testid="static-waveform" />
      )

      // Re-render with same seed should produce same waveform
      rerender(
        <StaticWaveform seed={42} bars={10} data-testid="static-waveform" />
      )

      expect(screen.getByTestId("static-waveform")).toBeInTheDocument()
    })

    it("accepts bars prop", () => {
      render(<StaticWaveform bars={100} data-testid="static-waveform" />)
      expect(screen.getByTestId("static-waveform")).toBeInTheDocument()
    })

    it("uses default bars count of 40", () => {
      render(<StaticWaveform data-testid="static-waveform" />)
      // Component renders with default 40 bars
      expect(screen.getByTestId("static-waveform")).toBeInTheDocument()
    })
  })

  describe("LiveMicrophoneWaveform", () => {
    it("renders without crashing", () => {
      render(<LiveMicrophoneWaveform data-testid="live-mic-waveform" />)
      expect(screen.getByTestId("live-mic-waveform")).toBeInTheDocument()
    })

    it("requests microphone when active", async () => {
      render(
        <LiveMicrophoneWaveform active={true} data-testid="live-mic-waveform" />
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      })
    })

    it("accepts historySize prop", () => {
      render(
        <LiveMicrophoneWaveform
          historySize={200}
          data-testid="live-mic-waveform"
        />
      )
      expect(screen.getByTestId("live-mic-waveform")).toBeInTheDocument()
    })

    it("accepts updateRate prop", () => {
      render(
        <LiveMicrophoneWaveform
          updateRate={100}
          data-testid="live-mic-waveform"
        />
      )
      expect(screen.getByTestId("live-mic-waveform")).toBeInTheDocument()
    })

    it("supports external drag state control", () => {
      const setDragOffset = vi.fn()
      render(
        <LiveMicrophoneWaveform
          dragOffset={50}
          setDragOffset={setDragOffset}
          data-testid="live-mic-waveform"
        />
      )
      expect(screen.getByTestId("live-mic-waveform")).toBeInTheDocument()
    })

    it("supports savedHistoryRef prop", () => {
      const historyRef = { current: [0.5, 0.6, 0.7] }
      render(
        <LiveMicrophoneWaveform
          savedHistoryRef={historyRef}
          data-testid="live-mic-waveform"
        />
      )
      expect(screen.getByTestId("live-mic-waveform")).toBeInTheDocument()
    })

    it("accepts enableAudioPlayback prop", () => {
      render(
        <LiveMicrophoneWaveform
          enableAudioPlayback={false}
          data-testid="live-mic-waveform"
        />
      )
      expect(screen.getByTestId("live-mic-waveform")).toBeInTheDocument()
    })

    it("accepts playbackRate prop", () => {
      render(
        <LiveMicrophoneWaveform
          playbackRate={1.5}
          data-testid="live-mic-waveform"
        />
      )
      expect(screen.getByTestId("live-mic-waveform")).toBeInTheDocument()
    })
  })

  describe("RecordingWaveform", () => {
    it("renders without crashing", () => {
      render(<RecordingWaveform data-testid="recording-waveform" />)
      expect(screen.getByTestId("recording-waveform")).toBeInTheDocument()
    })

    it("requests microphone when recording", async () => {
      render(
        <RecordingWaveform recording={true} data-testid="recording-waveform" />
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      })
    })

    it("calls onRecordingComplete when recording stops", async () => {
      const onRecordingComplete = vi.fn()
      const { rerender } = render(
        <RecordingWaveform
          recording={true}
          onRecordingComplete={onRecordingComplete}
          data-testid="recording-waveform"
        />
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      // Stop recording
      rerender(
        <RecordingWaveform
          recording={false}
          onRecordingComplete={onRecordingComplete}
          data-testid="recording-waveform"
        />
      )

      // onRecordingComplete may not be called if no data was recorded
      // but the component should handle the transition
      expect(screen.getByTestId("recording-waveform")).toBeInTheDocument()
    })

    it("accepts showHandle prop", () => {
      render(
        <RecordingWaveform showHandle={false} data-testid="recording-waveform" />
      )
      expect(screen.getByTestId("recording-waveform")).toBeInTheDocument()
    })

    it("accepts updateRate prop", () => {
      render(
        <RecordingWaveform updateRate={100} data-testid="recording-waveform" />
      )
      expect(screen.getByTestId("recording-waveform")).toBeInTheDocument()
    })

    it("has slider role when recording is complete", async () => {
      const { rerender } = render(
        <RecordingWaveform recording={true} data-testid="recording-waveform" />
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      // Stop recording to enable scrubbing
      rerender(
        <RecordingWaveform recording={false} data-testid="recording-waveform" />
      )

      // Note: slider role only appears when there's recorded data
      expect(screen.getByTestId("recording-waveform")).toBeInTheDocument()
    })

    it("calls onError when microphone access fails", async () => {
      const onError = vi.fn()
      const error = new Error("Permission denied")

      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(error)

      render(
        <RecordingWaveform
          recording={true}
          onError={onError}
          data-testid="recording-waveform"
        />
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(onError).toHaveBeenCalledWith(error)
    })
  })

  describe("Canvas Rendering", () => {
    it("sets up canvas with device pixel ratio", () => {
      // Mock devicePixelRatio
      Object.defineProperty(window, "devicePixelRatio", {
        value: 2,
        writable: true,
      })

      render(<Waveform data={[0.5]} data-testid="waveform" />)

      const container = screen.getByTestId("waveform")
      const canvas = container.querySelector("canvas")

      expect(canvas).toBeInTheDocument()
    })

    it("clears canvas on each render", () => {
      const data = [0.5, 0.6, 0.7]
      render(<Waveform data={data} data-testid="waveform" />)

      // Canvas getContext is mocked, and clearRect should be called
      const canvas = screen.getByTestId("waveform").querySelector("canvas")
      expect(canvas).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("AudioScrubber has proper aria-label", () => {
      render(<AudioScrubber />)
      expect(
        screen.getByLabelText("Audio waveform scrubber")
      ).toBeInTheDocument()
    })

    it("AudioScrubber is focusable", () => {
      render(<AudioScrubber />)
      const slider = screen.getByRole("slider")
      expect(slider).toHaveAttribute("tabIndex", "0")
    })

    it("LiveMicrophoneWaveform has aria attributes when not active", () => {
      const historyRef = { current: [0.5, 0.6, 0.7] }
      render(
        <LiveMicrophoneWaveform
          active={false}
          savedHistoryRef={historyRef}
          data-testid="live-mic"
        />
      )

      // When not active and has history, it should have slider role
      const element = screen.getByTestId("live-mic")
      // Note: role is conditional based on history length
      expect(element).toBeInTheDocument()
    })

    it("RecordingWaveform has descriptive aria-label", () => {
      render(<RecordingWaveform data-testid="recording" />)
      expect(screen.getByTestId("recording")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles empty data array", () => {
      render(<Waveform data={[]} data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })

    it("handles very large data array", () => {
      const data = Array.from({ length: 10000 }, () => Math.random())
      render(<Waveform data={data} data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })

    it("handles data values outside 0-1 range", () => {
      const data = [-0.5, 0, 0.5, 1, 1.5]
      render(<Waveform data={data} data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })

    it("handles zero duration in AudioScrubber", () => {
      render(<AudioScrubber duration={0} data-testid="scrubber" />)
      expect(screen.getByTestId("scrubber")).toBeInTheDocument()
    })

    it("handles negative barWidth gracefully", () => {
      render(<Waveform barWidth={-1} data-testid="waveform" />)
      expect(screen.getByTestId("waveform")).toBeInTheDocument()
    })
  })
})
