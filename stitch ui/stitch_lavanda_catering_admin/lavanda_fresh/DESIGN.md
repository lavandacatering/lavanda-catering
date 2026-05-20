---
name: Lavanda Fresh
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3f4a3c'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7a6a'
  outline-variant: '#becab8'
  surface-tint: '#006e12'
  primary: '#006e12'
  on-primary: '#ffffff'
  primary-container: '#4daf48'
  on-primary-container: '#003c06'
  inverse-primary: '#79dd6f'
  secondary: '#4e6700'
  on-secondary: '#ffffff'
  secondary-container: '#cbf06e'
  on-secondary-container: '#536d00'
  tertiary: '#52651f'
  on-tertiary: '#ffffff'
  tertiary-container: '#8da355'
  on-tertiary-container: '#293700'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94fa88'
  primary-fixed-dim: '#79dd6f'
  on-primary-fixed: '#002202'
  on-primary-fixed-variant: '#00530b'
  secondary-fixed: '#cbf06e'
  secondary-fixed-dim: '#b0d355'
  on-secondary-fixed: '#151f00'
  on-secondary-fixed-variant: '#3a4d00'
  tertiary-fixed: '#d4ec96'
  tertiary-fixed-dim: '#b8d07c'
  on-tertiary-fixed: '#151f00'
  on-tertiary-fixed-variant: '#3b4d06'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
  background-off-white: '#F9FAFB'
  surface-white: '#FFFFFF'
  danger: '#EF4444'
  warning: '#F59E0B'
  charcoal-text: '#1E1E1E'
  border-light: '#E5E7EB'
  text-muted: '#6B7280'
typography:
  hero-h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  hero-h1-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
  section-h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.3'
  card-title-h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  max-width: 1280px
  gutter: 24px
---

## Brand & Style

The design system for Lavanda Catering is rooted in a **Fresh & Appetizing** philosophy, specifically tailored for professional event planners and corporate clients. The brand personality is professional, trustworthy, and organic, emphasizing the quality and freshness of the ingredients.

The aesthetic follows a **Clean Minimalist** direction, characterized by:

- **Whitespace as a Component:** Generous margins and padding to prevent visual clutter and allow food photography to take center stage.
- **Visual Breathability:** A focus on clarity and high legibility to ensure a seamless booking and browsing experience.
- **Photographic Primacy:** High-quality, warm-toned food photography serves as the primary visual driver, supported by a neutral and structured UI.
- **Refined Precision:** Utilizing hairline borders and subtle shadows rather than heavy decorative elements to convey a modern, premium service.

## Colors

The color palette is a harmonious "Tri-tone Green" scale that evokes nature and culinary freshness.

- **Primary Green:** The main action color, used for critical CTAs and success states.
- **Secondary Olive:** Used for category labels and supporting UI elements to provide organic variety.
- **Accent Light Green:** Ideal for subtle highlights, hover backgrounds, and soft decorative touches.
- **Neutrals:** The system uses an off-white background (`#F9FAFB`) to reduce eye strain compared to pure white, while keeping pure white reserved for **Surface Containers** (cards, modals) to create a clear layered hierarchy.
- **Gradients:** A brand gradient flowing from Primary to Tertiary is reserved for high-impact hero sections and premium banners.

## Typography

This design system utilizes **Plus Jakarta Sans** exclusively to maintain a contemporary and geometric feel. The system relies on significant weight contrast to establish hierarchy:

- **Hero Headlines:** Use Extra Bold (800) for high-impact brand statements.
- **Section Headings:** Use Bold (700) to clearly define new content areas.
- **Interaction/Card Titles:** Use SemiBold (600) for clarity in components.
- **Body Text:** Uses a standard 16px size for optimal readability, ensuring the text is approachable yet professional.

## Layout & Spacing

The layout is built on a **4px base unit** and follows a **Fixed Grid** philosophy for desktop to ensure a curated, professional presentation.

- **Desktop Layout:** A 12-column grid with a max width of 1280px. Gutters are set to 24px. Section-to-section spacing is aggressive at 80px to maintain the minimalist "clean" aesthetic.
- **Mobile Layout:** Content reflows to a single column with 16px margins. Section spacing is reduced to 48px.
- **Rhythm:** Internal component padding is strictly set to 16px (sm) for consistent alignment across cards and input forms.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Hairline Shadows**.

- **Surfaces:** Use `#FFFFFF` containers against a `#F9FAFB` background to create natural depth without heavy shadows.
- **Cards:** Use a "Barely-there" shadow (1px to 3px blur) combined with a 1px solid border in `#E5E7EB`. This creates a tactile but flat "hairline" appearance.
- **Modals:** Use a more significant elevation with a diffused shadow and a `backdrop-blur-sm` overlay to focus user attention.
- **Sticky Elements:** The Navbar uses a simple bottom hairline border (`#E5E7EB`) rather than a shadow to keep the top of the interface feeling light and integrated.

## Shapes

The shape language is "Rounded," designed to feel friendly yet structured.

- **Inputs & Buttons:** 8px radius. This provides a soft touch while maintaining enough corner structure for a professional look.
- **Cards:** 12px radius. The larger radius distinguishes content containers from interactive controls.
- **Modals & Overlays:** 16px radius. The most rounded elements in the system, reserved for high-level containers and large-scale imagery.

## Components

- **Buttons:** Primary buttons use the Brand Green (`#4DAF48`) with white text and an 8px radius. Secondary buttons should use the Olive (`#96B83D`) or an outline style with 1px border. Use a subtle scale down (0.98) on click for tactile feedback.
- **Cards:** Product and menu cards must feature a 12px radius, a hairline border, and a 4:3 aspect ratio for food images. Text should be bottom-aligned with a gradient overlay if placed directly over images.
- **Inputs:** Use an 8px radius and a 1px border in `#E5E7EB`. Active states should transition the border color to Primary Green.
- **Chips/Badges:** Use SemiBold 14px text with the Secondary or Accent green background for category tags.
- **Lists:** Use generous vertical padding (16px) and thin dividers (`#E5E7EB`) to maintain the "Clean Minimalist" rhythm.
- **Modals:** Centered with 16px rounded corners, utilizing the primary shadow token and a blurred background.
