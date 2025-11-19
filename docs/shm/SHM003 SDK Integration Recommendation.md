# SHM003 SDK Integration Recommendation

Integration strategy for incorporating shmui audio visualization components into orpheus-sdk.

---

## Recommendation: JUCE Module Format

Convert shmui to a proper JUCE module for seamless integration with orpheus-sdk.

### Rationale

| Factor | JUCE Module | Git Submodule | Direct Copy |
|--------|-------------|---------------|-------------|
| JUCE-native | Yes | No | No |
| Version control | Via SDK repo | Pinned commit | Manual |
| Dependency mgmt | Automatic | Manual CMake | None |
| Projucer support | Yes | No | Partial |
| Update workflow | Pull + rebuild | Submodule update | Manual copy |

JUCE modules are the standard distribution format for JUCE libraries. They integrate directly with both Projucer and CMake-based builds.

---

## Implementation Plan

### Phase 1: Module Structure

Create the following structure in shmui repository:

```
modules/
└── shmui/
    ├── shmui.h                    # Module declaration header
    ├── shmui.cpp                  # Unity build file
    └── shmui/                     # Source directory
        ├── Audio/
        │   ├── AudioAnalyzer.h
        │   └── AudioAnalyzer.cpp
        ├── Components/
        │   ├── WaveformVisualizer.h
        │   ├── WaveformVisualizer.cpp
        │   ├── BarVisualizer.h
        │   ├── BarVisualizer.cpp
        │   ├── OrbVisualizer.h
        │   ├── OrbVisualizer.cpp
        │   ├── MatrixDisplay.h
        │   └── MatrixDisplay.cpp
        ├── Shaders/
        │   ├── OrbVertex.glsl
        │   └── OrbFragment.glsl
        └── Utils/
            ├── Interpolation.h
            └── ColorUtils.h
```

### Phase 2: Module Header

Create `modules/shmui/shmui.h`:

```cpp
/*******************************************************************************

 BEGIN_JUCE_MODULE_DECLARATION

  ID:               shmui
  vendor:           chrislyons
  version:          1.0.0
  name:             Shmui Audio Visualization
  description:      Audio visualization components for JUCE applications
  website:          https://github.com/chrislyons/shmui
  license:          MIT
  minimumCppStandard: 17

  dependencies:     juce_audio_basics juce_graphics juce_gui_basics juce_dsp juce_opengl

 END_JUCE_MODULE_DECLARATION

*******************************************************************************/

#pragma once
#define SHMUI_H_INCLUDED

#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_graphics/juce_graphics.h>
#include <juce_gui_basics/juce_gui_basics.h>
#include <juce_dsp/juce_dsp.h>
#include <juce_opengl/juce_opengl.h>

// Core analysis
#include "shmui/Audio/AudioAnalyzer.h"

// Visualization components
#include "shmui/Components/WaveformVisualizer.h"
#include "shmui/Components/BarVisualizer.h"
#include "shmui/Components/OrbVisualizer.h"
#include "shmui/Components/MatrixDisplay.h"

// Utilities
#include "shmui/Utils/Interpolation.h"
#include "shmui/Utils/ColorUtils.h"
```

### Phase 3: Unity Build File

Create `modules/shmui/shmui.cpp`:

```cpp
/*******************************************************************************

    Shmui Audio Visualization Module

*******************************************************************************/

#ifdef SHMUI_H_INCLUDED
 /* When you add this cpp file to your project, you mustn't include it in a file
    where you've already included any other headers - just put it inside a file on
    its own, possibly with your config flags preceding it, but don't include
    anything else. */
 #error "Incorrect use of shmui.cpp"
#endif

#include "shmui.h"

// Embed shaders as binary data
namespace shmui
{
namespace Shaders
{
#include "shmui/Shaders/OrbVertex.glsl"
#include "shmui/Shaders/OrbFragment.glsl"
}
}

// Implementation files
#include "shmui/Audio/AudioAnalyzer.cpp"
#include "shmui/Components/WaveformVisualizer.cpp"
#include "shmui/Components/BarVisualizer.cpp"
#include "shmui/Components/OrbVisualizer.cpp"
#include "shmui/Components/MatrixDisplay.cpp"
```

### Phase 4: SDK Integration

In orpheus-sdk, add the module path:

**Projucer:**
1. Open orpheus-sdk.jucer
2. Modules > Add a module from a specified folder
3. Navigate to shmui/modules/shmui
4. Save and export

**CMake:**
```cmake
# In orpheus-sdk CMakeLists.txt
juce_add_module(${CMAKE_CURRENT_SOURCE_DIR}/../shmui/modules/shmui)

target_link_libraries(OrpheusSDK
    PRIVATE
        shmui
        juce::juce_audio_basics
        juce::juce_dsp
        juce::juce_opengl
)
```

---

## Source Modifications Required

### 1. Remove JuceHeader.h Includes

JUCE modules should not include `JuceHeader.h`. Replace with specific module includes:

```cpp
// Before
#include <JuceHeader.h>

// After
#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_graphics/juce_graphics.h>
#include <juce_gui_basics/juce_gui_basics.h>
#include <juce_dsp/juce_dsp.h>
#include <juce_opengl/juce_opengl.h>
```

### 2. Shader Loading

Modify OrbVisualizer to load shaders from embedded binary data instead of file paths. Use JUCE's BinaryData or embed as raw strings.

### 3. Namespace Consistency

Ensure all code uses the `shmui` namespace consistently for clean API:

```cpp
// Usage in orpheus-sdk
auto analyzer = std::make_unique<shmui::AudioAnalyzer>(shmui::AudioAnalyzer::AnalysisMode::Spectrum);
auto waveform = std::make_unique<shmui::WaveformVisualizer>(shmui::WaveformVisualizer::Mode::Live);
```

---

## Testing Strategy

### Unit Tests

Create test module `shmui_tests` with:

- AudioAnalyzer FFT accuracy tests
- Smoothing algorithm verification
- Thread safety stress tests
- Color utility edge cases

### Visual Tests

Demo application with:

- All visualizer types in single window
- Audio input selector
- Parameter controls (smoothing, sensitivity, colors)
- State machine transitions

### Integration Tests

In orpheus-sdk:

- Verify module links correctly
- Check thread model compatibility with OCC
- Validate OpenGL context sharing

---

## Migration Checklist

- [ ] Create `modules/shmui/` directory structure
- [ ] Write module header with declaration block
- [ ] Write unity build cpp file
- [ ] Move source files to `modules/shmui/shmui/`
- [ ] Remove `JuceHeader.h` includes from all files
- [ ] Embed shaders as binary data or string literals
- [ ] Update OrbVisualizer shader loading
- [ ] Test standalone build
- [ ] Add module to orpheus-sdk
- [ ] Verify compilation in orpheus-sdk
- [ ] Run thread safety tests
- [ ] Create demo/test application
- [ ] Update documentation

---

## Alternative: Minimal Integration

If full module conversion is not immediately feasible, use git submodule with CMake:

```bash
# In orpheus-sdk
git submodule add https://github.com/chrislyons/shmui.git external/shmui
```

```cmake
# CMakeLists.txt
add_library(shmui STATIC
    external/shmui/juce/Source/Audio/AudioAnalyzer.cpp
    external/shmui/juce/Source/Components/WaveformVisualizer.cpp
    external/shmui/juce/Source/Components/BarVisualizer.cpp
    external/shmui/juce/Source/Components/OrbVisualizer.cpp
    external/shmui/juce/Source/Components/MatrixDisplay.cpp
)

target_include_directories(shmui PUBLIC external/shmui/juce/Source)
target_link_libraries(shmui PUBLIC juce::juce_dsp juce::juce_opengl)
```

This works but loses JUCE module benefits (automatic dependency resolution, Projucer support).

---

## Timeline Estimate

| Task | Effort |
|------|--------|
| Module structure creation | 2 hours |
| Source file migration | 1 hour |
| JuceHeader.h removal | 30 min |
| Shader embedding | 1 hour |
| SDK integration | 1 hour |
| Testing | 2-4 hours |
| **Total** | **7-9 hours** |

---

## References

- SHM001 Shmui-JUCE Integration Plan
- SHM002 Shmui-Orpheus Agent Handoff
- [JUCE Module Format Documentation](https://github.com/juce-framework/JUCE/blob/master/docs/JUCE%20Module%20Format.md)
