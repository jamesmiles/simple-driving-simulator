# Simple Driving Simulator

A birds-eye-view driving simulator built on [pb-galaga](https://github.com/jamesmiles/pb-galaga) engine patterns.

## Controls

| Action | Key | Range |
|--------|-----|-------|
| Throttle Up | `=` | 0–10 |
| Throttle Down | `-` | 0–10 |
| Brake Up | `A` | 0–5 |
| Brake Down | `Z` | 0–5 |
| Steer Left | `←` | -10 to 10 |
| Steer Right | `→` | -10 to 10 |
| Restart | `R` | — |

All controls are tap-to-set — each press adjusts the value by 1 step. Steering stays at the set angle until changed.

## Scoring

- **+10 points** for each gate passed (between consecutive cones)
- **-10 points** for hitting a cone (also voids the next gate)
- **Crash** if the vehicle leaves the road

## Vehicle Configuration

Three parameters affect vehicle handling (defaults: 5/5/5):

- **Power** — affects acceleration rate
- **Weight** — affects braking performance (heavier = more momentum)
- **Turning Circle** — affects steering responsiveness

## Development

```bash
npm install        # Install dev dependencies
npm run dev        # Start dev server
npm run build      # TypeScript check + production build (single-file dist/index.html)
npm test           # Run all unit tests
```

## Project Structure

```
src/
├── engine/        # GameLoop, GameManager, StateManager, DrivingEngine, Camera, Input
├── renderer/      # Canvas2DRenderer, HUD, drawing/ (vehicle, course)
├── audio/         # SoundManager (procedural synthesis)
└── types.ts       # All TypeScript interfaces
```

## Engine

Built on pb-galaga patterns:

- **Fixed timestep** (60Hz) with accumulator and interpolated rendering
- **Double-buffered state** with pointer swap (O(1), no deep copy)
- **Decoupled engine/renderer** — game logic runs headless for testing
- **75 unit tests** across 6 co-located test files
- **Zero runtime dependencies** — 15KB single-file build
