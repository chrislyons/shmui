# SHM004: Shmui Analysis Roadmap

## Executive Summary

This document provides a comprehensive analysis of gaps in the Shmui codebase and prioritized recommendations for next steps. Based on a thorough review of the project structure, documentation, implementation status, and CI/CD pipeline, I've identified critical improvements across testing, JUCE completion, documentation, and developer experience.

---

## Current State Assessment

### Strengths
- **Mature React Components**: 60+ well-implemented UI components with 7 waveform variants
- **Strategic Documentation**: Excellent SHM001-003 documents with algorithm translation guides
- **JUCE Progress**: ~80% of core visualizers ported (4,192 lines of C++)
- **Build Infrastructure**: Turborepo, pnpm workspaces, CI/CD quality gates
- **Code Quality**: TypeScript strict mode, ESLint, Prettier enforcement

### Critical Gaps Identified
1. **Zero Test Coverage**: No unit, integration, or E2E tests
2. **Incomplete JUCE Port**: Audio player/scrub bar not implemented
3. **SDK Packaging**: JUCE module not packaged for distribution
4. **API Documentation**: No reference docs for web components
5. **Code Technical Debt**: 4 TODO items in production code

---

## Prioritized Roadmap

### Priority 1: Critical Infrastructure (Weeks 1-2)

#### 1.1 Establish Test Foundation
**Impact**: High | **Effort**: Medium | **Risk Reduction**: Critical

The complete absence of tests is the most significant gap. Without tests, refactoring and feature additions carry high regression risk.

**Tasks**:
- [ ] Create test directory structure
  ```
  apps/www/__tests__/
  ├── unit/
  │   ├── components/
  │   ├── hooks/
  │   └── lib/
  ├── integration/
  └── e2e/
  ```
- [ ] Add test utilities and mocks
  - Mock Web Audio API (`AudioContext`, `AnalyserNode`)
  - Mock canvas context for visualization tests
  - Mock MediaStream for microphone tests
- [ ] Write unit tests for core audio visualization components
  - `waveform.tsx` (1,658 lines - highest priority)
  - `orb.tsx` (498 lines)
  - `bar-visualizer.tsx`
  - `matrix.tsx`
- [ ] Write tests for custom hooks
  - `use-debounce.ts`
  - `use-transcript-viewer.ts`
- [ ] Add test scripts to CI pipeline (`.github/workflows/code-check.yml`)
- [ ] Set minimum coverage thresholds (suggest: 60% initial, 80% target)

**Files to Create**:
- `apps/www/__tests__/unit/components/waveform.test.tsx`
- `apps/www/__tests__/unit/components/orb.test.tsx`
- `apps/www/__tests__/unit/components/bar-visualizer.test.tsx`
- `apps/www/__tests__/unit/hooks/use-debounce.test.ts`
- `apps/www/__tests__/setup.ts` (test utilities)
- `apps/www/__tests__/mocks/web-audio.ts`

**Estimated Effort**: 16-24 hours

---

#### 1.2 Resolve Technical Debt (TODOs)
**Impact**: Medium | **Effort**: Low | **Risk Reduction**: Medium

Address existing TODO items to prevent technical debt accumulation.

**Files with TODOs**:

| File | TODO | Recommendation |
|------|------|----------------|
| `lib/registry.ts` | "remove when we migrate to new registry" | Investigate new registry status, create migration ticket or remove |
| `lib/registry.ts` | "do we really need this?" | Audit usage, remove if unused |
| `lib/rehype.ts` | "Use @swc/core and visitor pattern" (2x) | Either implement optimization or document why deferred |
| `source.config.ts` | "fix the type" | Resolve TypeScript type issue |

**Estimated Effort**: 2-4 hours

---

### Priority 2: JUCE Completion (Weeks 2-4)

#### 2.1 Complete Missing JUCE Components
**Impact**: High | **Effort**: Medium | **Dependencies**: None

The JUCE port is ~80% complete but missing transport controls, which are essential for audio applications.

**Components to Implement**:

**AudioPlayerControls.h/cpp**
- Play/pause state management
- Seek functionality with position callback
- Speed control (0.25x to 2.0x)
- Time display formatting (mm:ss)
- Transport button rendering

Reference implementation: `apps/www/registry/elevenlabs-ui/ui/audio-player.tsx` (~300 lines)

**ScrubBar.h/cpp**
- Timeline rendering with progress indicator
- Playhead visualization
- Click-to-seek interaction
- Duration display
- Drag interaction for scrubbing

Reference implementation: `apps/www/registry/elevenlabs-ui/ui/scrub-bar.tsx` (~200 lines)

**Files to Create**:
- `juce/Source/Components/AudioPlayerControls.h`
- `juce/Source/Components/AudioPlayerControls.cpp`
- `juce/Source/Components/ScrubBar.h`
- `juce/Source/Components/ScrubBar.cpp`

**Estimated Effort**: 12-16 hours

---

#### 2.2 JUCE Module Packaging (SHM003 Implementation)
**Impact**: High | **Effort**: Low | **Dependencies**: 2.1

Package as proper JUCE module for SDK integration as specified in SHM003.

**Tasks**:
- [ ] Create module structure
  ```
  shmui/
  ├── shmui.h            # Main module header
  ├── shmui.cpp          # Module implementation
  └── shmui/             # Module contents
      ├── Audio/
      ├── Components/
      ├── Shaders/
      └── Utils/
  ```
- [ ] Remove `JuceHeader.h` includes (use `#pragma once` + forward declarations)
- [ ] Embed shaders as binary resources
- [ ] Create module manifest
- [ ] Add namespace consistency (`shmui::` prefix)
- [ ] Write JUCE module documentation

**Files to Create/Modify**:
- `juce/modules/shmui/shmui.h`
- `juce/modules/shmui/shmui.cpp`
- Migrate all source files to module structure

**Estimated Effort**: 7-9 hours (as documented in SHM003)

---

### Priority 3: Documentation Enhancement (Weeks 3-4)

#### 3.1 API Reference Documentation
**Impact**: Medium | **Effort**: Medium | **Dependencies**: Tests (1.1)

Create comprehensive API documentation for external developers.

**Tasks**:
- [ ] Generate TypeDoc/TSDoc for React components
- [ ] Document all component props with examples
- [ ] Add JSDoc comments to all public functions
- [ ] Create Storybook or similar component playground
- [ ] Document JUCE API (Doxygen)

**Focus Components** (by complexity):
1. `waveform.tsx` - 7 variants, most complex
2. `orb.tsx` - 3D rendering, shader integration
3. `bar-visualizer.tsx` - State machine, frequency analysis
4. `audio-player.tsx` - Transport controls

**Files to Create**:
- `apps/www/docs/api/README.md`
- `apps/www/docs/api/waveform.md`
- `apps/www/docs/api/orb.md`
- `apps/www/docs/api/bar-visualizer.md`
- `juce/docs/README.md`

**Estimated Effort**: 8-12 hours

---

#### 3.2 Migration Guide
**Impact**: Medium | **Effort**: Low | **Dependencies**: None

Help existing ElevenLabs UI users migrate to Shmui.

**Tasks**:
- [ ] Document differences from ElevenLabs UI
- [ ] Create upgrade checklist
- [ ] Document breaking changes
- [ ] Provide code transformation examples

**File to Create**:
- `docs/MIGRATION.md`

**Estimated Effort**: 3-4 hours

---

### Priority 4: Quality Assurance (Weeks 4-5)

#### 4.1 Visual Regression Testing
**Impact**: Medium | **Effort**: Medium | **Dependencies**: Tests (1.1)

Leverage existing Puppeteer setup for automated visual testing.

**Tasks**:
- [ ] Configure visual regression framework (Percy, Chromatic, or Playwright)
- [ ] Create baseline screenshots for all components
- [ ] Add visual tests to CI pipeline
- [ ] Document visual testing process

**Integration with Existing Infrastructure**:
- Puppeteer 23.6.0 already installed
- `scripts/capture-registry.mts` can be extended

**Estimated Effort**: 8-12 hours

---

#### 4.2 Performance Benchmarks
**Impact**: Medium | **Effort**: Medium | **Dependencies**: Tests (1.1)

Audio visualizations are performance-critical. Establish benchmarks.

**Tasks**:
- [ ] Create performance test suite
- [ ] Benchmark canvas rendering FPS
- [ ] Benchmark FFT analysis throughput
- [ ] Profile memory usage for long-running visualizations
- [ ] Add performance regression tests to CI

**Key Metrics**:
- Target: 60 FPS rendering
- Memory stability over 10+ minutes
- CPU usage < 5% when idle
- Startup latency < 100ms

**Estimated Effort**: 8-10 hours

---

### Priority 5: Developer Experience (Weeks 5-6)

#### 5.1 Example Improvements
**Impact**: Low | **Effort**: Low | **Dependencies**: None

Enhance existing examples for better onboarding.

**Tasks**:
- [ ] Add inline comments to demo blocks
- [ ] Create "getting started" minimal examples
- [ ] Document common integration patterns
- [ ] Add troubleshooting guide

**Estimated Effort**: 4-6 hours

---

#### 5.2 Development Environment
**Impact**: Low | **Effort**: Low | **Dependencies**: None

Improve local development experience.

**Tasks**:
- [ ] Add VSCode workspace settings
- [ ] Create development documentation
- [ ] Add pre-commit hooks for tests
- [ ] Document debugging techniques for audio issues

**Files to Create**:
- `.vscode/settings.json`
- `.vscode/extensions.json`
- `docs/DEVELOPMENT.md`

**Estimated Effort**: 2-3 hours

---

## Implementation Timeline

```
Week 1-2: Critical Infrastructure
├── 1.1 Test Foundation (16-24 hrs)
└── 1.2 Technical Debt (2-4 hrs)

Week 2-4: JUCE Completion
├── 2.1 Missing Components (12-16 hrs)
└── 2.2 Module Packaging (7-9 hrs)

Week 3-4: Documentation
├── 3.1 API Reference (8-12 hrs)
└── 3.2 Migration Guide (3-4 hrs)

Week 4-5: Quality Assurance
├── 4.1 Visual Regression (8-12 hrs)
└── 4.2 Performance Benchmarks (8-10 hrs)

Week 5-6: Developer Experience
├── 5.1 Example Improvements (4-6 hrs)
└── 5.2 Development Environment (2-3 hrs)
```

**Total Estimated Effort**: 70-100 hours (4-6 weeks at 15-20 hrs/week)

---

## Quick Wins (< 4 hours each)

These can be tackled immediately for visible progress:

1. **Resolve TODOs** (2-4 hrs) - Clean up technical debt
2. **VSCode workspace** (2-3 hrs) - Improve DX
3. **Migration guide skeleton** (2 hrs) - Document differences
4. **Add test job to CI** (1 hr) - Even without tests, adds placeholder

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| No tests = regression risk | High | Priority 1.1 addresses immediately |
| JUCE components untested in production | Medium | Add integration tests with JUCE host |
| API undocumented = adoption barrier | Medium | Priority 3.1 comprehensive docs |
| Performance issues in visualizations | Low-Medium | Priority 4.2 benchmarks |

---

## Success Metrics

### Short-term (4 weeks)
- [ ] Test coverage > 60%
- [ ] JUCE module packaged and distributable
- [ ] Zero TODO items in production code
- [ ] API documentation for all public components

### Medium-term (8 weeks)
- [ ] Test coverage > 80%
- [ ] Visual regression tests in CI
- [ ] Performance benchmarks established
- [ ] Migration guide complete

### Long-term (12 weeks)
- [ ] Community contributions enabled
- [ ] Published to package registry (npm/JUCE ecosystem)
- [ ] Production deployments by external users

---

## Appendix: File Reference

### High-Priority Files for Testing

| Component | Path | Lines | Priority |
|-----------|------|-------|----------|
| Waveform | `apps/www/registry/elevenlabs-ui/ui/waveform.tsx` | 1,658 | Critical |
| Orb | `apps/www/registry/elevenlabs-ui/ui/orb.tsx` | 498 | High |
| Bar Visualizer | `apps/www/registry/elevenlabs-ui/ui/bar-visualizer.tsx` | ~300 | High |
| Matrix | `apps/www/registry/elevenlabs-ui/ui/matrix.tsx` | ~250 | Medium |
| Audio Player | `apps/www/registry/elevenlabs-ui/ui/audio-player.tsx` | ~300 | Medium |

### JUCE Files to Create

| Component | Header | Implementation |
|-----------|--------|----------------|
| Audio Player Controls | `juce/Source/Components/AudioPlayerControls.h` | `AudioPlayerControls.cpp` |
| Scrub Bar | `juce/Source/Components/ScrubBar.h` | `ScrubBar.cpp` |

### Documentation Files to Create

| Document | Path | Purpose |
|----------|------|---------|
| API Reference Index | `apps/www/docs/api/README.md` | Entry point for API docs |
| Migration Guide | `docs/MIGRATION.md` | ElevenLabs UI to Shmui |
| Development Guide | `docs/DEVELOPMENT.md` | Local dev setup |

---

## Conclusion

Shmui is a well-architected project with strong foundations in component design and strategic documentation. The primary gaps are in **testing infrastructure** and **JUCE completion**. Addressing Priority 1 (Critical Infrastructure) will significantly reduce regression risk and enable confident iteration. The JUCE completion (Priority 2) is essential for the Orpheus SDK integration goal.

The recommended approach is to tackle Priorities 1-2 in parallel where possible, as they have minimal dependencies on each other. Documentation (Priority 3) can proceed alongside implementation work.

---

*Document created: 2025-11-19*
*Analysis scope: Full codebase review including React components, JUCE port, documentation, and CI/CD*
