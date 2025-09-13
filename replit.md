# 副業エンジニア向け出退勤記録WebアプリMVP

## Overview

This is a time tracking web application specifically designed for freelance engineers in Japan. The app features a one-tap operation interface optimized for mobile use, allowing users to easily clock in/out, manage break times, and track earnings. The application is built as a Progressive Web App (PWA) with offline capabilities and real-time calculations of work hours and earnings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system following Material Design 3 principles
- **State Management**: TanStack Query (React Query) for server state and local React state for UI
- **PWA Features**: Manifest.json configured for standalone mobile app experience
- **Mobile-First Design**: Optimized for one-handed operation with large touch targets (44px minimum)

### Backend Architecture  
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful endpoints for work records and settings management
- **Data Validation**: Zod schemas for type-safe data validation
- **Storage Interface**: Abstract storage interface with in-memory implementation (prepared for database integration)

### Data Storage Solutions
- **Primary**: Prepared for PostgreSQL with Drizzle ORM configuration
- **Fallback**: localStorage for offline functionality and data persistence
- **ORM**: Drizzle ORM with schema definitions for work records and user settings
- **Database Provider**: Configured for Neon Database (PostgreSQL-compatible)

### Authentication and Authorization
- Currently no authentication system implemented (single-user MVP)
- Session management structure exists but not actively used
- Architecture prepared for future multi-user expansion

### Core Data Models
- **WorkRecord**: Stores clock-in/out times, break periods, work minutes, earnings, and status
- **Settings**: User preferences including hourly rate, overtime rate, and daily targets
- **WorkStatus**: Enum tracking current state (not_started, working, on_break, finished)

### Time Calculation Engine
- Real-time work duration calculations excluding break time
- Automatic earnings computation based on hourly rates
- Overtime detection and rate application
- Japanese currency formatting and time display utilities

### Responsive Design System
- **Color Palette**: Semantic color system with light/dark mode support
- **Typography**: Inter font family with size hierarchy optimized for mobile
- **Component Library**: Custom button variants for different work actions (clock-in: green, break: orange, clock-out: red)
- **Layout**: Max-width container (max-w-md) for mobile-optimized experience

### Offline Capabilities
- localStorage-based data persistence as primary storage
- Automatic fallback when API is unavailable
- Data synchronization architecture prepared for future server sync

### Performance Optimizations
- Code splitting with dynamic imports
- React Query for efficient data fetching and caching
- Minimized bundle size with tree-shaking
- Optimized for mobile performance and battery usage

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and functional components
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced developer experience

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible UI primitives (@radix-ui/react-*)
- **Shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Dynamic className generation
- **clsx & tailwind-merge**: Conditional styling utilities

### Data Management
- **TanStack React Query**: Server state management and caching
- **Drizzle ORM**: Type-safe SQL ORM for database operations
- **Zod**: Schema validation and type inference
- **date-fns**: Date manipulation and formatting utilities

### Backend and Database
- **Express.js**: Web server framework
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **tsx**: TypeScript execution for server-side code

### Development and Build Tools
- **PostCSS**: CSS processing with Tailwind
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development environment integration

### PWA and Mobile Features
- **Web App Manifest**: Native app-like installation
- **Service Worker**: Prepared for offline functionality (not yet implemented)
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

### Quality and Testing Infrastructure
- **TypeScript**: Compile-time type checking
- **React Hook Form**: Form handling and validation (@hookform/resolvers)
- **Error Boundaries**: Runtime error handling and display