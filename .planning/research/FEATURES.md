# Feature Landscape

**Domain:** Premium used car dealership public website UI
**Researched:** 2026-03-18

## Table Stakes

Features users expect from any professional dealership website. Missing = site feels cheap or untrustworthy.

### Homepage

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Split-layout hero with vehicle imagery | Every premium dealership leads with a compelling hero that pairs headline copy with a real vehicle photo. Text-only heroes feel generic. | Med | Left: headline + CTAs, Right: high-quality vehicle photo or composition. Current hero is text-only on dark bg -- needs the split visual. |
| Stats/credibility bar | Buyers scan for social proof before scrolling. Years in business, vehicles sold, Google rating are baseline trust signals. | Low | Already exists. Refine typography and spacing for light palette. |
| Why Choose Us / value props | Differentiates from sketchy lots. Cards with icons and short copy. | Low | Already exists. Polish card design with better hover states. |
| Inventory teaser with real vehicle cards | Static category cards feel placeholder-ish. Show 3-6 actual vehicles from inventory to prove the lot is stocked. | Med | Current version shows category links, not real vehicles. Pulling featured/recent vehicles from the API would be more compelling. |
| Testimonials with star ratings | Social proof is the single strongest trust signal for used car buyers. Must be visible, not buried. | Low | Already exists. Enhance with larger quote marks, better card design. |
| Clear primary + secondary CTAs | "Browse Inventory" and "Get Pre-Approved" / "Contact Us" must be immediately visible above the fold. | Low | Already exists. Ensure contrast on light backgrounds. |
| Trust badges strip | Family owned, inspected vehicles, financing available -- these micro-signals reduce anxiety. | Low | Already exists as a footer strip. Keep it. |

### Inventory Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Filter bar (make, model, year, price, body style) | Buyers arrive knowing roughly what they want. Filters must be prominent and fast. | Low | Already exists via nuqs URL-synced filters. Restyle for premium look. |
| Card grid with vehicle photos | Every listing needs a photo, year/make/model, price, mileage at minimum. Cards should be generous with the image (4:3 or 16:10 ratio). | Low | Already exists. Enhance card design -- larger images, cleaner typography, subtle hover lift. |
| Sort options (price, mileage, newest) | Buyers want to reorder by what matters to them. | Low | Already exists. Ensure sort controls are visible, not buried. |
| Results count | "Showing 12 of 47 vehicles" sets expectations and proves inventory depth. | Low | Already exists. |
| Pagination or infinite scroll | Must handle growing inventory gracefully. | Low | Already exists. |
| Empty state for no results | When filters return nothing, guide users to broaden search or contact for special orders. | Low | Check if this exists. Common miss. |
| Page header with context | Simple banner with "Our Inventory" heading and subtitle. | Low | Already exists. Restyle from dark primary bg to premium light treatment. |

### Vehicle Detail Page (VDP)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Gallery-first layout with large hero image | Photos are the number one factor in vehicle purchase decisions online. The gallery must dominate above the fold. Industry consensus: photo gallery above everything else on the VDP. | Med | Already has gallery but in a 2-column layout with sidebar. For premium feel, consider full-width hero image up top, then content below. |
| Thumbnail strip or carousel navigation | Users need to browse all photos without clicking through one by one. | Low | Already has ImageGallery component with lightbox. Ensure thumbnail strip is prominent. |
| Price displayed prominently | Must be one of the first things seen. Large font, clear formatting. | Low | Already in sidebar. Ensure it reads well in new layout. |
| Key specs grid (mileage, transmission, drivetrain, fuel) | Scannable at a glance. Icons paired with labels and values in a clean grid. | Low | Already exists as SpecItem grid. Good pattern, just needs visual polish. |
| Features/options list | Badge-style tags for things like "Bluetooth", "Backup Camera", "4WD". | Low | Already exists as Badge components. |
| Contact CTAs (call, email, financing) | Must be accessible without scrolling far. Sticky sidebar or sticky mobile bar. | Low | Already exists in sticky sidebar card. |
| Breadcrumb navigation | "Inventory > 2022 Ford F-150" helps orientation and SEO. | Low | Already has back link. Consider proper breadcrumb format. |
| VIN and stock number | Transparency signal. Shows dealer is legitimate. | Low | Already exists in sidebar. |
| Price disclaimer | Legal requirement in most states. "Plus tax, title, license, and dealer fees." | Low | Already exists. |

### Contact Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Contact form with validation | Name, email, phone, message at minimum. Vehicle interest field is a bonus. | Low | Already exists with Zod validation. |
| Phone number prominently displayed | Many used car buyers prefer to call. Make the phone number large and tappable. | Low | Already exists in info cards. |
| Business hours | Buyers want to know when they can visit or call. | Low | Already exists. |
| Address with map | Physical location builds trust. Google Maps embed is table stakes. | Med | Map placeholder exists but is not implemented. Needs real embed. |
| Email address | Some buyers prefer email. | Low | Already exists. |

### About Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dealership story / origin narrative | Humanizes the business. "Family-owned since 20XX" type content. | Low | Already exists. Needs better visual treatment -- consider side-by-side with a photo. |
| Values or mission section | Reinforces what the dealership stands for. | Low | Already exists as card grid. |
| Stats / social proof | Vehicles sold, years in business, rating. | Low | Already exists. |
| CTA to visit or browse | Every page should funnel toward inventory or contact. | Low | Already exists. |

### Financing Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| How it works steps | Visual 1-2-3-4 process reduces anxiety about financing. | Low | Already exists. |
| Benefits list | Why finance here vs. a bank or credit union. | Low | Already exists. |
| Credit situation messaging | "All credit welcome" messaging for used car buyers who worry about approval. | Low | Already exists. |
| CTA to call or apply | Must make next step obvious. | Low | Already exists. |

### Global / Cross-Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Sticky header with phone number | Phone must be reachable from every page. Top bar with phone + hours is standard. | Low | Already exists. Restyle for light theme. |
| Mobile-responsive everything | 70%+ of car shoppers browse on mobile. Every feature must work on small screens. | Low | Already responsive. Verify after redesign. |
| Consistent page headers | Each interior page needs a branded header section (not just an h1). | Low | Currently uses dark primary bg headers. Need premium light treatment. |
| Fast load times | Under 3 seconds. Compress images, optimize gallery. | Low | Next.js Image optimization helps. Verify after adding more imagery. |
| Footer with contact info, nav, hours | Standard dealership footer. | Low | Already exists. |

## Differentiators

Features that elevate TLC Autos above the typical independent dealer site. Not expected, but make the site feel genuinely premium.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Scroll-reveal animations | Content that fades/slides in as user scrolls creates a polished, modern feel. Most independent dealer sites are completely static. | Med | Use CSS animations or a lightweight library (framer-motion already in Next.js ecosystem). Trigger at 25% viewport visibility, complete by 75%. Duration 200-500ms. |
| Vehicle card hover effects | Hovering a card slightly lifts it, dims the overlay on the image, and reveals a "View Details" button. Makes browsing feel interactive. | Low | CSS transitions only. translateY(-2px) + shadow increase + overlay opacity change. |
| Split-layout hero with real dealership photo | Most small dealers use stock photos or plain gradients. A real photo of the lot, a signature vehicle, or the team immediately differentiates. | Low | Just needs a high-quality photo. Layout already planned. |
| Featured/recent vehicles on homepage | Pulling actual inventory onto the homepage (3-6 cards) proves the lot is active and stocked. Static category boxes feel generic. | Med | Fetch from existing inventory API. Show newest or featured vehicles. |
| Smooth page transitions | Subtle fade between pages prevents the jarring full-reload feel. | Low | Next.js app router handles this natively with loading states. Polish with skeleton screens. |
| Vehicle inquiry form on VDP | Instead of just "Call Us" and "Email Us", an inline form pre-filled with the vehicle info lets buyers express interest without leaving the page. | Med | Reuse contact form logic with vehicle context pre-populated. Submits as a lead. |
| Sticky mobile CTA bar on VDP | On mobile, a fixed bottom bar with "Call" and "Inquire" buttons ensures CTAs are always reachable as user scrolls through photos and specs. | Low | Fixed bottom bar, hidden on desktop. Standard mobile UX pattern for high-value pages. |
| Payment estimator on VDP | A simple monthly payment calculator (price, down payment, term, rate) helps buyers self-qualify. Increases time on page and engagement. | Med | Client-side calculation only. No real lending integration needed. Display as a small card in the sidebar. |
| Google Maps embed on contact page | Replaces the placeholder with a real interactive map. Proves physical location exists. | Low | Just an iframe embed. Already has placeholder markup. |
| Photo count badge on inventory cards | "12 photos" badge on cards signals thoroughness and encourages clicks. | Low | Count from vehicle.images array. Display as small badge overlay on card image. |
| Similar vehicles section on VDP | After viewing a vehicle, show 3-4 similar ones (same body style or price range). Keeps users browsing instead of bouncing. | Med | Query inventory API filtered by bodyStyle or price range, excluding current vehicle. |
| Animated stats counters | On homepage stats bar, numbers count up from 0 when they scroll into view. Small touch that feels polished. | Low | Intersection Observer + CSS counter animation or simple JS. |

## Anti-Features

Features to explicitly NOT build. These hurt trust, UX, or are out of scope.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Gated pricing / "Call for price" | Destroys trust instantly. Buyers interpret hidden pricing as a scam signal. Used car shoppers will leave for a competitor who shows prices. | Always display the listed price on cards and VDP. |
| Aggressive popups / chat widgets | Pop-up lead forms and chat bubbles that fire on page load feel desperate and interrupt browsing. Independent dealers do not need enterprise chat tools. | Rely on visible CTAs, inline forms, and the phone number in the header. Let buyers initiate contact. |
| Auto-playing video with sound | Jarring, accessibility-hostile, and increases bounce rate. | If video is used, muted autoplay only, or click-to-play. |
| Carousel/slider hero with multiple slides | Rotating carousels have abysmal click-through rates (under 1% after the first slide). Users ignore or find them disorienting. | Single static hero with one clear message and CTA. |
| Dark mode toggle on public site | The milestone explicitly removes dark mode for a light-only premium aesthetic. A toggle adds complexity and splits design attention. | Light-only design system. Remove dark mode CSS variables and toggles entirely. |
| Online purchasing / checkout flow | Out of scope per PROJECT.md. Deals are tracked in admin, not processed online. | Link to "Contact Us" or "Call" for next steps. |
| Login / account system for buyers | Out of scope. No customer portal needed. | Public pages are fully anonymous. |
| Complex financing calculator with real rates | Real rate integration requires lender partnerships and compliance. Overengineering for a small independent dealer. | Simple payment estimator with disclaimer "for illustration only." |
| Parallax scrolling on every section | Overuse of parallax feels gimmicky and causes motion sickness for some users. Also hurts mobile performance. | Use scroll-reveal (fade in) instead. Reserve parallax for at most one hero background, if at all. |
| Stock photography of people | Generic stock photos of smiling salespeople undermine authenticity. Buyers can spot them instantly. | Use photos of actual vehicles, the lot, or no people at all. Icon-based value props are better than fake team photos. |

## Feature Dependencies

```
Light-only design system -> All page redesigns (must be done first)
Homepage hero redesign -> Featured vehicles section (needs styled cards first)
Inventory card redesign -> Homepage featured vehicles (reuses same card component)
Inventory card redesign -> Vehicle detail page link styling
Contact form validation (existing) -> VDP inquiry form (reuses validation logic)
Image gallery component (existing) -> VDP gallery-first layout
Scroll-reveal utility -> All pages (create once, apply everywhere)
```

## MVP Recommendation

Prioritize for the v1.1 UI Polish milestone:

1. **Light-only design system** -- Foundation for everything else. Remove dark mode, evolve palette for light backgrounds.
2. **Split-layout homepage hero** -- Biggest visual impact for the least effort. Pairs headline with a vehicle photo.
3. **Inventory card redesign** -- Larger images, cleaner typography, hover effects. Reused on homepage too.
4. **VDP gallery-first layout** -- Full-width hero image, specs below. Biggest improvement to the highest-value conversion page.
5. **Scroll-reveal animations** -- Apply globally for premium polish. One utility, used everywhere.
6. **Page header redesign** -- Replace dark primary banners with light, elegant headers across all interior pages.
7. **Contact page map embed** -- Replace placeholder with real Google Maps iframe. Quick win.

Defer:
- **Payment estimator on VDP**: Nice to have but adds complexity. Can be a fast follow after v1.1.
- **Similar vehicles on VDP**: Requires additional API query logic. Good for v1.2.
- **Vehicle inquiry form on VDP**: Requires form logic integration. Can follow after core redesign lands.
- **Animated stats counters**: Pure polish, lowest priority among differentiators.

## Sources

- [INSIDEA: Website Design Ideas for Car Dealerships 2026](https://insidea.com/blog/marketing/car-dealerships/website-design-ideas-for-automotive-industry/)
- [Subframe: 25 Car Dealership Website Design Examples](https://www.subframe.com/tips/car-dealership-website-design-examples)
- [Fyresite: Car Dealership Website Design Features & UX](https://www.fyresite.com/car-dealership-website-design-must-have-features-ux-best-practices/)
- [Dealer Specialties: Ultimate VDP](https://www.dealerspecialties.com/ultimate-vdp)
- [DealerOn: Design a Good VDP](https://www.dealeron.com/blog/design-a-good-vehicle-details-page/)
- [Cars Commerce: Website Playbook Chapter 4](https://www.carscommerce.inc/website-playbook-chapter-4/)
- [Space Auto: Lessons from Carvana](https://space.auto/building-the-best-dealership-website-lessons-from-carvana-digital-strategies/)
- [DealerFire: Maximize Website Conversion Rates](https://www.dealerfire.com/blog/how-to-maximize-your-dealerships-website-conversion-rates/)
- [Webflow: Micro-interactions Blog](https://webflow.com/blog/microinteractions)
- [Stan Vision: Micro-interactions in Web Design 2025](https://www.stan.vision/journal/micro-interactions-2025-in-web-design)
- [Azuro Digital: Best Automotive Website Designs 2026](https://azurodigital.com/automotive-website-examples/)
