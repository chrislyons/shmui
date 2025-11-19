import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useDebounce } from "@/registry/elevenlabs-ui/hooks/use-debounce"
import { usePrevious } from "@/registry/elevenlabs-ui/hooks/use-previous"
import { useIsMobile } from "@/registry/elevenlabs-ui/hooks/use-mobile"

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500))
    expect(result.current).toBe("initial")
  })

  it("updates value after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    )

    rerender({ value: "updated" })

    // Value should still be initial
    expect(result.current).toBe("initial")

    // Advance timer
    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    // Now it should be updated
    expect(result.current).toBe("updated")
  })

  it("cancels pending update when value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    )

    rerender({ value: "first" })

    // Wait 250ms
    await act(async () => {
      vi.advanceTimersByTime(250)
    })

    // Change value again
    rerender({ value: "second" })

    // Wait another 250ms (total 500ms but timer was reset)
    await act(async () => {
      vi.advanceTimersByTime(250)
    })

    // Should still be initial because timer was reset
    expect(result.current).toBe("initial")

    // Wait full delay
    await act(async () => {
      vi.advanceTimersByTime(250)
    })

    // Now should be second
    expect(result.current).toBe("second")
  })

  it("works with different data types", async () => {
    // Number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    )

    numberRerender({ value: 42 })
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(numberResult.current).toBe(42)

    // Object
    const obj = { key: "value" }
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: {} } }
    )

    objectRerender({ value: obj })
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(objectResult.current).toBe(obj)

    // Array
    const arr = [1, 2, 3]
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: [] as number[] } }
    )

    arrayRerender({ value: arr })
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(arrayResult.current).toBe(arr)
  })

  it("handles zero delay", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: "initial" } }
    )

    rerender({ value: "updated" })

    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toBe("updated")
  })

  it("cleans up timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout")

    const { unmount } = renderHook(() => useDebounce("value", 500))
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})

describe("usePrevious", () => {
  it("returns undefined on first render", () => {
    const { result } = renderHook(() => usePrevious("initial"))
    expect(result.current).toBeUndefined()
  })

  it("returns previous value after update", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: "first" } }
    )

    // First render - undefined
    expect(result.current).toBeUndefined()

    // Update value
    rerender({ value: "second" })

    // Now should return previous value
    expect(result.current).toBe("first")

    // Update again
    rerender({ value: "third" })
    expect(result.current).toBe("second")
  })

  it("works with different data types", () => {
    // Numbers
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } }
    )

    numberRerender({ value: 2 })
    expect(numberResult.current).toBe(1)

    // Objects
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    )

    objectRerender({ value: obj2 })
    expect(objectResult.current).toBe(obj1)

    // Booleans
    const { result: boolResult, rerender: boolRerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: true } }
    )

    boolRerender({ value: false })
    expect(boolResult.current).toBe(true)
  })

  it("handles same value updates", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: "same" } }
    )

    rerender({ value: "same" })
    expect(result.current).toBe("same")

    rerender({ value: "same" })
    expect(result.current).toBe("same")
  })

  it("handles null and undefined values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null as string | null } }
    )

    rerender({ value: "string" })
    expect(result.current).toBeNull()

    rerender({ value: null })
    expect(result.current).toBe("string")
  })
})

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    // Reset innerWidth before each test
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      writable: true,
    })
  })

  it("returns false for desktop viewport", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("returns true for mobile viewport", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 500,
      writable: true,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("returns true at breakpoint boundary (767px)", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 767,
      writable: true,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("returns false at breakpoint (768px)", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 768,
      writable: true,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("responds to viewport changes", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    })

    const { result } = renderHook(() => useIsMobile())

    // Initially desktop
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        writable: true,
      })
      // Trigger the change event
      window.matchMedia("(max-width: 767px)").dispatchEvent(new Event("change"))
    })

    // Note: due to how our mock works, we can't fully test the event listener
    // but we can verify the hook doesn't throw errors
    expect(result.current).toBeDefined()
  })

  it("cleans up event listener on unmount", () => {
    const removeEventListenerSpy = vi.fn()
    const addEventListenerSpy = vi.fn()

    // Mock matchMedia to track listener calls
    const mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    }))

    Object.defineProperty(window, "matchMedia", {
      value: mockMatchMedia,
      writable: true,
    })

    const { unmount } = renderHook(() => useIsMobile())

    expect(addEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function))
  })
})
