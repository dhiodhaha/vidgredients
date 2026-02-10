---
description: Alma-inspired design system skill for revamping the app's UX/UI to match the warm, organic, premium aesthetic of the Alma food tracking app.
---

# Alma-Inspired Design System Skill

## Reference Analysis (from Alma app screenshots)

This skill documents the complete UX/UI analysis of the **Alma** food tracking app and provides actionable design tokens, patterns, and component guidelines for achieving the same organic, warm, premium feel in our recipe app.

---

## 1. Color Palette

### Alma's Colors
| Role | Hex | Description |
|------|-----|-------------|
| **Primary (CTA/Active)** | `#3D4A2A` | Deep olive-green, used for filled buttons, active states, checkmarks |
| **Primary Light** | `#4A5A33` | Slightly lighter olive for hover/secondary actions |
| **Background** | `#F5F0E8` | Warm off-white / light parchment — NOT pure white |
| **Surface / Cards** | `#F8F4ED` | Slightly warmer than background, subtle card elevation |
| **Surface Pressed** | `#EDE8DF` | Slightly darker when pressed |
| **Text Primary** | `#2C2C2C` | Near-black, warm undertone |
| **Text Secondary** | `#6B6B6B` | Medium warm gray for descriptions |
| **Text Muted** | `#9B9B8E` | Olive-tinted muted gray for captions |
| **Accent Green** | `#7CB342` | Bright olive-green for progress rings |
| **Accent Orange** | `#E8963A` | Warm orange for secondary indicators |
| **Tab Active** | `#3D4A2A` | Deep olive on active tab icon |
| **Tab Inactive** | `#B8B5AD` | Warm neutral gray for inactive tabs |
| **Badge/Tag** | `#E86B3A` | Warm coral-orange for discount badges |
| **Border** | `#E8E4DC` | Warm light border, barely visible |
| **Overlay** | `rgba(0,0,0,0.3)` | Subtle dark overlay |

### Key Insight
Alma **never uses pure white (#FFFFFF)** for backgrounds. Everything has a warm, creamy, parchment undertone. This is the single biggest differentiator from generic apps.

---

## 2. Typography

### Font Choices
| Role | Font | Weight | Size |
|------|------|--------|------|
| **Display / Hero** | Serif (DM Serif Display or similar) | Bold (700) | 28-32px |
| **Section Headings** | Sans-serif (system or Inter) | SemiBold (600) | 18-20px |
| **Body** | Sans-serif | Regular (400) | 15-16px |
| **Labels / Captions** | Sans-serif | Medium (500) | 12-13px |
| **Buttons** | Sans-serif | SemiBold (600) | 15-16px |
| **Tab labels** | None (icon-only) | — | — |
| **Cards titles** | Sans-serif | SemiBold (600) | 16-17px |

### Key Insight
- Alma uses **serif fonts sparingly** — mainly for hero/display text on the paywall ("Get the full Alma experience")
- Body text and UI elements use clean sans-serif
- **No ALL-CAPS usage** except tiny badges
- Numbers in circular progress rings use a **bold, round sans-serif** at large sizes (28-36px)

---

## 3. Spacing & Padding System

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| `xxs` | 2px | Micro gaps |
| `xs` | 4px | Badge padding, tight gaps |
| `sm` | 8px | Inner card gaps |
| `md` | 16px | Standard padding inside cards |
| `lg` | 20px | Card-to-card gap, section padding |
| `xl` | 24px | Screen horizontal padding |
| `xxl` | 32px | Section separation |
| `xxxl` | 48px | Major section breaks |

### Key Patterns
- **Screen padding**: 20-24px horizontal
- **Card internal padding**: 16-20px all sides
- **Card-to-card spacing**: 12-16px
- **Section title to content**: 12px
- **List item vertical padding**: 16-20px per item
- **Bottom tab bar height**: ~64px + safe area

---

## 4. Border Radius

| Element | Radius |
|---------|--------|
| **Cards** | 16-20px (large, soft) |
| **Buttons (primary CTA)** | 16px (rounded rect, NOT pill) |
| **Buttons (secondary)** | 12px |
| **Pills / Tags** | 999px (full round) |
| **Progress rings** | Full circle |
| **Avatars** | Full circle |
| **Input fields** | 12px |
| **Tab bar** | 0px (flat bottom bar) |
| **Image containers** | 16px |
| **Day indicator dots** | Full circle (6-8px) |

### Key Insight
Alma prefers **large, soft border radii** (16-20px) on cards — this creates the organic, friendly feel. CTAs use rounded-rect (16px), NOT full-pill shapes.

---

## 5. Shadows & Elevation

### Shadow System
Alma uses **extremely subtle shadows** — nearly invisible. The warmth comes from background contrast, not heavy shadows.

| Level | Properties |
|-------|-----------|
| **Card** | `0px 1px 3px rgba(0,0,0,0.04)` — barely there |
| **Elevated** | `0px 2px 8px rgba(0,0,0,0.06)` — for modals |
| **Tab bar** | `0px -1px 0px rgba(0,0,0,0.05)` — top border only |

### Key Insight
- Cards are distinguished from background by **subtle tint difference**, not shadows
- The parchment-colored background + slightly lighter cards = natural depth without heavy shadows

---

## 6. Buttons

### Primary CTA (e.g., "Get started for free", "Start saving")
- Background: `#3D4A2A` (deep olive-green)
- Text: `#FFFFFF`
- Border radius: 16px
- Padding: 16px vertical, full-width
- Font: SemiBold 16px
- Press state: slight opacity reduction (0.9) + scale(0.98)

### Secondary / Ghost (e.g., "Fix it", links)
- Background: transparent
- Text: `#3D4A2A`
- Underline or no decoration
- Font: Medium 14-15px

### Outline Button (e.g., "Start saving")
- Background: transparent
- Border: 1.5px `#E8E4DC`
- Text: `#2C2C2C`
- Border radius: 16px
- Full width

### Pricing Button (selected)
- Background: transparent
- Border: 2px `#3D4A2A`
- Checkmark circle filled olive-green
- Inner text dark

### Pricing Button (unselected)
- Background: transparent
- Border: 1.5px `#E8E4DC`
- Radio circle outline gray

---

## 7. Cards

### Standard Card (e.g., "Weekly Digest", "7-Day Challenge", "Saved foods")
- Background: `#F8F4ED` or `#FFFFFF` (warm white)
- Border radius: 16-20px
- Padding: 16-20px
- Shadow: nearly invisible
- Border: optional 1px `#E8E4DC`
- Content: title (SemiBold 16-17px) + description (Regular 14px muted)

### Nutrient Card (grid layout)
- 2-column grid
- Each card: centered circular progress ring + emoji + label
- Background: warm white
- Progress ring colors: olive-green gradient
- Number inside ring: Bold 28-36px

### Food Detail Card (Mango Sticky Rice)
- Hero image with decorative abstract background (pastel blobs)
- Image border radius: 16px
- Below image: title (Bold 22px), metadata rows with pills
- Metadata rows: label left, pill/value right, separated by hairline

### Pricing Card
- Border: 1.5px warm gray
- When selected: border becomes olive-green, checkmark appears
- Discount badge: `#E86B3A` coral-orange pill on top-left
- Inner text: title bold, price, billing description muted

---

## 8. Lists & Rows

### Settings Row (e.g., "Calories", "Protein")
- Full width card
- Title: SemiBold 16px dark
- Description: Regular 14px muted, up to 2 lines
- Right side: checkmark circle (olive-green filled)
- Separator: 1px warm gray border or card gap
- Vertical padding: 16-20px

### Metadata Row (recipe detail)
- Label left (Regular 15px muted)
- Value right (Medium 15px dark, sometimes in a pill)
- Separated by 1px `#E8E4DC` bottom border
- Vertical padding: 14-16px

---

## 9. Navigation

### Bottom Tab Bar
- Background: `#F5F0E8` (same as page background — seamless)
- Height: ~64px
- Icons: 24px, filled when active, outline when inactive
- Active color: `#3D4A2A` (olive)
- Inactive color: `#B8B5AD` (warm gray)
- **Center FAB**: Larger circle (~56px), olive-green filled, white "+" icon
- FAB slightly raised above tab bar with subtle shadow
- No labels on tabs — icon only

### Back Button
- Circle: 40px, transparent background (or very light gray)
- Icon: left arrow, olive-green, 20-24px
- Positioned top-left

---

## 10. Progress Indicators

### Day Tracker (Weekly Digest)
- Row of 7 circles (M T W T F S S)
- Active/completed: olive-green filled with white checkmark
- Future: light gray outline
- Current: may have subtle ring

### 7-Day Challenge
- Horizontal row of dots/circles
- Completed: colored (green/orange)
- Remaining: light gray
- Gift icon at the end

### Circular Progress Ring (nutrient cards)
- SVG circle ring
- Track: light gray `#E8E4DC`
- Fill: olive-green gradient (yellowish-green)
- Size: 80-100px
- Number centered inside: Bold 28-36px
- Emoji + label below ring

---

## 11. Special UI Patterns

### Paywall / Upgrade Modal
- Full-screen or bottom-sheet
- Close button top-right (X in circle)
- Centered logo/icon at top
- Display text: serif Bold 28-32px
- Subtitle: sans-serif Regular 16px muted
- Stars rating row
- Feature checklist with olive-green checkmarks
- Pricing cards at bottom
- Primary CTA button full-width
- Footer links: "Restore Purchases · Terms · Privacy"

### Abstract Decorative Backgrounds (Food Detail)
- Pastel geometric shapes (circles, arcs, rectangles)
- Muted colors: dusty rose, sage, beige, slate
- Behind food images only
- Creates an artistic, premium feel

### "For you" Section (recipe detail)
- Section title with broadcast/signal icon
- Share (ghost button, left) + Save (filled olive, right)
- Rounded button pair at bottom of card

---

## 12. Micro-Interactions & Animation

| Interaction | Animation |
|-------------|-----------|
| Button press | scale(0.97-0.98) + opacity 0.9 |
| Card press | scale(0.98) + subtle opacity dim |
| Tab switch | Icon fill/stroke transition (200ms) |
| Filter pill select | Background color transition (150ms) |
| Progress ring fill | Animated stroke-dashoffset on mount |
| Modal appear | Slide up from bottom + backdrop fade |
| Page transition | Horizontal slide (default nav) |

---

## 13. Applying to Our App: Key Changes

### Theme Token Updates
1. **Background**: `#FAFAFA` → `#F5F0E8` (warm parchment)
2. **Surface**: `#FFFFFF` → `#FAF7F2` (warm off-white)
3. **Primary**: `#064E3B` → `#3D4A2A` (olive-green)
4. **Primary Light**: `#10B981` → `#7CB342` (bright olive)
5. **Text colors**: Shift to warmer tones
6. **Borders**: Warm gray `#E8E4DC` instead of slate
7. **Shadows**: Reduce opacity dramatically (0.04 instead of 0.08)

### Component Transformations
1. **RecipeCard** → Add abstract decorative background for food images
2. **FloatingActionButton** → Integrate into bottom tab bar, olive-green
3. **MoodFilters** → Warmer pill colors, olive active state
4. **Header** → Simpler greeting, olive icons
5. **PaywallScreen** → Serif hero text, warm card backgrounds, warmer CTA
6. **Profile** → Warm cards, olive accents
7. **Bottom Tab** → Seamless warm background, no floating pill, center FAB

### New Components to Consider
1. **AbstractBackground** — SVG decorative shapes behind hero images
2. **CircularProgress** — Nutrient/progress ring component
3. **DayTracker** — Weekly check-in dot row
