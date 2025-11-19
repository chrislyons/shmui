# Migration Guide: ElevenLabs UI to Shmui

This guide helps you migrate from the original ElevenLabs UI library to Shmui.

## Overview

Shmui is a fork of ElevenLabs UI that focuses on audio visualization components. Most components work identically, but there are some import path and naming changes to be aware of.

## Quick Start

### 1. Update Package

```bash
# Remove old package (if installed)
npm uninstall @elevenlabs/ui

# Install shmui components directly from your registry
# Components are available in the registry/elevenlabs-ui directory
```

### 2. Update Import Paths

**Before (ElevenLabs UI):**
```typescript
import { Waveform } from "@elevenlabs/ui"
import { Orb } from "@elevenlabs/ui"
import { BarVisualizer } from "@elevenlabs/ui"
```

**After (Shmui):**
```typescript
import { Waveform } from "@/registry/elevenlabs-ui/ui/waveform"
import { Orb } from "@/registry/elevenlabs-ui/ui/orb"
import { BarVisualizer } from "@/registry/elevenlabs-ui/ui/bar-visualizer"
```

## Component Mapping

| ElevenLabs UI | Shmui | Notes |
|---------------|-------|-------|
| `Waveform` | `Waveform` | Same API |
| `ScrollingWaveform` | `ScrollingWaveform` | Same API |
| `AudioScrubber` | `AudioScrubber` | Same API |
| `MicrophoneWaveform` | `MicrophoneWaveform` | Same API |
| `StaticWaveform` | `StaticWaveform` | Same API |
| `LiveMicrophoneWaveform` | `LiveMicrophoneWaveform` | Same API |
| `RecordingWaveform` | `RecordingWaveform` | Same API |
| `Orb` | `Orb` | Same API |
| `BarVisualizer` | `BarVisualizer` | Same API |
| `Matrix` | `Matrix` | Same API |
| `AudioPlayer` | `AudioPlayerProvider` + components | Modular design |

## Import Path Changes

### Waveform Components

```typescript
// Before
import { Waveform, ScrollingWaveform, AudioScrubber } from "@elevenlabs/ui"

// After
import {
  Waveform,
  ScrollingWaveform,
  AudioScrubber,
  MicrophoneWaveform,
  StaticWaveform,
  LiveMicrophoneWaveform,
  RecordingWaveform
} from "@/registry/elevenlabs-ui/ui/waveform"
```

### Orb Component

```typescript
// Before
import { Orb } from "@elevenlabs/ui"

// After
import { Orb } from "@/registry/elevenlabs-ui/ui/orb"
```

### Bar Visualizer

```typescript
// Before
import { BarVisualizer } from "@elevenlabs/ui"

// After
import { BarVisualizer } from "@/registry/elevenlabs-ui/ui/bar-visualizer"
```

### Audio Player

```typescript
// Before
import { AudioPlayer } from "@elevenlabs/ui"

// After
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
  AudioPlayerDuration,
  AudioPlayerSpeed,
  useAudioPlayer,
  useAudioPlayerTime
} from "@/registry/elevenlabs-ui/ui/audio-player"
```

### Scrub Bar

```typescript
// Before
import { ScrubBar } from "@elevenlabs/ui"

// After
import {
  ScrubBarContainer,
  ScrubBarTrack,
  ScrubBarProgress,
  ScrubBarThumb,
  ScrubBarTimeLabel
} from "@/registry/elevenlabs-ui/ui/scrub-bar"
```

## API Changes

### No Breaking Changes

All component props remain the same. The following are fully compatible:

- `Waveform` props: `data`, `barWidth`, `barHeight`, `barGap`, `barRadius`, `barColor`, `fadeEdges`, `fadeWidth`, `height`, `onBarClick`
- `Orb` props: `colors`, `colorsRef`, `agentState`, `volumeMode`, `manualInput`, `manualOutput`, etc.
- `BarVisualizer` props: `state`, `barCount`, `mediaStream`, `minHeight`, `maxHeight`, `demo`, `centerAlign`

### New Features in Shmui

1. **Additional waveform variants**: `LiveMicrophoneWaveform`, `RecordingWaveform`
2. **Enhanced hooks**: `useAudioVolume`, `useMultibandVolume`, `useBarAnimator`
3. **Modular audio player**: Separate components for better composition

## Hooks Migration

### useAudioVolume

```typescript
// New hook for single-band volume tracking
import { useAudioVolume } from "@/registry/elevenlabs-ui/ui/bar-visualizer"

const volume = useAudioVolume(mediaStream, {
  fftSize: 32,
  smoothingTimeConstant: 0
})
```

### useMultibandVolume

```typescript
// New hook for multi-band frequency analysis
import { useMultibandVolume } from "@/registry/elevenlabs-ui/ui/bar-visualizer"

const bands = useMultibandVolume(mediaStream, {
  bands: 5,
  loPass: 100,
  hiPass: 600
})
```

## Styling Changes

Shmui uses the same Tailwind CSS classes and CSS variables. Ensure your tailwind config includes:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./registry/elevenlabs-ui/**/*.{ts,tsx}",
    // ... other paths
  ],
  // ... rest of config
}
```

## CSS Variables

Ensure these CSS variables are defined:

```css
:root {
  --foreground: 240 10% 3.9%;
  --background: 0 0% 100%;
  --primary: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  /* ... other variables */
}
```

## Testing Your Migration

1. **Visual Check**: Compare component rendering with the original
2. **Audio Check**: Verify microphone and audio playback work correctly
3. **Animation Check**: Confirm animations are smooth (60 FPS target)
4. **Interaction Check**: Test all interactive elements (scrubbing, clicking, etc.)

## Common Issues

### Issue: Components not rendering

**Solution**: Ensure you've imported from the correct path and wrapped audio player components in `AudioPlayerProvider`.

### Issue: Styles not applied

**Solution**: Verify CSS variables are defined and Tailwind content paths include the registry directory.

### Issue: Web Audio API errors

**Solution**: Ensure your site is served over HTTPS (required for `getUserMedia`).

## Need Help?

- Open an issue: https://github.com/chrislyons/shmui/issues
- Review the documentation in `/docs/shm/`
- Check component examples in `/apps/www/registry/elevenlabs-ui/examples/`

## Changelog

### v1.0.0
- Initial fork from ElevenLabs UI
- Added JUCE C++ port for native applications
- Enhanced documentation
- Added comprehensive test suite
