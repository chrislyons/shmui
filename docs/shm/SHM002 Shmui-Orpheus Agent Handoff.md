# SHM002 Shmui-Orpheus Agent Handoff

**Status:** Active
**Created:** 2025-11-18
**Purpose:** Comprehensive context transfer for agents working on shmui-to-JUCE visualization porting

---

## Executive Summary

This document provides complete context for porting ElevenLabs UI (shmui) audio visualization components to JUCE C++ for integration with the Orpheus SDK, specifically the Clip Composer (OCC) application.

**Primary Goal:** Translate proven React/TypeScript visualization algorithms into broadcast-safe JUCE C++ components that integrate with Orpheus SDK's real-time audio infrastructure.

**Key Insight:** Shmui provides tuned algorithms, constants, and visual targets—you're translating a working reference, not designing from scratch.

---

## Shmui Repository Overview

### Identity

- **Origin:** Fork of `elevenlabs/ui` (which extends shadcn/ui)
- **Purpose:** Audio/AI-focused UI component library
- **Location:** `~/dev/shmui`
- **Tech Stack:** React 18, TypeScript, Tailwind CSS, Three.js, Web Audio API

### Directory Structure

```
shmui/
├── apps/www/                          # Main application
│   ├── registry/elevenlabs-ui/        # Component registry (PRIMARY)
│   │   ├── ui/                        # Core components
│   │   │   ├── waveform.tsx           # 7 waveform variants (1658 lines)
│   │   │   ├── orb.tsx                # 3D shader visualization (498 lines)
│   │   │   ├── bar-visualizer.tsx     # Frequency band display
│   │   │   ├── matrix.tsx             # LED-style display
│   │   │   ├── audio-player.tsx       # Transport controls
│   │   │   ├── scrub-bar.tsx          # Timeline scrubbing
│   │   │   └── live-waveform.tsx      # Real-time waveform
│   │   ├── examples/                  # Demo implementations
│   │   └── blocks/                    # Composite patterns
│   ├── components/                    # App-level components
│   └── content/docs/                  # MDX documentation
├── docs/shm/                          # Project documentation
│   ├── SHM001 Shmui-JUCE Integration Plan.md  # Algorithm translation guide
│   └── SHM002 (this file)
└── package.json                       # pnpm workspace config
```

### Key Source Files (with line counts)

| File | Lines | Purpose |
|------|-------|---------|
| `ui/waveform.tsx` | 1658 | 7 waveform variants, FFT analysis, microphone input |
| `ui/orb.tsx` | 498 | 3D shader-based orb with GLSL fragment shader |
| `ui/bar-visualizer.tsx` | ~400 | Frequency bands, state machine animations |
| `ui/matrix.tsx` | ~350 | LED matrix with frame-based animations |
| `ui/audio-player.tsx` | ~300 | Transport, speed control, time display |
| `ui/scrub-bar.tsx` | ~200 | Timeline with seek functionality |
| `ui/live-waveform.tsx` | ~150 | Real-time streaming waveform |

---

## Visualization Components Deep Dive

### 1. Waveform (`waveform.tsx`)

**7 Exported Variants:**

1. `Waveform` - Static bar display from data array
2. `ScrollingWaveform` - Auto-scrolling bars with animation
3. `AudioScrubber` - Waveform with seek handle
4. `MicrophoneWaveform` - Real-time FFT from mic input
5. `StaticWaveform` - Seeded pseudo-random display
6. `LiveMicrophoneWaveform` - Scrolling mic input with history
7. `RecordingWaveform` - Records and displays mic data

**Core Algorithms:**

```typescript
// FFT Analysis (MicrophoneWaveform, lines 513-693)
const analyser = audioContext.createAnalyser()
analyser.fftSize = 256  // Key constant
analyser.smoothingTimeConstant = 0.8  // Key constant

// Frequency range extraction
const startFreq = Math.floor(dataArray.length * 0.05)  // Skip DC
const endFreq = Math.floor(dataArray.length * 0.4)     // Voice focus
const relevantData = dataArray.slice(startFreq, endFreq)

// Mirrored display (lines 653-663)
for (let i = halfLength - 1; i >= 0; i--) {
  normalizedData.push(relevantData[i] / 255 * sensitivity)
}
for (let i = 0; i < halfLength; i++) {
  normalizedData.push(relevantData[i] / 255 * sensitivity)
}
```

**Visual Parameters:**

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `barWidth` | 4px | Individual bar width |
| `barHeight` | 4px | Minimum bar height |
| `barGap` | 2px | Space between bars |
| `barRadius` | 2px | Corner rounding |
| `fadeWidth` | 24px | Edge fade gradient |
| `height` | 128px | Container height |

**Canvas Rendering Pattern:**

```typescript
// Render loop (lines 67-117)
const renderWaveform = () => {
  ctx.clearRect(0, 0, rect.width, rect.height)
  const centerY = rect.height / 2

  for (let i = 0; i < barCount; i++) {
    const value = data[dataIndex] || 0
    const barHeight = Math.max(baseBarHeight, value * rect.height * 0.8)
    const y = centerY - barHeight / 2

    ctx.globalAlpha = 0.3 + value * 0.7  // Alpha by amplitude
    ctx.fillRoundRect(x, y, barWidth, barHeight, barRadius)
  }

  // Edge fade (destination-out compositing)
  if (fadeEdges) {
    ctx.globalCompositeOperation = "destination-out"
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)
  }
}
```

### 2. Orb (`orb.tsx`)

**Architecture:**

- React Three Fiber wrapper around Three.js
- Custom GLSL fragment shader
- State-based animation targets
- Perlin noise texture for organic motion

**Agent States:**

```typescript
export type AgentState = null | "thinking" | "listening" | "talking"
```

**Volume Control Modes:**

```typescript
volumeMode: "auto" | "manual"
// Auto: Uses internal oscillation based on state
// Manual: Uses manualInput/manualOutput or refs
```

**State-Based Animation Targets (lines 179-205):**

```typescript
if (agentRef.current === null) {
  targetIn = 0
  targetOut = 0.3
} else if (agentRef.current === "listening") {
  targetIn = clamp01(0.55 + Math.sin(t * 3.2) * 0.35)
  targetOut = 0.45
} else if (agentRef.current === "talking") {
  targetIn = clamp01(0.65 + Math.sin(t * 4.8) * 0.22)
  targetOut = clamp01(0.75 + Math.sin(t * 3.6) * 0.22)
} else { // thinking
  const base = 0.38 + 0.07 * Math.sin(t * 0.7)
  const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2)
  targetIn = clamp01(base + wander)
  targetOut = clamp01(0.48 + 0.12 * Math.sin(t * 1.05 + 0.6))
}

// Exponential smoothing
curInRef.current += (targetIn - curInRef.current) * 0.2
curOutRef.current += (targetOut - curOutRef.current) * 0.2
```

**GLSL Fragment Shader Key Functions (lines 293-497):**

```glsl
// Polar coordinate conversion
vec2 uv = vUv * 2.0 - 1.0;
float radius = length(uv);
float theta = atan(uv.y, uv.x);

// 2D noise for ring effect
vec2 hash2(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

// Color ramp (4-color gradient)
vec3 colorRamp(float grayscale, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  if (grayscale < 0.33) return mix(c1, c2, grayscale * 3.0);
  else if (grayscale < 0.66) return mix(c2, c3, (grayscale - 0.33) * 3.0);
  else return mix(c3, c4, (grayscale - 0.66) * 3.0);
}
```

**Shader Uniforms:**

| Uniform | Type | Purpose |
|---------|------|---------|
| `uTime` | float | Animation time |
| `uAnimation` | float | Animation speed accumulator |
| `uInputVolume` | float | Input level (0-1) |
| `uOutputVolume` | float | Output level (0-1) |
| `uColor1` | vec3 | Primary gradient color |
| `uColor2` | vec3 | Secondary gradient color |
| `uInverted` | float | Dark mode toggle (0 or 1) |
| `uOpacity` | float | Fade-in opacity |
| `uPerlinTexture` | sampler2D | Noise texture |
| `uOffsets` | float[7] | Per-oval phase offsets |

### 3. Bar Visualizer (`bar-visualizer.tsx`)

**Frequency Band Splitting:**

```typescript
function splitIntoBands(fftData, numBands, loPass = 100, hiPass = 600) {
  const bands = []
  const sliceLength = hiPass - loPass
  const chunkSize = Math.ceil(sliceLength / numBands)

  for (let i = 0; i < numBands; i++) {
    let sum = 0, count = 0
    const start = loPass + i * chunkSize
    const end = Math.min(loPass + (i + 1) * chunkSize, hiPass)

    for (let j = start; j < end; j++) {
      sum += normalizeDb(fftData[j])
      count++
    }
    bands.push(count > 0 ? sum / count : 0)
  }
  return bands
}
```

**State Machine Animation Intervals:**

```typescript
enum AgentState { Idle, Connecting, Listening, Thinking, Talking }

function getAnimationInterval(state, barCount) {
  switch (state) {
    case AgentState.Connecting: return 2000 / barCount
    case AgentState.Thinking:   return 150
    case AgentState.Listening:  return 500
    default:                    return 1000
  }
}
```

**Decibel Normalization:**

```typescript
function normalizeDb(value) {
  const minDb = -100
  const maxDb = -10
  const db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100
  return Math.sqrt(db)  // Perceptual scaling
}
```

### 4. Matrix Display (`matrix.tsx`)

**Data Structure:**

```typescript
type Frame = number[][]  // rows × cols, values 0-1

function createEmptyFrame(rows: number, cols: number): Frame {
  return Array(rows).fill(null).map(() => Array(cols).fill(0))
}
```

**VU Meter Algorithm:**

```typescript
function createVUMeter(columns, levels) {
  const rows = 7
  const frame = createEmptyFrame(rows, columns)

  for (let col = 0; col < columns; col++) {
    const level = clamp(levels[col], 0, 1)
    const height = Math.floor(level * rows)

    for (let row = 0; row < rows; row++) {
      const rowFromBottom = rows - 1 - row
      if (rowFromBottom < height) {
        // Brightness gradient (top = brightest)
        if (row < rows * 0.3) frame[row][col] = 1.0
        else if (row < rows * 0.6) frame[row][col] = 0.8
        else frame[row][col] = 0.6
      }
    }
  }
  return frame
}
```

**Animation System:**

```typescript
class MatrixAnimation {
  frames: Frame[]
  currentFrame = 0
  accumulator = 0
  fps = 12
  loop = true

  update(deltaTime) {
    this.accumulator += deltaTime
    const frameInterval = 1 / this.fps

    while (this.accumulator >= frameInterval) {
      this.accumulator -= frameInterval
      this.currentFrame++
      if (this.currentFrame >= this.frames.length) {
        this.currentFrame = this.loop ? 0 : this.frames.length - 1
      }
    }
  }
}
```

---

## Critical Constants Reference

### Audio Analysis

| Constant | Value | Context | Purpose |
|----------|-------|---------|---------|
| `fftSize` (waveform) | 256 | MicrophoneWaveform | Time/frequency balance |
| `fftSize` (spectrum) | 2048 | Detailed analysis | High frequency resolution |
| `smoothingTimeConstant` | 0.8 | AnalyserNode | Visual smoothing |
| `frequencyRangeStart` | 5% of bins | All FFT | Skip DC/very low |
| `frequencyRangeEnd` | 40% of bins | All FFT | Voice focus |

### Animation

| Constant | Value | Context | Purpose |
|----------|-------|---------|---------|
| `smoothingFactor` | 0.2 | Orb, volume | Exponential smoothing |
| `transitionStep` | 0.02/frame | State transitions | Transition speed |
| `fadeStep` | 0.03/frame | Fade-out | Fade speed |
| `colorLerpFactor` | 0.08 | Orb colors | Color transition |
| `animSpeedTarget` | 0.1-1.0 | Orb | Animation speed range |

### Visual

| Constant | Value | Context | Purpose |
|----------|-------|---------|---------|
| `minBarHeight` | 4px | Waveform | Minimum visible |
| `heightScale` | 0.8 | Waveform | Max 80% of container |
| `alphaRange` | 0.3-1.0 | Waveform bars | Alpha by amplitude |
| `ledSize` | 10px | Matrix | LED diameter |
| `ledGap` | 2px | Matrix | LED spacing |

---

## Orpheus SDK Context

### Core Principles

1. **Offline-first** - No runtime network calls
2. **Deterministic** - Bit-identical output across platforms
3. **Host-neutral** - Works across REAPER, standalone, plugins
4. **Broadcast-safe** - 24/7 reliability, no audio thread allocations

### Repository Structure

```
~/dev/orpheus-sdk/
├── src/, include/           # Core SDK (C++20)
├── adapters/                # Host integrations
├── apps/                    # Applications
│   └── clip-composer/       # OCC - target for shmui integration
├── packages/                # TypeScript/JS drivers
├── tests/                   # GoogleTest suite
└── docs/                    # Architecture, roadmap
```

### Relevant SDK Modules

| Module | Header | Purpose for Visualization |
|--------|--------|---------------------------|
| `ITransportController` | `transport_controller.h` | Playback state, callbacks |
| `IAudioFileReader` | `audio_file_reader.h` | Waveform data extraction |
| `IPerformanceMonitor` | `performance_monitor.h` | CPU/latency for meters |
| `IRoutingMatrix` | `routing_matrix.h` | Level metering |
| `AudioFileReaderExtended` | `audio_file_reader_extended.h` | Waveform pre-processing |

### Threading Model (CRITICAL)

**Message Thread (UI):**
- Handle UI events
- Process SDK callbacks
- Allocations/I/O allowed
- JUCE MessageManager owns this

**Audio Thread (Real-Time):**
- `processAudio()` callback
- NO allocations
- NO locks
- NO I/O
- Atomic operations only

**Background Thread:**
- File pre-loading
- Waveform calculation
- Communicate via callbacks

---

## Clip Composer (OCC) Integration

### Application Identity

- **Location:** `~/dev/orpheus-sdk/apps/clip-composer/`
- **Framework:** JUCE 8.0.4
- **Purpose:** Professional soundboard for broadcast/theater
- **Status:** v0.2.0-alpha

### Source Structure

```
Source/
├── Main.cpp              # Entry point
├── MainComponent.h/cpp   # Top-level component (66k+ lines)
├── Audio/                # SDK integration layer
├── ClipGrid/             # 960-button clip grid
├── Session/              # Session management
├── Transport/            # Playback controls
└── UI/                   # Additional UI components
```

### Where Shmui Components Fit

| Shmui Component | OCC Target | Location |
|-----------------|------------|----------|
| Waveform | WaveformDisplay | `Source/UI/` |
| Bar Visualizer | LevelMeter | `Source/UI/` |
| Orb | StatusIndicator (optional) | `Source/UI/` |
| Matrix | MatrixDisplay (optional) | `Source/UI/` |
| Audio Player | TransportControls | `Source/Transport/` |
| Scrub Bar | Timeline/Scrubber | `Source/UI/` |

### SDK Integration Patterns

**Getting waveform data:**

```cpp
// From AudioFileReaderExtended
auto reader = orpheus::createAudioFileReader();
reader->open("/path/to/clip.wav");

// Get pre-computed waveform peaks
std::vector<float> peaks = reader->getWaveformData(
    pixelWidth,      // Number of bars
    channelIndex,    // 0 = left, 1 = right
    zoomLevel        // LOD pyramid level
);
```

**Real-time level metering:**

```cpp
// From PerformanceMonitor or custom callback
void audioCallback(float* output, int numSamples) {
    float rms = calculateRMS(output, numSamples);
    // Post to UI thread atomically
    rmsLevel.store(rms, std::memory_order_relaxed);
}

// UI thread polls
void timerCallback() {
    float level = rmsLevel.load(std::memory_order_relaxed);
    levelMeter->setLevel(level);
    levelMeter->repaint();
}
```

**Transport state for visualization:**

```cpp
// Callback from ITransportController
void onClipStarted(ClipHandle handle) {
    // Update UI on message thread
    juce::MessageManager::callAsync([=] {
        clipButton->setState(ClipButton::Playing);
    });
}
```

---

## Technical Translation Guide

### Framework Mapping

| React/Web | JUCE C++ | Notes |
|-----------|----------|-------|
| `useEffect` | Constructor + `Timer` | Lifecycle |
| `useRef` | Member variable | Persistence |
| `useState` | Member + `repaint()` | State change triggers redraw |
| `requestAnimationFrame` | `juce::Timer` (60fps) | Animation loop |
| `canvas.getContext('2d')` | `juce::Graphics` | 2D drawing |
| `ctx.fillRect()` | `g.fillRect()` | Rectangle |
| `ctx.roundRect()` | `g.fillRoundedRectangle()` | Rounded rect |
| `ResizeObserver` | `resized()` override | Layout changes |

### Audio API Mapping

| Web Audio | JUCE/Orpheus | Notes |
|-----------|--------------|-------|
| `AudioContext` | `IAudioDriver` | Audio system |
| `AnalyserNode` | `juce::dsp::FFT` | FFT analysis |
| `getByteFrequencyData()` | `fft.performFrequencyOnlyForwardTransform()` | Spectrum |
| `MediaStream` | `juce::AudioDeviceManager` | Mic input |
| `AudioBuffer` | `juce::AudioBuffer<float>` | Audio data |

### Graphics Mapping

| Canvas/Three.js | JUCE | Notes |
|-----------------|------|-------|
| `ctx.globalAlpha` | `g.setOpacity()` | Transparency |
| `ctx.fillStyle` | `g.setColour()` | Fill color |
| `ctx.globalCompositeOperation` | Custom blending | Limited in JUCE |
| `THREE.ShaderMaterial` | `juce::OpenGLShaderProgram` | GLSL shaders |
| `createLinearGradient()` | `juce::ColourGradient` | Gradients |

### State Management

```cpp
// React pattern:
// const [state, setState] = useState(initial)
// useEffect(() => { ... }, [state])

// JUCE pattern:
class MyComponent : public juce::Component, public juce::Timer {
    float currentValue = 0.0f;

    void setValue(float newValue) {
        currentValue = newValue;
        repaint();  // Triggers paint()
    }

    void timerCallback() override {
        // Animation update
        currentValue += (targetValue - currentValue) * 0.2f;
        repaint();
    }

    void paint(juce::Graphics& g) override {
        // Use currentValue for rendering
    }
};
```

---

## Implementation Priority Matrix

### Phase 1: Core Audio Analysis (Week 1)

**Files to translate:**
- FFT setup from `waveform.tsx` lines 621-639
- RMS calculation (inline, simple loop)
- dB normalization from `bar-visualizer.tsx`

**JUCE targets:**
- `Source/Audio/AudioAnalyzer.h/cpp`

**Validation:**
- Compare frequency data output with Web Audio
- Test with known audio signals

### Phase 2: Waveform Visualizer (Week 2)

**Files to translate:**
- `Waveform` component (lines 28-165)
- `ScrollingWaveform` (lines 176-377)

**JUCE targets:**
- `Source/UI/WaveformDisplay.h/cpp`

**Key algorithms:**
- Bar rendering with rounded corners
- Edge fade gradient
- Alpha by amplitude

### Phase 3: Bar Visualizer (Week 3)

**Files to translate:**
- Frequency band splitting
- State machine animations
- dB normalization

**JUCE targets:**
- `Source/UI/LevelMeter.h/cpp`

**Key algorithms:**
- Band averaging
- State-based timing
- Perceptual scaling

### Phase 4: Orb Visualization (Weeks 4-5)

**Files to translate:**
- GLSL shaders (lines 282-497)
- State-based animation (lines 164-218)
- Smoothing logic

**JUCE targets:**
- `Source/UI/OrbVisualizer.h/cpp`
- `Source/Shaders/OrbFragment.glsl`

**Key algorithms:**
- Polar coordinates
- Noise functions
- Color ramp
- 7-oval rendering

### Phase 5: Matrix Display (Week 6)

**Files to translate:**
- Frame data structure
- VU meter algorithm
- Animation system

**JUCE targets:**
- `Source/UI/MatrixDisplay.h/cpp`

**Key algorithms:**
- LED rendering with glow
- Brightness gradient
- Frame interpolation

---

## File Reference Index

### Shmui Source Files

| File | Key Sections | Line Numbers |
|------|--------------|--------------|
| `waveform.tsx` | Waveform component | 28-165 |
| | ScrollingWaveform | 176-377 |
| | AudioScrubber | 386-502 |
| | MicrophoneWaveform | 513-696 |
| | LiveMicrophoneWaveform | 738-1332 |
| | RecordingWaveform | 1348-1658 |
| `orb.tsx` | Orb wrapper | 26-66 |
| | Scene component | 69-264 |
| | Vertex shader | 282-291 |
| | Fragment shader | 293-497 |
| `bar-visualizer.tsx` | State machine | Throughout |
| `matrix.tsx` | Frame system | Throughout |

### Orpheus SDK Interfaces

| Header | Interface | Purpose |
|--------|-----------|---------|
| `transport_controller.h` | `ITransportController` | Playback, callbacks |
| `audio_file_reader.h` | `IAudioFileReader` | File decoding |
| `audio_file_reader_extended.h` | Extended | Waveform extraction |
| `performance_monitor.h` | `IPerformanceMonitor` | CPU/latency |
| `routing_matrix.h` | `IRoutingMatrix` | Levels, metering |

### OCC Target Files

| Path | Purpose |
|------|---------|
| `Source/UI/WaveformDisplay.h/cpp` | Waveform visualization |
| `Source/UI/LevelMeter.h/cpp` | Frequency bands |
| `Source/UI/OrbVisualizer.h/cpp` | Orb (if implemented) |
| `Source/Audio/AudioAnalyzer.h/cpp` | Shared DSP |
| `Source/Transport/TransportControls.h/cpp` | Player UI |

### Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| SHM001 | `~/dev/shmui/docs/shm/` | JUCE integration plan |
| ORP098 | `~/dev/orpheus-sdk/docs/orp/` | Shmui rebuild strategy |
| ARCHITECTURE.md | `~/dev/orpheus-sdk/` | SDK design |
| OCC CLAUDE.md | `~/dev/orpheus-sdk/apps/clip-composer/` | OCC dev guide |
| OCC096 | `apps/clip-composer/docs/occ/` | SDK integration patterns |

---

## Testing & Validation Strategy

### Visual Comparison

1. Screenshot shmui components in each state
2. Build JUCE equivalent
3. Side-by-side comparison
4. Adjust constants until visual parity

### Audio Response Validation

1. Test with known signals:
   - Silence
   - Speech (voice frequency focus)
   - Music (full spectrum)
   - Sine sweeps (frequency accuracy)
2. Compare FFT output values
3. Verify state transitions feel natural

### Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Frame rate | 60fps | `juce::Timer` at 16ms |
| CPU usage | <5% | Profiler during animation |
| Latency | <1 frame | Visual sync with audio |
| Memory | Stable | No growth over 1 hour |

### JUCE Test Patterns

```cpp
// Unit test for FFT output
TEST(AudioAnalyzer, FrequencyData) {
    AudioAnalyzer analyzer;
    analyzer.processSamples(testTone440Hz);

    auto freqData = analyzer.getFrequencyData();

    // Peak should be at 440Hz bin
    int expectedBin = 440 * fftSize / sampleRate;
    EXPECT_GT(freqData[expectedBin], 0.8f);
}

// Visual test harness
class WaveformTestComponent : public juce::Component {
    void paint(juce::Graphics& g) override {
        waveformDisplay.paint(g);

        // Overlay reference image for comparison
        g.setOpacity(0.5f);
        g.drawImage(referenceImage, getLocalBounds());
    }
};
```

---

## Quick Wins (Start Here)

If you need something working fast:

1. **Waveform** - Simplest canvas rendering, most reusable
2. **Bar Visualizer** - Straightforward frequency bands
3. **Matrix** - No DSP needed, just frame rendering

Save the **Orb** for last—it requires OpenGL and is the most complex.

---

## Common Pitfalls

### Thread Safety

- Never call `repaint()` from audio thread
- Use `juce::MessageManager::callAsync()` for UI updates
- Use `std::atomic<float>` for cross-thread values

### Performance

- Pre-allocate all buffers
- Avoid `std::vector::push_back()` in render loop
- Use `juce::Path` caching for complex shapes

### Visual Accuracy

- Match exact constants from shmui
- Test with same audio files
- Account for gamma/color space differences

### FFT Differences

- Web Audio normalizes differently
- JUCE FFT output needs manual normalization
- Bin mapping differs slightly

---

## References

1. **SHM001** - Shmui-JUCE Integration Plan (algorithmic details, 615 lines)
2. **ORP098** - Orpheus UI Component Library (future web strategy)
3. **ORP068** - SDK Integration Plan v2.0 (driver architecture)
4. **OCC CLAUDE.md** - Clip Composer development guide
5. **Orpheus ARCHITECTURE.md** - SDK system design
6. **Orpheus ROADMAP.md** - Milestone timeline

---

## Next Actions

For an agent picking up this work:

1. **Read SHM001** first—it has the complete algorithm translation guide
2. **Check OCC Source/** structure for existing components
3. **Start with Phase 1** (AudioAnalyzer) as foundation
4. **Visual comparison** after each phase
5. **Document quirks** in new SHM### docs as you discover them

---

**Document Status:** Active
**Maintained By:** Development team
**Last Updated:** 2025-11-18
