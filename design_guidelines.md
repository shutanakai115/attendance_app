# Updated Design Guidelines for 副業エンジニア向け出退勤記録WebアプリMVP

## Design Approach: Modern Material Design 3 System
**Selected Framework:** Material Design 3 with refined color science and responsive desktop optimization
**Rationale:** Maintains utility-focused efficiency while elevating professional appearance through sophisticated color harmonies and expanded device support.

## Core Design Principles
1. **Multi-Device Harmony:** Seamless experience from mobile thumb operation to desktop precision
2. **Sophisticated Simplicity:** Refined aesthetics without sacrificing functional clarity
3. **Professional Confidence:** Subdued elegance appropriate for workplace tools
4. **Adaptive Intelligence:** Responsive layouts that enhance rather than compromise mobile-first design

## Color Palette

### Light Mode
- **Primary:** 220 15% 35% (sophisticated steel blue - professional yet approachable)
- **Success/Clock-in:** 145 25% 40% (muted sage green - calm reliability)
- **Warning/Break:** 25 30% 50% (warm taupe - gentle attention)
- **Error/Clock-out:** 5 25% 45% (subdued terracotta - serious but not alarming)
- **Surface:** 0 0% 98% (pristine background)
- **Surface-Variant:** 220 8% 94% (subtle container differentiation)
- **On-Surface:** 0 0% 15% (comfortable reading contrast)
- **Outline:** 220 10% 80% (soft structural elements)

### Dark Mode
- **Primary:** 220 20% 70% (lifted steel blue maintaining sophistication)
- **Success:** 145 20% 65% (gentle sage maintaining recognition)
- **Warning:** 25 25% 70% (softened warm tone)
- **Error:** 5 20% 65% (muted but clear indication)
- **Surface:** 220 8% 6% (rich dark foundation)
- **Surface-Variant:** 220 12% 10% (elevated containers)
- **On-Surface:** 0 0% 90% (comfortable light text)
- **Outline:** 220 8% 25% (subtle dark mode borders)

## Typography
- **Primary Font:** Inter (Google Fonts CDN)
- **Hierarchy:**
  - Large actions: font-semibold text-lg (refined from bold)
  - Status text: font-medium text-base (professional weight)
  - Time displays: font-mono text-2xl (maintains precision)
  - Earnings: font-semibold text-3xl (sophisticated emphasis)
  - Body text: font-normal text-sm (comfortable reading)

## Layout System
**Spacing Units:** Tailwind 3, 4, 6, 8, 12 (12px, 16px, 24px, 32px, 48px)
**Responsive Containers:**
- Mobile: max-w-md mx-auto (original mobile optimization)
- Tablet: max-w-2xl mx-auto px-6
- Desktop: max-w-4xl mx-auto px-8 with sidebar navigation option

## Component Library

### Primary Action Buttons
- **Mobile:** Full width, 56px height (refined from 64px)
- **Desktop:** Fixed width 280px, centered or left-aligned in cards
- **States:** Sophisticated color applications with 8px border-radius
- **Typography:** Medium weight (refined from bold), refined color contrast
- **Interaction:** Subtle 2px shadow lift on hover (desktop), gentle scale on mobile

### Status Display Cards
- **Design:** Elevated cards with 1px subtle borders in outline color
- **Mobile:** Full width with 6px border-left accent in status color
- **Desktop:** Grid layout with 4px border-top accent
- **Typography:** Status text in primary color, time in on-surface
- **Background:** Surface-variant for subtle elevation

### Time & Earnings Dashboard
- **Layout:** Card-based containers with subtle shadows
- **Mobile:** Stacked vertical cards
- **Desktop:** Side-by-side grid with consistent heights
- **Typography:** Monospace time in refined sizing, earnings with sophisticated primary color

### Navigation
- **Mobile:** Bottom tab bar with rounded corners and surface-variant background
- **Desktop:** Top navigation bar or optional sidebar
- **Icons:** Material Icons via CDN with outline color for inactive states
- **Active states:** Primary color fill with subtle background highlight

### Data Tables
- **Desktop Enhancement:** Full-featured tables with column sorting
- **Mobile:** Maintained horizontal scroll with improved typography
- **Row styling:** Alternating surface and surface-variant backgrounds
- **Headers:** Medium weight typography in primary color

## Responsive Enhancements
- **Breakpoints:** Mobile-first with sm: (640px), md: (768px), lg: (1024px) considerations
- **Desktop Advantages:** Larger touch targets become precision hover targets
- **Multi-column layouts:** Sidebar information panels on larger screens
- **Enhanced data visualization:** Charts and graphs viable on desktop widths

## Professional Refinements
- **Reduced visual intensity:** Sophisticated colors reduce eye strain during extended use
- **Improved hierarchy:** Subtle color variations create clearer information architecture
- **Enterprise readiness:** Color palette appropriate for corporate environments
- **Brand flexibility:** Neutral foundation allows easy customization while maintaining sophistication

## Animations
**Refined approach:** Subtle, purposeful motion
- Button interactions: 2px shadow transitions (desktop), gentle 0.98 scale (mobile)
- Status changes: 200ms fade with slight scale for emphasis
- Loading states: Elegant spinner in primary color with reduced opacity
- Page transitions: Smooth 150ms fade between major sections

This evolution maintains the utility-focused foundation while introducing sophisticated visual refinement suitable for professional environments across all device types.