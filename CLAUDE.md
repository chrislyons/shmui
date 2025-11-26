# shmui Development Guide

**Workspace:** Inherits conventions from `~/chrislyons/dev/CLAUDE.md`
**Best Practices:** See `~/dev/docs/claude-code-frontend-best-practices.md` for comprehensive Claude Code workflow guidance

Dual-stack component library for audio & agentic applications: React/TypeScript for web, JUCE C++ for native desktop.

## Configuration Hierarchy

This repository follows a three-tier configuration hierarchy:

1. **This file (CLAUDE.md)** — Repository-specific rules and conventions
2. **Workspace config** (`~/chrislyons/dev/CLAUDE.md`) — Cross-repo patterns
3. **Global config** (`~/.claude/CLAUDE.md`) — Universal rules

**Conflict Resolution:** Repo > Workspace > Global > Code behavior

---

## Dual-Stack Architecture

**shmui** provides UI components in TWO stacks:

1. **React/TypeScript** (web) - Registry-based shadcn/ui components
2. **JUCE C++** (native) - Ports of React components for desktop audio apps

**CRITICAL:** JUCE components are maintained in Orpheus SDK as `packages/shmui-juce/`. This repo maintains:
- React components (`registry/`, `apps/`)
- JUCE component **source of truth** (`juce/Source/`) - synced to Orpheus SDK
- Documentation for both stacks

---

## Repository Structure

```
shmui/
├── CLAUDE.md              # This file (repo conventions)
├── GEMINI.md              # Gemini 3 Pro config
├── .codex/AGENTS.md       # Codex CLI config
├── README.md              # Installation, usage
├── registry/              # React component registry (JSON configs)
│   ├── components/        # React component definitions
│   └── blocks/            # Example blocks
├── juce/                  # JUCE C++ components (synced to orpheus-sdk)
│   └── Source/
│       ├── ShmUI.h        # Main include header
│       ├── Audio/         # AudioAnalyzer (FFT, RMS)
│       ├── Components/    # Visualizers (Orb, Waveform, Bar, Matrix)
│       ├── Shaders/       # OpenGL shaders
│       └── Utils/         # Interpolation, ColorUtils
├── apps/                  # Example apps
├── docs/                  # Documentation
└── tests/                 # Component tests
```

---

## Integration with Orpheus SDK

**Status:** JUCE components integrated into Orpheus SDK as `packages/shmui-juce/`

**Synchronization Model:**
- `juce/Source/` in this repo is the **source of truth**
- Changes sync to `~/dev/orpheus-sdk/packages/shmui-juce/`
- Orpheus SDK applications (Clip Composer, Wave Finder, FX Engine) consume from package

**Why this integration?**
- Orpheus SDK provides professional audio engine with broadcast-safe threading
- shmui JUCE components provide audio visualization for Orpheus applications
- React components remain in shmui for web-based audio tools

**Threading Compatibility:**
- shmui `AudioAnalyzer` uses lock-free atomics → compatible with Orpheus broadcast-safe audio threads
- shmui visualization components require JUCE message thread → compatible with Orpheus threading model
- NO allocations on audio thread (aligned with Orpheus constraints)

**See Also:**
- Orpheus SDK docs: `~/dev/orpheus-sdk/CLAUDE.md`, `~/dev/orpheus-sdk/GEMINI.md`
- Orpheus SDK JUCE package: `~/dev/orpheus-sdk/packages/shmui-juce/`
- Orpheus SDK architecture: `~/dev/orpheus-sdk/docs/ARCHITECTURE.md`

---

## React/TypeScript Components (Web)

### Installation

```bash
# Add React component (registry-based)
npx @elevenlabs/cli@latest components add <component-name>

# Or via shadcn CLI
npx shadcn@latest add https://ui.elevenlabs.io/r/<component>.json
```

### Design Principles

- **Accessibility First** (WCAG 2.2 AA)
- **Responsive Design** (Mobile-First)
- **Theming Support** (light/dark mode via CSS variables)
- **Component Variants** (Class Variance Authority)

### Development

```bash
pnpm install
pnpm run dev
pnpm run type-check
pnpm run build
pnpm run test
pnpm run test:a11y  # Accessibility tests
```

---

## JUCE C++ Components (Native)

### Installation (For JUCE Projects)

JUCE components are header-only:

1. Add `juce/Source` to JUCE project's header search paths
2. Include main header: `#include "ShmUI.h"`
3. Link required JUCE modules: `juce_gui_basics`, `juce_opengl`, `juce_dsp`

**OR** use from Orpheus SDK package:

```cpp
// In orpheus-sdk applications (Clip Composer, etc.)
#include "packages/shmui-juce/ShmUI.h"
```

### Available Components

- **AudioAnalyzer** - FFT, RMS, frequency band analysis (thread-safe)
- **WaveformVisualizer** - Multiple waveform display variants
- **BarVisualizer** - Frequency band display with state animations
- **OrbVisualizer** - OpenGL shader-based 3D orb
- **MatrixDisplay** - LED-style matrix display with animations

### Threading Model (CRITICAL)

**AudioAnalyzer (Thread-Safe):**
- Uses lock-free atomics for audio/UI communication
- Safe to call from audio thread: `processAudioBlock()`
- Safe to call from message thread: `getRMS()`, `getFFTBins()`

**Visualization Components (Message Thread Only):**
- `WaveformVisualizer`, `BarVisualizer`, `OrbVisualizer`, `MatrixDisplay`
- MUST be used on JUCE message thread
- Use `juce::MessageManager::callAsync()` for cross-thread updates

**Example:**

```cpp
#include "ShmUI.h"

// Audio thread (safe)
void processBlock(juce::AudioBuffer<float>& buffer, double sampleRate) {
    analyzer.processAudioBlock(buffer.getReadPointer(0),
                                buffer.getNumSamples(),
                                sampleRate);
}

// Message thread (safe)
void timerCallback() override {
    auto rms = analyzer.getRMS();
    orbVisualizer.setAudioLevel(rms);
}
```

---

## When to Use Which Stack

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
- Professional audio tools (like Orpheus SDK apps)

---

## Dual-Stack Development Workflow

### Adding a New Component

**React Component:**
1. Create component in `registry/components/`
2. Add shadcn/ui JSON config
3. Write accessibility tests (`pnpm run test:a11y`)
4. Update documentation

**JUCE Component:**
1. Create C++ files in `juce/Source/Components/`
2. Add to `ShmUI.h` includes
3. Follow JUCE message thread model
4. Test threading safety (no audio thread allocations)
5. Sync to `~/dev/orpheus-sdk/packages/shmui-juce/` (manual or script)

**Dual-Stack Component (Both):**
1. Implement React version first (web)
2. Port to JUCE C++ (native)
3. Document differences (Canvas vs juce::Graphics, etc.)
4. Verify visual consistency across stacks

---

## Component Sync Protocol (JUCE → Orpheus SDK)

When updating JUCE components in `juce/Source/`:

1. **Make changes in shmui repo** (`~/dev/shmui/juce/Source/`)
2. **Test locally** (if you have a JUCE test project)
3. **Sync to Orpheus SDK:**
   ```bash
   rsync -av --delete ~/dev/shmui/juce/Source/ \
             ~/dev/orpheus-sdk/packages/shmui-juce/
   ```
4. **Test in Orpheus SDK:**
   ```bash
   cd ~/dev/orpheus-sdk/apps/clip-composer
   cmake --build build
   ./scripts/relaunch-occ.sh
   ```
5. **Commit in both repos:**
   - Commit shmui: `feat(juce): update OrbVisualizer shader`
   - Commit orpheus-sdk: `chore(shmui-juce): sync from shmui upstream`

---

## Do / Don't

### ✅ Do

- Maintain visual consistency across React/JUCE stacks
- Follow JUCE message thread model for UI components
- Write accessibility tests for React components (WCAG 2.2 AA)
- Document threading requirements for JUCE components
- Sync JUCE changes to Orpheus SDK when stable
- Use `std::atomic` for thread-safe audio analysis

### ❌ Don't

- Allocate on audio thread in JUCE components
- Break React accessibility (keyboard nav, screen readers)
- Commit large binaries (audio test files, screenshots)
- Modify JUCE components directly in orpheus-sdk (edit here, sync there)
- Use locks in audio processing path

---

## Quick Reference

**React Development:**
```bash
pnpm install
pnpm run dev          # Start dev server
pnpm run type-check   # TypeScript validation
pnpm run test:a11y    # Accessibility tests
```

**JUCE Sync:**
```bash
# After JUCE component changes:
rsync -av --delete ~/dev/shmui/juce/Source/ \
          ~/dev/orpheus-sdk/packages/shmui-juce/
```

**Documentation:**
- React components: https://ui.elevenlabs.io/
- JUCE framework: https://juce.com/learn/documentation
- Orpheus SDK: `~/dev/orpheus-sdk/CLAUDE.md`

---

**Last Updated:** 2025-11-26
**Integration Status:** JUCE components synced to orpheus-sdk/packages/shmui-juce/
