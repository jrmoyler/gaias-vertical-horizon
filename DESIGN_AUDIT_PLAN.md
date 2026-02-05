# Design Audit Plan — Gaia's Vertical Horizon

## Skill / Process Note
- No matching local DESIGN_SYSTEM.md, FRONTEND_GUIDELINES.md, APP_FLOW.md, PRD.md, TECH_STACK.md, progress.txt, or LESSONS.md files were found in this repository, so this audit is based on the implemented UI code and available styles.
- Live viewport walkthrough is currently blocked by environment package-install restrictions (details in Validation), so recommendations are based on source-level audit and architecture consistency checks.

## DESIGN AUDIT RESULTS

### Overall Assessment
The experience has strong visual ambition and brand personality, but hierarchy is over-saturated: multiple neon gradients, shimmer layers, and competing emphasis make primary actions harder to parse at a glance. The interface can be elevated significantly by reducing decorative noise, tightening spacing rhythm, and standardizing component states into a calmer, token-driven visual system.

## PHASE 1 — Critical

### Game Layout (`components/game/game-client.tsx`)
- **What’s wrong:** On desktop, the 3-column grid gives equal visual weight to side panels and 3D scene, while the scene is the core interaction surface.
- **What it should be:** Promote center column dominance (`lg:grid-cols-[320px_minmax(0,1fr)_320px]`) and increase scene container emphasis while reducing panel visual contrast.
- **Why this matters:** Users should identify the primary action area within 2 seconds; current balance dilutes intent.

### Typography Hierarchy (all game panels)
- **What’s wrong:** Frequent use of `font-orbitron` + uppercase + gradients across headers and data labels creates hierarchy flattening.
- **What it should be:** Restrict display type to top-level page title + key numeric values; panel labels and helper text should use Space Grotesk with one subdued neutral tone.
- **Why this matters:** When every label looks “important,” scanning speed drops and cognitive load rises.

### Interaction State Consistency (`crop-selector.tsx`, `upgrades-shop.tsx`, `environmental-panel.tsx`)
- **What’s wrong:** Different hover/focus/selected treatments (scale, glow, border thickness changes, shimmer transitions) are mixed without a single interaction contract.
- **What it should be:** Define one interaction pattern set: hover (border tint + subtle elevation), selected (accent border + background tint), focus-visible (2px ring token).
- **Why this matters:** Inconsistent interaction language undermines trust and makes controls feel custom rather than inevitable.

### Responsiveness / Mobile Density (`game-client.tsx`, panel components)
- **What’s wrong:** Fixed `height: 600px` for scene and heavy card padding (`p-6` + nested `p-4`) can produce cramped stacking on smaller devices.
- **What it should be:** Use responsive scene height tokens (`h-[380px] sm:h-[460px] lg:h-[600px]`) and compact mobile spacing (`p-4 sm:p-6`).
- **Why this matters:** Mobile-first clarity is required; oversized containers reduce actionable context above the fold.

### Review (Why Phase 1 first)
These issues directly affect discoverability, scanability, and interaction confidence. Solving them first creates structural clarity so all later visual refinements amplify an already-legible system.

## PHASE 2 — Refinement

### Color Restraint (`app/globals.css`, game components)
- **What’s wrong:** Multi-hue gradients are used for headings, data blocks, and calls-to-action simultaneously.
- **What it should be:** Adopt one primary accent family per function (success/action, info/system, warning/error) and demote decorative gradients to rare moments.
- **Why this matters:** Purposeful color use improves wayfinding and perceived premium quality.

### Spacing Rhythm (all panel cards)
- **What’s wrong:** Vertical spacing values are close but inconsistent (`space-y-3`, `space-y-4`, `space-y-5`, mixed `mb-6` and nested gaps).
- **What it should be:** Normalize to a spacing ladder (8/12/16/24) and map panel sections to fixed rhythm roles.
- **Why this matters:** Rhythm consistency is a major contributor to calmness and perceived craftsmanship.

### Iconography Weight & Usage (`lucide-react` instances)
- **What’s wrong:** Icon emphasis is frequently duplicated (icon + gradient text + glow) in the same row.
- **What it should be:** Keep icon strokes consistent and let either icon or color be emphasis—not both simultaneously.
- **Why this matters:** Reduces visual noise and improves semantic hierarchy.

### Alignment Precision (stat and control rows)
- **What’s wrong:** Mixed baseline alignments between badge-like stats, progress bars, and button stacks create small but cumulative jitter.
- **What it should be:** Standardize control row heights and text baseline alignment per component type.
- **Why this matters:** Micro-alignment consistency is what separates polished from merely styled.

### Review (Why Phase 2 second)
After structural hierarchy is fixed, refinement should smooth visual rhythm and consistency. These are medium-impact adjustments that compound into a distinctly cleaner interface.

## PHASE 3 — Polish

### Motion Discipline (`app/globals.css` utilities)
- **What’s wrong:** Persistent shimmer, pulse, and glow effects often run concurrently, creating continuous motion pressure.
- **What it should be:** Reserve continuous animation for loading or critical status only; prefer short enter/feedback transitions (150–220ms).
- **Why this matters:** Premium motion supports intent; it should never compete with content.

### Empty / Loading / Error Harmonization (`game-client.tsx`, toast usage)
- **What’s wrong:** Loading and feedback states are text/toast heavy and stylistically detached from panel language.
- **What it should be:** Introduce unified state cards (loading skeleton, no-selection guidance, error recovery panel) using shared tokens.
- **Why this matters:** State continuity makes the app feel alive and intentional rather than conditionally assembled.

### Theming Readiness (`app/globals.css`)
- **What’s wrong:** Current token setup implies a system but still mixes hardcoded colors (`from-[#0a0e27]`) and utility-specific values.
- **What it should be:** Move remaining raw values into semantic tokens and define theme parity constraints before dark/light support expansion.
- **Why this matters:** Token completeness ensures long-term consistency and maintainability.

### Review (Why Phase 3 last)
Polish is most valuable after hierarchy and consistency are stable. These changes provide the premium “quiet confidence” layer and improve perceived responsiveness without altering functionality.

## DESIGN_SYSTEM (.md) UPDATES REQUIRED

Create and approve a formal token spec before implementation:

1. **Color tokens**
   - `accent/primary`, `accent/secondary`, `status/success`, `status/warning`, `status/error`, `surface/elevated`, `surface/interactive`.
2. **Typography tokens**
   - Display, heading, body, label, metric scales with explicit weights and letter-spacing rules.
3. **Spacing tokens**
   - 4, 8, 12, 16, 24, 32 with usage guidance per component level.
4. **Radius & border tokens**
   - Define card, control, badge radii and border-opacity ladder.
5. **Motion tokens**
   - Timing (`fast`, `base`, `slow`), easing curves, and where continuous animation is allowed.

These must be approved and added before UI implementation starts.

## IMPLEMENTATION NOTES FOR BUILD AGENT (NO CHANGES APPLIED YET)

### File: `components/game/game-client.tsx`
1. Main grid
   - `className="grid grid-cols-1 lg:grid-cols-3 gap-6"`
   - → `className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] gap-4 sm:gap-6"`
2. Scene container height
   - `style={{ height: '600px' }}`
   - → replace with responsive utility classes on container: `h-[380px] sm:h-[460px] lg:h-[600px]` (remove inline style).
3. Header subtitle tone
   - `text-gray-400 font-medium mt-1`
   - → `text-slate-400 font-medium mt-1` (after token mapping).

### File: `components/game/stats-panel.tsx`
1. Panel density
   - Root `p-6`
   - → `p-4 sm:p-6`.
2. Section rhythm
   - `space-y-4`
   - → `space-y-3 sm:space-y-4`.
3. Label styling
   - uppercase labels retain one neutral tone only; remove redundant glow from icon wrappers where numeric values already carry emphasis.

### File: `components/game/environmental-panel.tsx`
1. Panel density
   - Root `p-6`
   - → `p-4 sm:p-6`.
2. Section spacing
   - `space-y-5`
   - → `space-y-4`.
3. Button state consistency
   - Normalize button classes to shared interaction tokens (no per-button unique glow unless primary action).

### File: `components/game/crop-selector.tsx`
1. Selected state intensity
   - `border-2 ... glow-green scale-[1.02]`
   - → `border ... bg-accent/10` style token equivalent, remove scaling.
2. Hover behavior
   - `hover:scale-[1.01]`
   - → remove scale and use border/background transition only.
3. Warning card
   - keep structure; map colors to status tokens (`warning/*`) from DESIGN_SYSTEM.

### File: `components/game/upgrades-shop.tsx`
1. Purchased card emphasis
   - `border-2 border-green-500/40` + `animate-pulse`
   - → `border border-success/40` + static subtle tint (remove pulse).
2. Hover shimmer
   - keep optional; reduce to single pass on hover only (no persistent shimmer).

### File: `app/globals.css`
1. Token normalization
   - Move hardcoded hex body gradient values into semantic variables.
2. Motion utility constraints
   - Gate `.shimmer`, `.pulse-*`, `.float` usage via component-level opt-in rules and reduced-motion fallback.
3. Typography governance
   - Keep Orbitron for display/metrics only; default headings to body family unless explicitly display-level.

---

## Approval Gate
No UI code changes should be implemented until Phase 1 is approved. After Phase 1 implementation, provide side-by-side before/after captures and re-evaluate before proceeding to Phase 2.
