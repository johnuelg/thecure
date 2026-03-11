

## Add Prominent ECG/Heartbeat SVG Animation to Hero Background

### What
Replace the current subtle 1px pulse lines with a proper ECG/heartbeat waveform SVG that animates across the hero background — visible but non-intrusive behind the content.

### How

**1. Create an inline SVG ECG waveform** in `HeroSection.tsx`:
- Draw a realistic ECG trace path (flat line → P wave → QRS complex → T wave → flat) using an SVG `<path>`
- Use `stroke-dasharray` + `stroke-dashoffset` CSS animation to create a "drawing" effect that continuously traces the heartbeat
- Place two waveform lines at different vertical positions (top ~20%, bottom ~75%) with staggered timing and reduced opacity

**2. Add keyframes** in `tailwind.config.ts`:
- `ecg-draw`: animates `stroke-dashoffset` from full length to 0 (draws the line)
- Keep existing `pulse-line` animation as-is

**3. Update the hero background container** (lines 57-64 of `HeroSection.tsx`):
- Replace the current thin gradient divs with SVG elements containing the ECG path
- Use `opacity-15` / `opacity-10` so they don't compete with text
- Keep `pointer-events-none` and `z-0` isolation

### Technical Details

The SVG path will approximate a standard ECG PQRST waveform:
```text
M0,50 L40,50 L45,45 L50,50 L60,50 L65,20 L70,80 L75,50 L85,50 L90,42 L100,50 L140,50
```
Repeated across the width. Animation uses CSS `stroke-dasharray` matching total path length, with `stroke-dashoffset` animated from that length to `-length` for continuous replay.

Two SVGs: one wider/slower at top, one narrower/faster at bottom, both using `healthcare-teal` / `healthcare-pulse` stroke colors.

