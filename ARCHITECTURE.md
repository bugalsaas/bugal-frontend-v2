# Architecture Guide

## System Overview

Bugal Frontend V2 follows a modern, mobile-first architecture designed for scalability, maintainability, and performance. This document outlines the technical architecture, design patterns, and system components.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Bugal Frontend V2                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router  │  React 19  │  TypeScript        │
├─────────────────────────────────────────────────────────────┤
│  Tailwind CSS 4  │  Radix UI  │  shadcn/ui Components    │
├─────────────────────────────────────────────────────────────┤
│  TanStack Query  │  Zustand   │  React Hook Form + Zod    │
├─────────────────────────────────────────────────────────────┤
│                    Shared API Layer                         │
├─────────────────────────────────────────────────────────────┤
│              Existing NestJS Backend (No Changes)          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
frontend-v2/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Dashboard home page
│   │   ├── sign-in/           # Authentication pages
│   │   └── forgot-password/   # Password reset flow
│   ├── components/             # Reusable UI components
│   │   ├── auth/              # Authentication components
│   │   ├── layout/            # Layout components (header, nav)
│   │   └── ui/                # Base UI components
│   ├── contexts/               # React Context providers
│   │   └── auth-context.tsx   # Authentication state
│   ├── lib/                   # Utilities and configurations
│   │   ├── design-tokens.ts   # Design system tokens
│   │   ├── mobile-utils.ts    # Mobile-first utilities
│   │   └── utils.ts           # General utilities
│   └── pages/                 # Additional pages (if needed)
├── docs/                      # Documentation and screenshots
│   └── screenshots/           # Visual reference for all features
├── public/                    # Static assets
└── shared/                    # Shared with legacy frontend
    ├── api/                   # API service layer
    ├── types/                 # TypeScript type definitions
    └── utils/                 # Shared utilities
```

## 🔧 Technology Stack

### Core Framework
- **Next.js 15**: App Router for modern routing and SSR capabilities
- **React 19**: Latest React with modern hooks and concurrent features
- **TypeScript**: Full type safety throughout the application

### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework with mobile-first approach
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Copy-paste components built on Radix UI
- **Framer Motion**: Smooth animations and gestures

### State Management
- **TanStack Query**: Server state management with caching and synchronization
- **Zustand**: Lightweight client state management
- **React Context**: Authentication and global app state

### Forms & Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation

### Library Constraints
- **Minimal Dependencies**: Only essential libraries to reduce bundle size
- **Developer Constraint**: "On the libraries subject, please try to keep them at a minimum and only really bring the ones needed"
- **Bundle Size Monitoring**: Regular analysis to prevent bloat
- **Essential Only**: Each library must provide significant value

## 🎨 Design System Architecture

### Mobile-First Approach
```typescript
// Breakpoint system
const breakpoints = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
}
```

### Component Hierarchy
```
AppLayout
├── Header (DesktopHeader | MobileHeader)
├── Navigation (DesktopSidebarNav | MobileBottomNav)
└── Main Content
    ├── Page Components
    ├── Feature Components
    └── UI Components
        ├── Atoms (Button, Input, Label)
        ├── Molecules (SearchBox, FormField)
        └── Organisms (ContactCard, ShiftTable)
```

### Design Tokens
- **Colors**: Bugal brand palette with semantic naming
- **Typography**: Geist font family with responsive scaling
- **Spacing**: 4px base unit with mobile-first scale
- **Touch Targets**: Minimum 44px for accessibility

## 🔌 API Integration Architecture

### Shared API Layer
The shared API layer ensures consistency between old and new frontends:

```typescript
// Example API service structure
shared/api/
├── auth.ts          # Authentication endpoints
├── contacts.ts      # Contact management
├── shifts.ts        # Shift management
├── invoices.ts      # Invoice management
├── reports.ts       # Report generation
└── index.ts         # Re-exports
```

### Authentication Flow
```typescript
// JWT-based authentication with refresh tokens
AuthProvider
├── Token Management (localStorage)
├── User State (Context)
├── Protected Routes
└── API Integration (Bearer tokens)
```

### Error Handling
- **API Errors**: Consistent error response format
- **Network Errors**: Graceful degradation and retry logic
- **Validation Errors**: Form-level and field-level validation
- **User Feedback**: Toast notifications and inline messages

## 📱 Mobile-First Architecture

### Responsive Design Patterns
```typescript
// Mobile-first utility classes
const mobilePatterns = {
  // Stack on mobile, side-by-side on desktop
  stackToSide: 'flex flex-col sm:flex-row',
  
  // Grid that adapts to screen size
  responsiveGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  
  // Mobile cards, desktop table
  cardToTable: 'block sm:hidden', // Show cards on mobile
  tableToCard: 'hidden sm:block'  // Show table on desktop
}
```

### Navigation Architecture
- **Mobile**: Bottom navigation with drawer menu
- **Desktop**: Sidebar navigation with collapsible sections
- **Responsive**: Automatic switching based on screen size

### Touch Interactions
- **Touch Targets**: Minimum 44px for accessibility
- **Gestures**: Swipe, pull-to-refresh, touch feedback
- **Animations**: Smooth transitions optimized for mobile

## 🔒 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Route-level protection
- **Role-Based Access**: Organization and user-level permissions
- **Token Refresh**: Automatic token renewal

### Data Protection
- **HTTPS Only**: All API communications encrypted
- **Input Validation**: Client and server-side validation
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookie attributes

## ⚡ Performance Architecture

### Optimization Strategies
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching**: TanStack Query caching and invalidation

### Mobile Performance
- **Touch Optimization**: Reduced touch latency
- **Smooth Scrolling**: Hardware-accelerated animations
- **Lazy Loading**: Component and image lazy loading
- **Progressive Enhancement**: Core functionality first

## 🧪 Testing Architecture

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user journey testing
- **Mobile Testing**: Device-specific testing

### Quality Assurance
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 🚀 Deployment Architecture

### Parallel Deployment Strategy
The frontend-v2 is designed to be deployed alongside the existing frontend, allowing users to toggle between versions:

```
Production Environment:
├── app.bugal.com.au          # Legacy frontend (current)
├── app-v2.bugal.com.au       # New frontend (parallel)
└── api.bugal.com.au          # Shared backend (no changes)
```

### User Toggle Mechanism
- **Frontend Toggle**: Users can switch between old and new frontend
- **Session Persistence**: User preference stored in localStorage
- **Fallback Safety**: If new frontend has issues, users can easily switch back
- **Gradual Migration**: Users can opt-in to try the new frontend

### Build Process
```bash
# Development
npm run dev          # Next.js dev server with hot reload

# Production Build
npm run build        # Optimized production build
npm run start        # Production server

# Static Export (if needed)
npm run export       # Static site generation
```

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment with parallel deployment
- **Production**: Live production environment with user toggle capability

## 🔄 Migration Architecture

### Migration Strategy
1. **Screenshot Reference**: Visual documentation in `/docs/screenshots/`
2. **Legacy Code Analysis**: Reference old Ant Design implementations
3. **API Compatibility**: Maintain 100% API compatibility
4. **Feature Parity**: Ensure identical functionality
5. **Progressive Migration**: Feature-by-feature migration
6. **Parallel Deployment**: Deploy alongside old frontend for safe migration
7. **User Toggle**: Provide easy switching mechanism between frontends

### Backend Integration
- **Zero Backend Changes**: Frontend-only migration
- **API Preservation**: Exact same API contracts
- **Shared Services**: Common API layer for both frontends
- **Data Consistency**: Same data sources and formats
- **Parallel Access**: Both frontends access same backend simultaneously

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS metrics
- **Bundle Size**: Regular bundle analysis
- **API Performance**: Response time monitoring
- **Error Tracking**: Client-side error monitoring

### User Analytics
- **Usage Patterns**: Feature usage analytics
- **Mobile vs Desktop**: Device-specific metrics
- **Performance Metrics**: User experience metrics
- **Error Rates**: Application stability metrics

## 🔮 Future Architecture Considerations

### Scalability
- **Micro-frontends**: Potential future micro-frontend architecture
- **API Gateway**: Centralized API management
- **CDN Integration**: Global content delivery
- **Caching Strategy**: Advanced caching layers

### Technology Evolution
- **React Server Components**: Future SSR enhancements
- **WebAssembly**: Performance-critical components
- **PWA Features**: Offline capabilities
- **Dark Mode**: Theme system expansion

## 📚 Related Documentation

- [Design System Guide](./DESIGN_SYSTEM.md) - Detailed design system documentation
- [API Integration Guide](./API_GUIDE.md) - API usage and integration patterns
- [Development Guide](./DEVELOPMENT.md) - Development workflow and guidelines
- [Migration Guide](../MIGRATION_GUIDE.md) - Migration process and progress
- [Technical Decisions](../TECHNICAL_DECISIONS.md) - Architecture decision records

---

**Note**: This architecture prioritizes mobile-first design, minimal dependencies, and zero backend changes while maintaining feature parity with the legacy frontend.
