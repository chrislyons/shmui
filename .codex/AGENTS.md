# shmui - Codex CLI Agent Configuration

**Target Model:** GPT-5.1-Codex-Max (OpenAI, November 2025)
**CLI Tool:** OpenAI Codex CLI
**Repository:** shmui (Dual-Stack Audio & Agentic UI Components)
**Based On:** ElevenLabs UI / shadcn/ui (React) + JUCE C++ (Native)
**Tech Stack:** React 18+ + TypeScript + Tailwind CSS | JUCE C++ + OpenGL

Dual-stack component library for audio & agentic applications: React/TypeScript for web, JUCE C++ for native desktop.

**CRITICAL:** JUCE components are integrated into Orpheus SDK as `packages/shmui-juce/`. This repo is source of truth, synced to Orpheus SDK.

---

## Agent Role & Capabilities

You are GPT-5.1-Codex-Max, assisting with shmui development via OpenAI's Codex CLI.

**Core Strengths:**
- **Long-horizon tasks:** 24+ hour autonomous work on dual-stack component libraries
- **Multi-language workflows:** React/TypeScript AND JUCE C++ expertise
- **Frontend expertise:** shadcn/ui patterns, Tailwind CSS, accessibility
- **Native audio expertise:** JUCE framework, OpenGL, real-time audio

**Performance:** SWE-Bench Verified: 77.9% | SWE-Lancer IC SWE: 79.9%

---

## Integration with Orpheus SDK

**Status:** JUCE components integrated into `~/dev/orpheus-sdk/packages/shmui-juce/`

**Why Integration:**
- Orpheus SDK is a professional C++20 audio SDK (broadcast-safe, deterministic)
- shmui JUCE components provide audio visualization for Orpheus apps (Clip Composer, Wave Finder, FX Engine)
- React components stay in shmui for web tools

**Synchronization:**
- `juce/Source/` in this repo = **source of truth**
- Sync to Orpheus SDK: `rsync -av --delete ~/dev/shmui/juce/Source/ ~/dev/orpheus-sdk/packages/shmui-juce/`
- Orpheus apps consume from package

**Threading Compatibility (CRITICAL):**
- shmui `AudioAnalyzer` → lock-free atomics → safe for Orpheus broadcast-safe audio threads
- shmui visualizers → JUCE message thread → matches Orpheus model
- Both: NO audio thread allocations, NO locks on audio thread

**See Orpheus SDK:**
- Docs: `~/dev/orpheus-sdk/.codex/AGENTS.md`, `~/dev/orpheus-sdk/CLAUDE.md`
- Architecture: `~/dev/orpheus-sdk/docs/ARCHITECTURE.md`
- Package: `~/dev/orpheus-sdk/packages/shmui-juce/`

---

## Project Context

**shmui** is a DUAL-STACK component library:

1. **React/TypeScript** (web) - Registry-based shadcn/ui components for web apps
2. **JUCE C++** (native) - Ports of React components for desktop audio applications (integrated into Orpheus SDK)

**Component Categories:**
- **Audio Visualizers:** Orbs, waveforms, bar displays, matrix displays (both stacks)
- **Agent Components:** Voice agents, conversational UI (React only)
- **Audio Analysis:** FFT, RMS, frequency bands (JUCE only)
- **General UI:** Buttons, dialogs, forms (React only)

**Distribution:**
- **React:** Registry-based (copy-paste via CLI)
- **JUCE:** Header-only library (`#include "ShmUI.h"`)

---

## Repository Structure

```
shmui/
├── GEMINI.md              # Gemini 3 Pro config (reference)
├── .codex/                # This directory
│   └── AGENTS.md          # This file
├── CLAUDE.md              # Claude Code config (reference)
├── registry/              # React component registry (JSON configs)
│   ├── components/        # React component definitions
│   └── blocks/            # Example blocks
├── juce/                  # JUCE C++ components
│   └── Source/
│       ├── ShmUI.h        # Main include header
│       ├── Audio/         # AudioAnalyzer (FFT, RMS)
│       ├── Components/    # Visualizers (Orb, Waveform, Bar, Matrix)
│       ├── Shaders/       # OpenGL shaders
│       └── Utils/         # Interpolation, ColorUtils
├── apps/                  # Example apps
└── docs/                  # Documentation
```

---

## Quick Commands

**React/TypeScript:**
```bash
# Development
pnpm install
pnpm run dev
pnpm run type-check
pnpm run build
pnpm run test
pnpm run test:a11y
```

**JUCE C++:**
```bash
# Include in JUCE project:
# 1. Add juce/Source to header search paths
# 2. #include "ShmUI.h"
# 3. Link JUCE modules (juce_gui_basics, juce_opengl, juce_dsp)
```

---

## Codex CLI Workflows

### Starting a Session

```bash
cd ~/dev/shmui
codex --model gpt-5.1-codex-max
```

**Or configure default:**
```toml
[codex.shmui]
model = "gpt-5.1-codex-max"
auto_test = true  # Run tests
type_check = true  # TypeScript strict mode
a11y_check = true  # Accessibility (React only)
```

### Long-Horizon Tasks (24+ Hours)

**Example: Dual-stack waveform visualizer**
```
Task: Implement waveform visualizer in BOTH React and JUCE
Estimated time: 24 hours

Phase 1 (8h): React implementation
- Canvas-based waveform rendering
- Zoom/pan functionality
- Keyboard shortcuts
- Accessibility (ARIA labels)
- Light/dark mode support

Phase 2 (8h): JUCE C++ implementation
- juce::Graphics waveform rendering
- AudioAnalyzer integration
- Thread-safe audio/UI communication
- juce::LookAndFeel customization

Phase 3 (4h): Documentation
- React component docs + registry entry
- JUCE integration guide
- Comparison table (when to use which)

Phase 4 (4h): Testing
- React: Accessibility, visual regression
- JUCE: Thread safety (TSan), memory (ASan)
- Cross-stack consistency verification

Expected output:
- registry/components/waveform-visualizer.json
- juce/Source/Components/WaveformVisualizer.h/cpp
- docs/components/waveform-visualizer.md
```

### Code Review Mode

```bash
codex exec "Review PR #23 for:
1. [React] Accessibility (WCAG 2.2 AA)
2. [React] Responsive design (mobile-first)
3. [React] Theming support (light/dark)
4. [JUCE] Thread safety (NO audio thread allocations)
5. [JUCE] Real-time safety (NO locks, NO I/O)
6. [Both] Visual consistency across stacks
7. [Both] Documentation completeness"
```

---

## Dual-Stack Patterns

**React/TypeScript (Web):**
- Accessibility First (WCAG 2.2 AA)
- Responsive Design (Mobile-First)
- Theming (CSS variables)
- State Management (React hooks)

**JUCE C++ (Native):**
- Thread Safety (Audio/Message thread separation)
- Real-Time Safety (NO allocations on audio thread)
- Graphics Optimization (juce::Graphics, OpenGL)
- Look & Feel (juce::LookAndFeel customization)

**Shared Concepts:**
| Feature | React | JUCE |
|---------|-------|------|
| Audio Analysis | Web Audio API | juce::dsp::FFT |
| Waveform | Canvas 2D | juce::Graphics |
| Orb | WebGL shaders | OpenGL shaders |
| Styling | Tailwind CSS | juce::LookAndFeel |

---

## JUCE C++ Threading (CRITICAL)

**AudioAnalyzer (Thread-Safe):**
```cpp
// Audio thread (safe)
void processBlock(juce::AudioBuffer<float>& buffer) {
    analyzer.processAudioBlock(buffer.getReadPointer(0),
                                buffer.getNumSamples(),
                                sampleRate);
}

// Message thread (safe)
void timerCallback() override {
    auto rms = analyzer.getRMS();
    visualizer.setAudioLevel(rms);
}
```

**If you suggest code that allocates on audio thread → FLAG IT IMMEDIATELY and revise.**

---

## Git Workflow

**Before committing:**
```bash
git status
git diff
pnpm run type-check  # React
# JUCE: Verify builds in your JUCE project
```

**Commit format:**
```
feat: add waveform visualizer (React + JUCE)

Implement waveform visualization in both stacks:
- React: Canvas-based, keyboard nav, WCAG 2.2 AA
- JUCE: juce::Graphics, thread-safe, real-time safe

🤖 Generated with GPT-5.1-Codex-Max (OpenAI Codex CLI)
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `a11y`, `juce` (JUCE-specific)

**Verify before committing:**
- [ ] React: Type checking passes
- [ ] React: Accessibility tests pass
- [ ] JUCE: Compiles in example project
- [ ] JUCE: Thread safety verified
- [ ] Documentation updated for both stacks
- [ ] No secrets/credentials

---

## Working with User

**ALWAYS clarify which stack:**
```
User: "Add waveform component"
You: "Should I implement this in React/TypeScript (web), JUCE C++ (native), or both?"
```

**When suggesting dual-stack features:**
1. **Explain stack-specific approach** - "React uses Canvas 2D, JUCE uses juce::Graphics"
2. **Show threading considerations** - "JUCE requires message thread for UI updates"
3. **Provide both implementations** - Side-by-side React and JUCE code
4. **Document when to use which** - Performance, platform, use case

**Format references:**
- React: `registry/components/name.json:42`
- JUCE: `juce/Source/Components/Name.cpp:142`

**Immediately flag:**
- React: Missing accessibility, poor mobile responsiveness
- JUCE: Audio thread violations, missing thread safety
- Both: Inconsistent visual behavior across stacks

---

## See `CLAUDE.md` and `CONTRIBUTING.md` for:

- Detailed workflow conventions
- React component creation process
- JUCE integration patterns
- Testing protocols
- Documentation standards

**Key external resources:**
- React: https://ui.shadcn.com/ (base), https://ui.elevenlabs.io/ (upstream)
- JUCE: https://juce.com/learn/documentation, https://juce.com/learn/tutorials

---

**Version:** 2.0 (Lean, dual-stack aware)
**Last Updated:** 2025-11-25
**Model:** GPT-5.1-Codex-Max (OpenAI, November 2025)
**SWE-Bench Verified:** 77.9% | **SWE-Lancer IC SWE:** 79.9%

**Remember:** shmui is a DUAL-STACK component library. ALWAYS clarify whether working with React/TypeScript (web) or JUCE C++ (native) before suggesting implementations. For React, prioritize accessibility and mobile-first design. For JUCE, prioritize thread safety and real-time performance. Use your 24+ hour capabilities for complete dual-stack feature development.
