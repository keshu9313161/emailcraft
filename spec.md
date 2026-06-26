# EmailCraft — Landing Page Scroll-Snap Redesign

## Current State
The landing page is embedded as a `LandingPage` function inside `App.tsx`. It consists of multiple conventional scrolling sections: a sticky navbar, hero with split layout, category marquee strip, "How it works" steps, features grid, testimonials, About/mission editorial section, bottom CTA, and footer. Sections use standard document flow with padding-based vertical spacing.

## Requested Changes (Diff)

### Add
- CSS scroll-snap container (`scroll-snap-type: y mandatory`) wrapping all four new full-screen sections
- Each section uses `scroll-snap-align: start` and `height: 100vh` to fill the full viewport
- **Section 1 — Hero**: Full-screen split layout. Left: bold headline (app's core value), supporting subheadline, primary CTA button. Right: animated live typing demo that simulates the email generation process (typewriter effect showing an email being composed in real time)
- **Section 2 — Features**: Three outcome-focused benefit cards with icons — short title + one-line description each; visually distinct background from hero
- **Section 3 — Social Proof**: Both a featured testimonial quote with attribution AND a row of 3 trust-building stats (216 templates, 15 categories, 5 min average); distinct background treatment
- **Section 4 — Final CTA**: Full-screen closing statement reinforcing the value prop with a prominent signup/action button; strongly contrasted background (dark/primary)
- Sticky navbar remains at top of page (outside scroll container) for navigation and sign-in access
- Scroll progress indicator (dots or line on side) showing which section is active
- Section transitions feel intentional — vary background color/texture between sections

### Modify
- Extract `LandingPage` from `App.tsx` into `src/frontend/src/components/LandingPage.tsx` for cleaner organization
- Replace the existing multi-section free-scrolling layout with the 4 snap sections
- Retain the existing animated category marquee strip — move it into the Hero section as a supporting element below the headline
- Retain the navy/amber brand palette and font stack (Bricolage Grotesque + Plus Jakarta Sans)
- The animated visual on the hero right panel changes from a static AppMockup to a live typing animation showing an email being drafted

### Remove
- "How it works" 5-step section (consolidate into app itself, not landing)
- The editorial About/Mission section
- Duplicate CTA instances (keep only one per section)
- The 6-card features grid (replace with 3 outcome-focused cards in Section 2)

## Implementation Plan
1. Create `src/frontend/src/components/LandingPage.tsx` with the new scroll-snap layout
2. Build the typing animation component for the hero right panel — cycles through a realistic email draft appearing character by character, with a blinking cursor
3. Implement 4 full-screen snap sections with distinct background treatments:
   - Section 1 (Hero): white/light background with subtle grid texture
   - Section 2 (Features): muted/light navy tint
   - Section 3 (Social Proof): white with contrast treatment
   - Section 4 (Final CTA): deep navy primary background
4. Build side scroll-progress dots indicator that highlights the active section
5. Use IntersectionObserver to track active section for the progress dots
6. Update `App.tsx` to import `LandingPage` from the new component file
7. Validate (lint, typecheck, build)
