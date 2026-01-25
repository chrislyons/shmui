![elevenlabs-ui](https://github.com/user-attachments/assets/a5b73bfc-b0a3-4b4e-8915-f90a086c5723)

# shmui - Dual-Stack Audio & Agentic UI Components

**shmui** is a dual-stack component library built on [shadcn/ui](https://ui.shadcn.com/) (React) with JUCE C++ ports for native desktop audio applications.

## Dual Stack

1. **React/TypeScript** (web) - Registry-based shadcn/ui components for web apps
2. **JUCE C++** (native) - Ports of React components for desktop audio applications

Pre-built, customizable components specifically designed for audio & agentic applications: orbs, waveforms, bar visualizers, matrix displays, voice agents, audio players, and more.

---

## React/TypeScript Components (Web)

### Installation

You can use the ElevenLabs CLI directly with npx:
```bash
# Use directly (recommended)
npx @elevenlabs/cli@latest components add <component-name>

# Or using shadcn cli
npx shadcn@latest add https://ui.elevenlabs.io/r/all.json
```

### Prerequisites

Before using React components, ensure your Next.js project meets these requirements:
- **Node.js 18** or later
- **shadcn/ui** initialized in your project (`npx shadcn@latest init`)
- **Tailwind CSS** configured

### Usage

**Install All Components:**
```bash
npx @elevenlabs/cli@latest components add all
```

This command will:
- Set up shadcn/ui if not already configured
- Install all shmui React components to your configured components directory
- Add necessary dependencies to your project

**Install Specific Components:**
```bash
npx @elevenlabs/cli@latest components add <component-name>

# Examples
npx @elevenlabs/cli@latest components add orb
npx @elevenlabs/cli@latest components add waveform-visualizer
```

**Alternative: Use with shadcn/ui CLI:**
```bash
# Install all components
npx shadcn@latest add https://ui.elevenlabs.io/r/all.json

# Install a specific component
npx shadcn@latest add https://ui.elevenlabs.io/r/orb.json
```

All available React components can be found [here](https://ui.elevenlabs.io/docs/components) or explore example blocks [here](https://ui.elevenlabs.io/blocks).

---

## JUCE C++ Components (Native Desktop)

**IMPORTANT:** JUCE components are maintained in the [Orpheus SDK](https://github.com/chrislyons/orpheus-sdk) as `packages/shmui-juce/`. The source of truth remains in this repo (`juce/Source/`) and is synced to Orpheus SDK.

### Installation

**Option 1: Use from Orpheus SDK (Recommended for Orpheus apps)**

If you're building an Orpheus SDK application (Clip Composer, Wave Finder, FX Engine):

```cpp
// Include from orpheus-sdk package
#include "packages/shmui-juce/ShmUI.h"
```

The package is automatically available in all Orpheus SDK applications.

**Option 2: Use standalone**

For standalone JUCE projects:

1. Add `juce/Source` to your JUCE project's header search paths
2. Include the main header: `#include "ShmUI.h"`
3. Link required JUCE modules:
   - `juce_gui_basics`
   - `juce_opengl`
   - `juce_dsp`

### Usage

**Basic Example:**
```cpp
#include "ShmUI.h"

// Create visualizer component
auto orb = std::make_unique<shmui::OrbVisualizer>();

// Create audio analyzer
shmui::AudioAnalyzer analyzer;

// Process audio (audio thread safe)
void processBlock(juce::AudioBuffer<float>& buffer, double sampleRate) {
    analyzer.processAudioBlock(buffer.getReadPointer(0),
                                buffer.getNumSamples(),
                                sampleRate);
}

// Update UI (message thread)
void timerCallback() override {
    juce::MessageManager::callAsync([this]() {
        orb->setAudioLevel(analyzer.getRMS());
    });
}
```

### Available JUCE Components

**Audio Analysis:**
- **AudioAnalyzer** - FFT, RMS, frequency band analysis (thread-safe, lock-free)

**Visualizers:**
- **WaveformVisualizer** - Multiple waveform display variants
- **BarVisualizer** - Frequency band display with state animations
- **OrbVisualizer** - OpenGL shader-based 3D orb
- **MatrixDisplay** - LED-style matrix display with animations

**Controls:**
- **AudioPlayerControls** - Transport controls (play/pause, time, speed)
- **ScrubBar** - Timeline scrub bar for position control

**Utilities:**
- **AgentState** - Unified agent state enum (Idle, Connecting, Initializing, Listening, Thinking, Speaking)
- **Interpolation** - Smoothing and easing utilities
- **ColorUtils** - Color manipulation helpers

**Threading Model:**
- `AudioAnalyzer` is thread-safe (lock-free atomics for audio/UI communication)
- Visualization components must be used on JUCE message thread
- Use `juce::MessageManager::callAsync()` for cross-thread updates
- NO allocations on audio thread (Orpheus SDK compatible)

---

## When to Use Which

**React/TypeScript:**
- Web applications
- Cross-platform web UIs
- Agent interfaces (voice, chat)
- Browser-based audio tools

**JUCE C++:**
- Native desktop applications
- DAWs (Digital Audio Workstations)
- Audio plugins (VST3, AU, AAX)
- Low-latency requirements
- Professional audio tools

---

## Contributing

If you'd like to contribute to shmui, please follow these steps:

1. Fork the repository
2. Create a new branch
3. Make your changes to components in:
   - `registry/` for React components
   - `juce/Source/` for JUCE C++ components
4. Open a PR to the main branch

Please read the [contributing guide](/CONTRIBUTING.md).

---

## License

Licensed under the [MIT license](https://github.com/elevenlabs/ui/blob/main/LICENSE.md).

Engineered by [ElevenLabs](https://elevenlabs.io).
