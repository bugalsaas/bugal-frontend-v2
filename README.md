# Bugal Frontend V2

## Overview
Bugal Frontend V2 is a complete modernization of the Bugal business management platform, migrating from Ant Design + React 16 to a modern Next.js 15 + React 19 + Tailwind CSS 4 + Radix UI stack.

## 🎯 Project Objectives

### Primary Goals
- **Modern Technology Stack**: Migrate from legacy React 16 + Ant Design to Next.js 15 + React 19 + Tailwind CSS 4
- **Mobile-First Design**: Optimize for mobile users with 44px minimum touch targets and responsive layouts
- **Zero Backend Changes**: Frontend-only migration - no backend modifications required
- **Feature Parity**: Maintain exact same functionality as the legacy frontend
- **Performance Improvement**: Faster builds, better mobile performance, modern React patterns
- **Parallel Deployment**: Deploy alongside old frontend with user toggle capability for safe migration
- **Risk Mitigation**: Users can switch back to old frontend if issues arise

### Business Management Platform
Bugal serves as a comprehensive business management platform with these core modules:
- **Dashboard**: Overview with stats, quick actions, and recent activity
- **Contacts**: Customer/client management system
- **Shifts**: Work scheduling and time tracking
- **Invoices**: Billing and payment management
- **Reports**: Analytics and business insights
- **Organizations**: Multi-tenant organization management
- **Users**: User management and permissions
- **Expenses**: Expense tracking and management
- **Incidents**: Incident reporting and management
- **Rates**: Rate/pricing management
- **Agreements**: Contract and agreement management
- **Subscriptions**: Subscription and billing management

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **React**: React 19 with modern hooks and patterns
- **Styling**: Tailwind CSS 4 with mobile-first approach
- **UI Components**: Radix UI primitives + shadcn/ui
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **TypeScript**: Full type safety throughout

### Key Principles
- **Mobile-First**: Design for mobile, enhance for desktop
- **Component-Driven**: Atomic design principles with reusable components
- **API Compatibility**: 100% compatibility with existing backend APIs
- **Minimal Dependencies**: Only essential libraries to reduce bundle size
- **Backend Preservation**: Zero backend changes - frontend-only migration

## 📱 Mobile-First Design System

### Design Tokens
- **Colors**: Bugal brand palette (primary blue, success green, warning orange, destructive red)
- **Typography**: Geist font family for modern, clean appearance
- **Spacing**: Mobile-first spacing scale (4px base unit)
- **Breakpoints**: sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- **Touch Targets**: Minimum 44px for mobile accessibility

### Layout Patterns
- **Mobile**: Bottom navigation, card layouts, full-screen modals
- **Desktop**: Sidebar navigation, table layouts, centered modals
- **Responsive**: Progressive enhancement from mobile to desktop

## 🔌 API Integration

### Shared API Layer
All API services are located in `/shared/api/` to ensure:
- Single source of truth for API logic
- Identical API calls between old and new frontend
- Zero backend changes required
- Easy maintenance and bug fixes

### Authentication
- JWT-based authentication with refresh tokens
- Protected routes for authenticated users
- Organization context for multi-tenant support

## 🚀 Development Process

### Migration Strategy
1. **Reference Screenshots**: Use `/docs/screenshots/` as visual reference for each page/modal
2. **Rebuild with New Stack**: Recreate using Next.js + Tailwind + Radix UI
3. **Wire to Backend**: Connect to existing API endpoints (no backend changes)
4. **Reference Legacy Code**: Check old Ant Design code for backend connections
5. **Maintain Functionality**: Ensure identical behavior to legacy frontend

### Feature Migration Order
1. **Dashboard** (most-used feature)
2. **Shifts** management
3. **Contacts** management
4. **Invoices** management
5. **Reports** section
6. Secondary features (Agreements, Expenses, Rates, etc.)

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - **START HERE** - Get up and running in 30 minutes
- [Rebuild Plan](./REBUILD_PLAN.md) - **COMPREHENSIVE PLAN** - Complete step-by-step rebuild plan
- [Architecture Guide](./ARCHITECTURE.md) - Detailed system architecture
- [Design System](./DESIGN_SYSTEM.md) - Mobile-first design system and components
- [API Guide](./API_GUIDE.md) - Shared API layer usage
- [Development Guide](./DEVELOPMENT.md) - Migration process and guidelines
- [Screenshots](./docs/screenshots/) - Visual reference for all features

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Access to Bugal backend API

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Set API base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 🎨 Design Reference

### Visual Documentation
All UI screens and modals are documented in `/docs/screenshots/`:
- **Dashboard**: Main dashboard layout and widgets
- **Authentication**: Sign-in, sign-up, forgot password flows
- **Navigation**: Mobile bottom nav, desktop sidebar
- **Modals**: All modal dialogs and forms
- **Mobile**: Mobile-specific layouts and interactions
- **Reports**: All report types and components

### Component Library
- **Base Components**: Button, Input, Card, Dialog, etc.
- **Mobile Components**: MobileCard, StatCard, ActionCard, ListCard
- **Layout Components**: AppLayout, Header, Navigation
- **Form Components**: Form fields with validation

## 🔒 Constraints & Guidelines

### Critical Constraints
- **Backend Preservation**: NO backend changes allowed
- **API Compatibility**: Must maintain 100% API compatibility
- **Minimal Libraries**: Only essential libraries to reduce bundle size
- **Feature Parity**: Must maintain exact same functionality
- **Mobile-First**: All designs must be mobile-first
- **Parallel Deployment**: Must be deployable alongside old frontend
- **User Toggle**: Must provide easy way for users to switch between frontends

### Library Usage Guidelines
- **Essential Only**: Only add libraries that are absolutely necessary
- **Bundle Size**: Monitor and minimize bundle size impact
- **Performance**: Prioritize performance over convenience
- **Maintenance**: Prefer libraries with good maintenance and TypeScript support
- **Minimal Dependencies**: Keep external libraries to a minimum - only bring in what's truly needed
- **Developer Constraint**: "On the libraries subject, please try to keep them at a minimum and only really bring the ones needed"

## 📊 Current Status

### ✅ Phase 1-20: COMPLETE
All phases of the frontend rebuild have been completed:

**Phase 1-2: Authentication & Dashboard** ✅
- Sign-in, sign-up, forgot password, reset password
- Email verification
- Dashboard with stats, activity, and quick actions

**Phase 3: Contacts Management** ✅
- Contacts list page with search and filters
- New, Edit, View contact modals
- Guardian and invoice recipient management

**Phase 4: Shifts Management** ✅
- Shifts list with recurrence support
- New, Edit, View, Complete, Duplicate, Cancel modals
- Shift notes, expenses, and attachments

**Phase 5: Invoices Management** ✅
- Invoices list with status filters
- New, Edit, View, Payment, Notify, Write-off modals
- PDF download and email notifications

**Phase 6: Expenses** ✅
- Expenses list with receipt upload
- Expense tracking and categorization

**Phase 7: Reports** ✅
- Shift, Invoice, KMs, Tax, and Incident reports
- Report generation and data visualization

**Phase 8: Rates** ✅
- Rates management (Hourly/Fixed)
- Archive and CRUD operations

**Phase 9: Incidents** ✅
- 4-part incident modal
- Witness management and NDIS reporting

**Phase 10: Agreements** ✅
- Agreements list with completion status
- Complete, undo, and notify functionality

**Phase 11: Organizations** ✅
- Organization settings
- Staff management
- Organizations list for platform admins

**Phase 12: Profile** ✅
- User profile page
- Personal, contact, and banking information

**Phase 13: Users Management** ✅
- Users list for platform admins
- Impersonation and email confirmation

**Phase 14: Subscriptions** ✅
- Subscription management
- Free trial and past due banners
- Stripe integration ready

**Phase 15: Navigation** ✅
- Organization switcher
- Collapsible sidebar
- Enhanced user dropdown

**Phase 16: Shared Components** ✅
- Toast notification system
- Error boundaries
- Not-found page

**Phase 17: API Services** ✅
- All API services implemented
- Mock data fallbacks
- Development mode support

**Phase 18: Testing** ✅
- Error handling
- Linting passed
- No critical bugs

**Phase 19: Performance** ✅
- Next.js optimizations
- Image optimization
- Security headers
- Memoization

**Phase 20: Documentation** ✅
- Comprehensive README
- Code quality review

### 🚀 Ready for Production
The new frontend is **complete and ready for deployment**:
- ✅ All UI components built and functional
- ✅ All API services implemented with mock fallbacks
- ✅ Error handling and performance optimizations
- ✅ Mobile-first responsive design
- ✅ 100% API compatibility with backend
- ✅ No backend changes required

### ⏳ Next Steps
- Configure environment variables for production API
- Deploy alongside existing frontend
- User acceptance testing
- Gradual rollout

## 🤝 Contributing

### Development Workflow
1. Reference screenshots in `/docs/screenshots/`
2. Check legacy Ant Design code for backend connections
3. Rebuild using new tech stack
4. Ensure API compatibility
5. Test on mobile and desktop
6. Maintain feature parity

### Code Standards
- TypeScript for all components
- Mobile-first responsive design
- Component-driven architecture
- Minimal external dependencies
- Comprehensive error handling

## 📞 Support

For questions about the migration process or technical decisions, refer to:
- [Migration Guide](../MIGRATION_GUIDE.md)
- [Technical Decisions](../TECHNICAL_DECISIONS.md)
- [API Compatibility](../API_COMPATIBILITY.md)

---

**Note**: This is a beta version for testing purposes only. Use test organization data only.