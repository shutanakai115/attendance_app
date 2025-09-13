# Design Guidelines for 副業エンジニア向け出退勤記録WebアプリMVP

## Design Approach: Utility-Focused Design System
**Selected Framework:** Material Design 3 with mobile-first optimization
**Rationale:** This is a productivity tool requiring immediate recognition, clear affordances, and reliable interaction patterns. Efficiency and learnability are paramount over visual flair.

## Core Design Principles
1. **One-Handed Mobile Operation:** All interactive elements sized for thumb reach
2. **Instant Visual Feedback:** Immediate state changes with clear color coding
3. **Minimal Cognitive Load:** Single-purpose screens with clear hierarchies
4. **Accessibility First:** High contrast, large touch targets (44px minimum)

## Color Palette

### Light Mode
- **Primary:** 216 100% 50% (vibrant blue for trust/reliability)
- **Success/Clock-in:** 120 60% 45% (professional green)
- **Warning/Break:** 35 90% 55% (warm orange)
- **Error/Clock-out:** 0 70% 50% (clear red)
- **Surface:** 0 0% 98% (clean background)
- **On-Surface:** 0 0% 20% (readable text)

### Dark Mode
- **Primary:** 216 100% 60%
- **Success:** 120 50% 55%
- **Warning:** 35 80% 65%
- **Error:** 0 60% 60%
- **Surface:** 0 0% 8%
- **On-Surface:** 0 0% 90%

## Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Hierarchy:**
  - Large buttons: font-bold text-lg (18px)
  - Status indicators: font-semibold text-base (16px)
  - Time displays: font-mono text-2xl (24px)
  - Earnings: font-bold text-3xl (30px)
  - Body text: font-normal text-sm (14px)

## Layout System
**Spacing Units:** Tailwind 4, 6, 8, 12 (16px, 24px, 32px, 48px)
- **Container:** max-w-md mx-auto (mobile-optimized)
- **Button spacing:** p-6 for large touch targets
- **Section gaps:** space-y-8 for clear separation
- **Card padding:** p-6 for comfortable content spacing

## Component Library

### Primary Action Buttons
- **Size:** Full width, 64px height minimum
- **States:** Clock-in (green), Break Start (orange), Break End (blue), Clock-out (red)
- **Typography:** Bold, 18px, white text
- **Interaction:** Subtle scale animation on press

### Status Display
- **Container:** Rounded card with colored border matching current state
- **Content:** Large status text + time since last action
- **Colors:** Gray (未出勤), Green (出勤中), Orange (休憩中), Red (退勤済み)

### Time & Earnings Display
- **Time:** Monospace font, large size, prominent positioning
- **Earnings:** Bold typography, emphasized with larger font size
- **Update frequency:** Real-time (every minute)

### Navigation
- **Bottom Tab Bar:** Fixed position with 3-4 main sections
- **Icons:** Material Icons via CDN
- **Active states:** Filled icons with primary color

### Data Tables
- **History View:** Clean rows with alternating backgrounds
- **Export Button:** Secondary style, top-right positioning
- **Responsive:** Horizontal scroll on mobile for detailed data

## Animations
**Minimal approach:** Only essential feedback animations
- Button press: subtle scale (0.95) with 150ms transition
- Status changes: fade transition between states
- Loading states: simple spinner, no complex animations

## Mobile Optimization
- **Touch targets:** 44px minimum for all interactive elements
- **Thumb zones:** Primary actions in bottom 2/3 of screen
- **One-handed operation:** All critical functions accessible with thumb
- **PWA indicators:** Install prompt, offline status indicators

## Error Handling
- **Toast notifications:** Bottom-positioned, non-intrusive
- **Error states:** Clear messaging with suggested actions
- **Offline handling:** Graceful degradation with local storage sync

This design prioritizes immediate usability and reliability over visual sophistication, ensuring engineers can quickly track time without friction while maintaining professional appearance.