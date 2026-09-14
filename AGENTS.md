# AGENTS.md — World Cup Suika Developer & Agent Guide

Welcome to **World Cup Suika** (formerly *Flag Fusion 2026*)! This document defines the operating rules, architectural knowledge, and coaching protocols for AI assistants working on this repository.

---

## 🚨 PRIME DIRECTIVE FOR AI AGENTS: DO NOT WRITE THE GAME CODE FOR THE USER

> **CRITICAL INSTRUCTION**:
> Unless the user explicitly says words to the effect of *"Write the code for me"* or *"Implement this file directly"*, **YOU MUST NEVER DIRECTLY WRITE OR OVERWRITE THE CODE IN THEIR GAME LOGIC FILES (`Game.ts`, `Preloader.ts`, `config.ts`, `main.ts`)**.
> 
> *Note on HTML & CSS*: The user has previously explicitly authorized the agent to edit `index.html` and `src/style.css` directly since they prefer to focus on the game's TypeScript code.
>
> Instead, your role is to act as an **Interactive Socratic Coach, Systems Architect, and Pair-Programming Mentor**.
>
> You are here to empower the user to build, learn, and master their own codebase.

### How to Guide the User:
1. **Explain the Concept First**: Explain *what* needs to be done, *where* in the architecture it belongs, and *why* that approach is recommended.
2. **Break into Incremental Steps**: Never dump an overwhelming list of tasks. Break complex features down into bite-sized, logical milestones.
3. **Use Scaffolding & Precise References**: Point out relevant line numbers, Phaser/Matter.js APIs, and concise modular snippets.
4. **Encourage Iteration**: After providing a step, pause and ask the user to implement and test it.

---

## 📖 Project Overview

**World Cup Suika** is a 2D physics puzzle merge game built on the classic *Suika Game* (Watermelon Game) mechanic, themed on the 2026 FIFA World Cup tournament finishers.

### Core Loop:
1. The player aims horizontally at the top of the container with their pointer/mouse or by sliding their finger on touch screens.
2. A dashed drop line guide shows alignment.
3. Releasing drops a circular flag ball into the container with Matter.js physics.
4. When two balls of the same tier collide, they fuse together into the next higher-tier, larger country ball.
5. Fusing awards points, triggers colorful particle explosions, creates floating score badges, plays pitch-ascending musical chimes, and illuminates the tournament evolution bracket at the bottom!

---

## 🏗️ Architecture & Tech Stack

- **Engine**: [Phaser 4](https://phaser.io/) (`phaser: ^4.1.0`)
- **Physics**: Matter.js (2D rigid body physics integrated into Phaser)
- **Language**: TypeScript (`~6.0.2`)
- **Bundler / Dev Server**: Vite (`^8.0.12`)
- **Package Manager / Runtime**: [Bun](https://bun.sh/) (`bun dev`, `bun run build`)
- **Canvas Resolution**: `480 x 720` (fixed aspect ratio, scaled with `Phaser.Scale.FIT`)

### Repository Structure:
```
world-cup-suika/
├── index.html                    # Root HTML document, 3-column glass layout, evolution track
├── package.json                  # Dependencies & npm scripts (dev, build, preview)
├── tsconfig.json                 # TypeScript compiler options (noUnusedParameters: true)
├── public/
│   └── assets/
│       └── flags/               # Flag PNG image assets (11 countries)
└── src/
    ├── main.ts                   # Web entrypoint, invokes StartGame on DOMContentLoaded
    ├── style.css                 # Frosted glassmorphism, responsive mobile styles, animations
    └── game/
        ├── config.ts             # Dimensions, DANGER_ZONE_Y (190), BALL_DEFINITIONS (11 tiers)
        ├── types.ts              # TypeScript enums & BallDefinition interface
        ├── audio.ts              # Procedural Web Audio synthesizer (SoundManager)
        ├── main.ts               # Phaser GameConfig (Scale.FIT, Scale.CENTER_BOTH, matter)
        ├── gameobjects/
        │   └── Ball.ts           # Custom Matter.Physics.Image circular body
        └── scenes/
            ├── Preloader.ts      # Circular flag canvas baking, 3D container, drop guides
            └── Game.ts           # Core gameplay scene (drop, collision, fusion, particles)
```

---

## 🔬 Current Feature Status & Completed Milestones

### 1. 11-Tier Tournament Hierarchy (`src/game/config.ts`)
Based on 2026 World Cup finishers:
1. `co` (Colombia) — Tier 1, Radius 16px, Score 1
2. `br` (Brazil) — Tier 2, Radius 22px, Score 2
3. `pt` (Portugal) — Tier 3, Radius 28px, Score 4
4. `ch` (Switzerland) — Tier 4, Radius 34px, Score 8
5. `ma` (Morocco) — Tier 5, Radius 40px, Score 16
6. `be` (Belgium) — Tier 6, Radius 48px, Score 32
7. `no` (Norway) — Tier 7, Radius 56px, Score 64
8. `fr` (France) — Tier 8, Radius 62px, Score 128
9. `gb-eng` (England) — Tier 9, Radius 70px, Score 256
10. `ar` (Argentina) — Tier 10, Radius 78px, Score 512
11. `es` (Spain — 2026 Champions!) — Tier 11, Radius 86px, Score 1024

### 2. Frosted Glass UI & Responsive HUD (`index.html`, `src/style.css`)
- Stadium grass radial background (`#1f7a37` to `#0a2e14`).
- Glassmorphic Score & Next cards, mobile-compacted (`76px` height, flanking outer edges, Best Score hidden on mobile).
- Horizontal Evolution Track with glowing unlock states and `@keyframes evoPop`.

### 3. Danger Line & Game Over System (`src/game/scenes/Game.ts`)
- `DANGER_ZONE_Y = 190` positioned just under the container opening ($Y \approx 175$).
- Dynamic 2-stage visual alert:
  - Green/Safe ($>260\text{px}$): Line hidden (`alpha: 0`).
  - Warning ($190\text{px} - 260\text{px}$): Soft steady glow.
  - Panic ($<190\text{px}$): Sine wave flashing pulse (`Math.sin`) with a 2.5s grace period timer.
- Glassmorphic `#game-over-modal` with restart flow.
- Development shortcuts (`D` = instant danger, `W` = warning, `C` = clear, `S` = Spain celebration).

### 4. Visual "Juice" & Polish
- Elastic pop-in when balls merge (`scale: 0.2` to `1.0` with `Back.easeOut`, nudging neighbors).
- Tier-scaled camera shake (`this.cameras.main.shake(...)`).
- Floating gold score badges (`+16`, `+128` etc.) that drift upward and fade.
- Spain Grand Finale: Upward-bursting multi-color confetti fountain, camera shake, and floating golden trophy banner.

### 5. Procedural Web Audio Synthesizer (`src/game/audio.ts`)
- Zero external audio files required. Uses Web Audio API (`AudioContext`).
- Pitch-ascending musical chime per tier (C4 up to G5).
- Physical drop whoosh, soft bounce clack, sad game over jingle, Spain fanfare.
- Glassmorphic mute/unmute button in top header with `localStorage` persistence.

### 6. Mobile Touch Controls & Responsiveness
- Drag-to-aim (`pointerdown` & `pointermove`) and release-to-drop (`pointerup`).
- `Phaser.Scale.FIT` and `Phaser.Scale.CENTER_BOTH`.
- `touch-action: none` and `overscroll-behavior: none` to prevent page scrolling/gestures.

### 7. Game Over Modal Polish & Sound Polish (`Game.ts`, `index.html`, `src/style.css`)
- **Highest Nation Reached**: Displays tournament peak milestone badge with circular flag avatar and tier tag.
- **New Record Celebration**: Animated pulsating golden record banner (`#new-record-badge` with `@keyframes recordPulse`).
- **Post-Game Over Spawn Guard**: Added `if (this.isGameOver) return;` inside `dropBall()` 650ms delay to prevent orphan balls.
- **Merge Audio Clean-up**: Guarded `collisionstart` with `continue;` on actual fusions so bounce clack does not layer over the merge chime.
- **Evolution Track Selector**: Corrected quote formatting in `querySelector('.evo-step[data-level="${level}"]')`.

---

## 🎯 Next Steps & Future Backlog

1. **Typo Fix on Line 377 in `Game.ts`**:
   - Current: `document.getElementById('new-record-badget')`
   - Fix: Remove trailing 't' -> `document.getElementById('new-record-badge')`
2. **Tactical Nudge / Shake Button**:
   - Add a Nudge button with a 15-second cooldown timer to dislodge awkwardly wedged balls.
   - **Impulse Physics**: Iterate through active settled balls and apply upward lift (`body.velocity.y -= 2.0`) and slight random horizontal force.
   - **Visual & Audio**: Trigger a subtle camera micro-shake (`cameras.main.shake(120, 0.004)`) and soft bounce sound (`soundManager.playBounce(0.8)`).
   - **UI Placement**: Frosted glass button with countdown timer either in the site header navbar (next to sound toggle) or as a floating action button near the container.

