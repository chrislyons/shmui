import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Orb, type AgentState } from "@/registry/elevenlabs-ui/ui/orb"

// Mock React Three Fiber and Drei
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({
    gl: {
      domElement: document.createElement("canvas"),
      forceContextRestore: vi.fn(),
    },
  }),
}))

vi.mock("@react-three/drei", () => ({
  useTexture: () => ({
    wrapS: 0,
    wrapT: 0,
  }),
}))

// Mock THREE.js
vi.mock("three", () => ({
  Uniform: vi.fn((value) => ({ value })),
  Color: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    lerp: vi.fn(),
  })),
  RepeatWrapping: 1000,
}))

describe("Orb", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<Orb />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("renders with custom className", () => {
      render(<Orb className="custom-orb" />)
      const container = screen.getByTestId("r3f-canvas").parentElement
      expect(container).toHaveClass("custom-orb")
    })

    it("uses default className when not provided", () => {
      render(<Orb />)
      const container = screen.getByTestId("r3f-canvas").parentElement
      expect(container).toHaveClass("relative")
      expect(container).toHaveClass("h-full")
      expect(container).toHaveClass("w-full")
    })
  })

  describe("Props", () => {
    it("accepts colors prop", () => {
      const colors: [string, string] = ["#FF0000", "#00FF00"]
      render(<Orb colors={colors} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts colorsRef prop", () => {
      const colorsRef = { current: ["#FF0000", "#00FF00"] as [string, string] }
      render(<Orb colorsRef={colorsRef} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts resizeDebounce prop", () => {
      render(<Orb resizeDebounce={200} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts seed prop", () => {
      render(<Orb seed={12345} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts all agentState values", () => {
      const states: AgentState[] = [null, "thinking", "listening", "talking"]

      states.forEach((state) => {
        const { unmount } = render(<Orb agentState={state} />)
        expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
        unmount()
      })
    })

    it("accepts volumeMode auto", () => {
      render(<Orb volumeMode="auto" />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts volumeMode manual with manualInput and manualOutput", () => {
      render(
        <Orb volumeMode="manual" manualInput={0.5} manualOutput={0.7} />
      )
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts inputVolumeRef prop", () => {
      const inputVolumeRef = { current: 0.5 }
      render(<Orb inputVolumeRef={inputVolumeRef} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts outputVolumeRef prop", () => {
      const outputVolumeRef = { current: 0.7 }
      render(<Orb outputVolumeRef={outputVolumeRef} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts getInputVolume callback", () => {
      const getInputVolume = vi.fn(() => 0.5)
      render(<Orb getInputVolume={getInputVolume} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("accepts getOutputVolume callback", () => {
      const getOutputVolume = vi.fn(() => 0.7)
      render(<Orb getOutputVolume={getOutputVolume} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })
  })

  describe("Default Values", () => {
    it("uses default colors", () => {
      render(<Orb />)
      // Default colors are ["#CADCFC", "#A0B9D1"]
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("uses default resizeDebounce of 100", () => {
      render(<Orb />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("uses default agentState of null", () => {
      render(<Orb />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("uses default volumeMode of auto", () => {
      render(<Orb />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })
  })

  describe("Volume Control", () => {
    it("handles manual input volume of 0", () => {
      render(<Orb volumeMode="manual" manualInput={0} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles manual input volume of 1", () => {
      render(<Orb volumeMode="manual" manualInput={1} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles manual output volume of 0", () => {
      render(<Orb volumeMode="manual" manualOutput={0} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles manual output volume of 1", () => {
      render(<Orb volumeMode="manual" manualOutput={1} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })
  })

  describe("State Transitions", () => {
    it("handles state change from idle to listening", () => {
      const { rerender } = render(<Orb agentState={null} />)
      rerender(<Orb agentState="listening" />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles state change from listening to thinking", () => {
      const { rerender } = render(<Orb agentState="listening" />)
      rerender(<Orb agentState="thinking" />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles state change from thinking to talking", () => {
      const { rerender } = render(<Orb agentState="thinking" />)
      rerender(<Orb agentState="talking" />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles state change from talking to idle", () => {
      const { rerender } = render(<Orb agentState="talking" />)
      rerender(<Orb agentState={null} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })
  })

  describe("Color Updates", () => {
    it("handles color prop changes", () => {
      const { rerender } = render(<Orb colors={["#FF0000", "#00FF00"]} />)
      rerender(<Orb colors={["#0000FF", "#FFFF00"]} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles colorsRef updates", () => {
      const colorsRef = { current: ["#FF0000", "#00FF00"] as [string, string] }
      render(<Orb colorsRef={colorsRef} />)

      // Update ref
      colorsRef.current = ["#0000FF", "#FFFF00"]

      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles very small manualInput value", () => {
      render(<Orb volumeMode="manual" manualInput={0.001} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles manualInput value greater than 1", () => {
      // Should be clamped by clamp01 function
      render(<Orb volumeMode="manual" manualInput={1.5} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles negative manualInput value", () => {
      // Should be clamped by clamp01 function
      render(<Orb volumeMode="manual" manualInput={-0.5} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles Infinity values", () => {
      render(<Orb volumeMode="manual" manualInput={Infinity} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles NaN values", () => {
      render(<Orb volumeMode="manual" manualInput={NaN} />)
      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })

    it("handles rapid state changes", () => {
      const { rerender } = render(<Orb agentState={null} />)

      for (let i = 0; i < 10; i++) {
        rerender(<Orb agentState="listening" />)
        rerender(<Orb agentState="thinking" />)
        rerender(<Orb agentState="talking" />)
        rerender(<Orb agentState={null} />)
      }

      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
    })
  })

  describe("Unmounting", () => {
    it("cleans up on unmount", () => {
      const { unmount } = render(<Orb />)
      expect(() => unmount()).not.toThrow()
    })

    it("cleans up with all props set", () => {
      const { unmount } = render(
        <Orb
          colors={["#FF0000", "#00FF00"]}
          agentState="talking"
          volumeMode="manual"
          manualInput={0.5}
          manualOutput={0.7}
          seed={42}
          resizeDebounce={200}
        />
      )
      expect(() => unmount()).not.toThrow()
    })
  })
})
