# Stack Research

**Domain:** Premium light-only UI redesign for car dealership public site
**Researched:** 2026-03-18
**Confidence:** HIGH

## Existing Stack (DO NOT change)

These are validated and shipping. Listed for integration context only.

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | App framework |
| React | 19.2.4 | UI library |
| Tailwind CSS | v4 | Styling |
| shadcn/ui + Radix UI | various | Component library |
| TypeScript | ^5 | Type safety |
| Supabase | 2.99.2 | Auth, DB, storage |
| Lucide React | ^0.577.0 | Icons |
| sharp | 0.34.5 | Image optimization |

## Recommended Stack Additions

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| motion | ^12.37 | Scroll reveals, entrance animations, hover states, layout transitions | The standard React animation library. Rebranded from Framer Motion. 30M+ monthly npm downloads, full React 19 support, hybrid engine (Web Animations API + JS fallback) for 120fps GPU-accelerated motion. Tailwind v4 companion integration is documented. MIT licensed. |
| embla-carousel-react | ^8.6.0 | Hero carousel, featured vehicles slider | shadcn/ui's official carousel component is built on Embla. Zero dependencies, 6M+ weekly downloads, touch/swipe native, plugin architecture for autoplay and fade. Already integrated into the shadcn ecosystem so adding the shadcn carousel component "just works". |
| yet-another-react-lightbox | ^3.29 | Full-screen image gallery viewer for vehicle photos | Best-maintained React lightbox in 2026. React 19 compatible, keyboard/touch/mouse navigation, responsive image resolution switching, plugin system for zoom/video/thumbnails. 200K+ weekly downloads, TypeScript built-in, ~7KB gzipped. |
| tw-animate-css | ^1.4.0 | Enter/exit animation utilities for shadcn/ui components | Official shadcn/ui replacement for `tailwindcss-animate` since March 2025. Pure CSS, Tailwind v4 CSS-first architecture, tree-shakable. Provides `animate-in`, `fade-in`, `slide-in-from-*`, `zoom-in` utility classes that shadcn components expect. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| embla-carousel | ^8.6.0 | Core carousel engine (peer dependency) | Installed alongside embla-carousel-react for type imports |
| embla-carousel-autoplay | ^8.6.0 | Auto-advancing hero slides | Hero carousel with timed transitions between featured vehicles |

### Development Tools

No additional dev tools needed. Existing Tailwind v4, TypeScript, and ESLint setup covers all new libraries.

## Installation

```bash
# Animation
bun add motion tw-animate-css

# Carousel (shadcn component pulls these in, but explicit is better)
bun add embla-carousel-react embla-carousel embla-carousel-autoplay

# Lightbox
bun add yet-another-react-lightbox
```

After installing, add to `globals.css`:
```css
@import "tailwindcss";
@import "tw-animate-css";
```

Then add the shadcn carousel component:
```bash
bunx shadcn@latest add carousel
```

## Integration Notes

### Motion + Tailwind v4

Motion reads Tailwind classes directly. Use `motion.div` with Tailwind classes for styling and Motion props for animation. No config changes needed.

```tsx
import { motion } from "motion/react"

// Scroll reveal pattern
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="bg-card rounded-lg shadow-card"
>
```

### tw-animate-css + Existing shadcn/ui Components

The existing shadcn Dialog, Popover, and Command components will gain smooth enter/exit animations automatically once `tw-animate-css` is imported. No component changes required.

### Embla Carousel + shadcn/ui

The shadcn carousel component wraps Embla with the project's existing design tokens. Use `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious` from `@/components/ui/carousel`.

### yet-another-react-lightbox + Supabase Storage

Vehicle images are already served from Supabase Storage URLs. YARL accepts an array of `{ src }` objects -- pass the existing image URLs directly. Use the Zoom plugin for pinch-to-zoom on vehicle detail pages.

```tsx
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
```

### Reduced Motion

The existing `prefers-reduced-motion` block in `globals.css` handles CSS animations. For Motion (JS), use `useReducedMotion()` hook or set `reducedMotion="user"` on `MotionConfig` in the root layout to respect OS preferences automatically.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| motion | CSS-only (@keyframes in Tailwind v4 `@theme`) | If animations are purely entrance fades with no scroll-trigger, gesture, or layout animation needs. But the project wants scroll reveals and hover interactions, which need JS orchestration. |
| motion | react-spring | If you need physics-based springs exclusively. Motion covers springs plus gestures, layout, and scroll -- more complete for this project. |
| yet-another-react-lightbox | PhotoSwipe (react-photoswipe-gallery) | If you need extremely small bundle size (~5KB). But YARL has better React integration, plugin system, and TypeScript support. |
| yet-another-react-lightbox | Custom dialog + Next Image | If you only need a single-image zoom. But vehicle galleries need multi-image navigation, keyboard shortcuts, and touch gestures -- rebuild cost is high. |
| embla-carousel-react | Swiper | If you need 3D effects or virtual slides for thousands of items. Embla is lighter and already the shadcn standard. |
| tw-animate-css | tailwindcss-animate | Never -- `tailwindcss-animate` is deprecated for Tailwind v4. tw-animate-css is the official shadcn replacement. |

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| framer-motion (package) | Legacy package name, still works but `motion` is the maintained successor | `motion` package, import from `motion/react` |
| tailwindcss-animate | Deprecated, JS plugin system incompatible with Tailwind v4 CSS-first architecture | tw-animate-css |
| react-image-lightbox | Deprecated since 2022, unmaintained, React 18+ peer dep warnings | yet-another-react-lightbox |
| GSAP | Overkill for subtle UI transitions, commercial license required for premium features | motion -- covers scroll reveals, springs, layout animations |
| AOS (Animate On Scroll) | jQuery-era library, no React integration, CSS-only approach conflicts with Motion | motion `whileInView` prop |
| Swiper | 150KB+ bundle, feature-heavy for what is needed (simple hero + vehicle slider) | embla-carousel-react via shadcn carousel |
| lightGallery | Commercial license required for commercial use | yet-another-react-lightbox (MIT) |
| react-slick | Unmaintained, jQuery dependency, accessibility issues | embla-carousel-react |
| @tailwindcss/typography | Not needed -- custom typography classes already exist in globals.css | Existing .text-display, .text-headline, etc. |
| Additional icon library | Lucide React already covers all icon needs | lucide-react (already installed) |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| motion@12.37 | React 19.2, Next.js 16.1 | Full RSC support, import from `motion/react` for client components |
| embla-carousel-react@8.6 | React 19.2, shadcn/ui | shadcn carousel component expects this version range |
| yet-another-react-lightbox@3.29 | React 19.2 | No peer dep conflicts, tested with React 16.8+ through 19 |
| tw-animate-css@1.4 | Tailwind CSS v4 | Pure CSS import, no plugin registration needed. Note: v2.0 upcoming with breaking changes -- pin to ^1.4.0 |

## Bundle Impact

| Package | Gzipped Size | Tree-shakable | Notes |
|---------|-------------|---------------|-------|
| motion | ~18KB (core) | Yes | Only imports used features. `motion.div` + `whileInView` is ~12KB |
| embla-carousel-react | ~6KB | Yes | Core only, plugins add ~1-2KB each |
| yet-another-react-lightbox | ~7KB | Yes | Plugins (Zoom, Thumbnails) add ~2-3KB each |
| tw-animate-css | 0KB JS | N/A | Pure CSS, tree-shaken by Tailwind -- only used classes ship |

**Total addition: ~25-30KB gzipped** -- reasonable for the animation and gallery capabilities gained.

## Sources

- [Motion official site](https://motion.dev/) -- React 19 support, Tailwind v4 integration, changelog
- [Motion npm](https://www.npmjs.com/package/motion) -- v12.37.0, MIT license, 30M+ monthly downloads
- [Motion + Tailwind docs](https://motion.dev/docs/react-tailwind) -- integration patterns
- [shadcn/ui Carousel](https://ui.shadcn.com/docs/components/radix/carousel) -- Embla integration, component API
- [embla-carousel-react npm](https://www.npmjs.com/package/embla-carousel-react) -- v8.6.0, 6M+ weekly downloads
- [Yet Another React Lightbox](https://yet-another-react-lightbox.com/) -- v3.29.1, React 19 compatible
- [tw-animate-css npm](https://www.npmjs.com/package/tw-animate-css) -- v1.4.0, shadcn/ui official replacement
- [shadcn/ui Tailwind v4 migration](https://ui.shadcn.com/docs/tailwind-v4) -- tw-animate-css adoption

---
*Stack research for: TLC Autos v1.1 UI Redesign*
*Researched: 2026-03-18*
