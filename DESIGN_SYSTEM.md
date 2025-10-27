# Design System Guide

## Overview

The Bugal Frontend V2 Design System is built on mobile-first principles, ensuring optimal user experience across all devices while maintaining the Bugal brand identity. This guide covers design tokens, components, patterns, and implementation guidelines.

## 🎨 Design Philosophy

### Mobile-First Approach
- **Primary Target**: Mobile devices (phones and tablets)
- **Progressive Enhancement**: Enhance for larger screens
- **Touch-First**: All interactions optimized for touch
- **Performance**: Fast loading and smooth interactions on mobile

### Core Principles
- **Accessibility**: WCAG 2.1 AA compliance
- **Consistency**: Unified visual language across all components
- **Scalability**: Easy to extend and maintain
- **Brand Alignment**: Maintains Bugal's visual identity
- **Minimal Dependencies**: Only essential libraries to reduce bundle size
- **Developer Constraint**: "On the libraries subject, please try to keep them at a minimum and only really bring the ones needed"

## 🎯 Design Tokens

### Color Palette

#### Brand Colors
```typescript
const colors = {
  primary: {
    50: '#eff6ff',   // Lightest blue
    500: '#2684de',  // Main Bugal Blue
    900: '#1e3a8a'   // Darkest blue
  },
  success: {
    50: '#f0fdf4',
    500: '#0ad794',  // Bugal Green
    900: '#14532d'
  },
  warning: {
    50: '#fffbeb',
    500: '#ff9f48',  // Bugal Orange
    900: '#78350f'
  },
  destructive: {
    50: '#fef2f2',
    500: '#ff686f',  // Bugal Red
    900: '#7f1d1d'
  }
}
```

#### Semantic Color Usage
- **Primary**: Main actions, links, brand elements
- **Success**: Success states, confirmations, positive feedback
- **Warning**: Warnings, cautions, pending states
- **Destructive**: Errors, deletions, dangerous actions
- **Gray**: Text, borders, backgrounds, disabled states

### Typography

#### Font Family
- **Primary**: Geist Sans (modern, clean, highly readable)
- **Monospace**: Geist Mono (for code and data)

#### Font Scale
```typescript
const typography = {
  xs: '0.75rem',    // 12px - Captions, labels
  sm: '0.875rem',   // 14px - Small text
  base: '1rem',     // 16px - Body text
  lg: '1.125rem',   // 18px - Large body
  xl: '1.25rem',    // 20px - Small headings
  '2xl': '1.5rem',  // 24px - Medium headings
  '3xl': '1.875rem', // 30px - Large headings
  '4xl': '2.25rem'  // 36px - Extra large headings
}
```

#### Responsive Typography
- **Mobile**: Smaller base sizes for better readability
- **Desktop**: Larger sizes for better hierarchy
- **Line Height**: 1.5 for body text, 1.2 for headings

### Spacing System

#### Base Unit: 4px
```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem'    // 128px
}
```

#### Spacing Patterns
- **Component Padding**: `md` (16px) for mobile, `lg` (24px) for desktop
- **Section Spacing**: `lg` (24px) for mobile, `xl` (32px) for desktop
- **Card Spacing**: `md` (16px) internal padding

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
}
```

#### Mobile-First Approach
- **Base Styles**: Mobile-first (no prefix)
- **Responsive Styles**: Use `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Progressive Enhancement**: Add features for larger screens

### Touch Targets

#### Minimum Sizes
```typescript
const touchTargets = {
  min: '44px',   // Minimum touch target (Apple/Google guidelines)
  sm: '40px',    // Small touch target
  md: '44px',    // Standard touch target
  lg: '48px',    // Large touch target
  xl: '56px'     // Extra large touch target
}
```

#### Touch-Friendly Guidelines
- **Buttons**: Minimum 44px height
- **Links**: Minimum 44px touch area
- **Form Controls**: Minimum 44px height
- **Spacing**: Adequate spacing between touch targets

## 🧩 Component Library

### Base Components

#### Button
```typescript
// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Action</Button>
<Button variant="ghost">Ghost Action</Button>
<Button variant="destructive">Delete Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

#### Input
```typescript
// Basic input with mobile optimization
<Input 
  placeholder="Enter text"
  className="h-12 text-base" // Prevents zoom on iOS
/>
```

#### Card
```typescript
// Mobile-optimized card
<Card className="p-4 sm:p-6">
  <CardContent>Content</CardContent>
</Card>
```

### Mobile-Specific Components

#### MobileCard
```typescript
// Base mobile card
<MobileCard>Content</MobileCard>

// Interactive card
<MobileCard interactive onClick={handleClick}>
  Clickable content
</MobileCard>

// Elevated card
<MobileCard elevated>Important content</MobileCard>
```

#### StatCard
```typescript
<StatCard
  title="Today's Shifts"
  value="12"
  change="+2 from yesterday"
  trend="up"
/>
```

#### ActionCard
```typescript
<ActionCard
  title="Add New Shift"
  description="Create a new shift entry"
  icon={<Calendar className="h-6 w-6" />}
  action={() => console.log('Add shift')}
/>
```

#### ListCard
```typescript
<ListCard
  items={[
    {
      title: "Shift completed",
      subtitle: "2 hours ago",
      value: "8:00 AM - 4:00 PM",
      badge: "Completed"
    }
  ]}
/>
```

### Layout Components

#### AppLayout
```typescript
<AppLayout
  title="Bugal V2"
  showSearch={true}
  navigationItems={navigationItems}
  user={user}
>
  {children}
</AppLayout>
```

#### Responsive Navigation
- **Mobile**: Bottom navigation with drawer menu
- **Desktop**: Sidebar navigation
- **Automatic**: Switches based on screen size

## 📱 Mobile-First Patterns

### Layout Patterns

#### Stack to Side
```typescript
// Mobile: vertical stack, Desktop: horizontal
<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

#### Responsive Grid
```typescript
// Adapts to screen size
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

#### Card to Table
```typescript
// Mobile: cards, Desktop: table
<div className="space-y-2 sm:hidden"> {/* Mobile cards */}
  {items.map(item => <MobileCard key={item.id}>{item.content}</MobileCard>)}
</div>

<table className="hidden sm:table w-full"> {/* Desktop table */}
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.field1}</td>
        <td>{item.field2}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Navigation Patterns

#### Mobile Bottom Navigation
```typescript
// Fixed bottom navigation for mobile
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
  <div className="flex justify-around py-2">
    {navigationItems.map(item => (
      <button key={item.id} className="flex flex-col items-center space-y-1">
        <item.icon className="h-5 w-5" />
        <span className="text-xs">{item.label}</span>
      </button>
    ))}
  </div>
</nav>
```

#### Desktop Sidebar
```typescript
// Collapsible sidebar for desktop
<aside className="hidden sm:block sm:w-64 lg:w-72 bg-white border-r border-gray-200">
  <nav className="p-4 space-y-2">
    {navigationItems.map(item => (
      <a key={item.id} href={item.href} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </a>
    ))}
  </nav>
</aside>
```

### Form Patterns

#### Mobile-Optimized Forms
```typescript
// Mobile-friendly form with proper spacing
<form className="space-y-6">
  <div className="space-y-4">
    <div>
      <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
        Email address
      </Label>
      <Input
        id="email"
        type="email"
        className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        placeholder="Enter your email"
      />
    </div>
  </div>
  
  <Button className="w-full h-12 text-base font-medium">
    Submit
  </Button>
</form>
```

### Modal Patterns

#### Mobile-First Modals
```typescript
// Full screen on mobile, centered on desktop
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center">
  <div className="bg-white w-full sm:w-auto sm:max-w-md lg:max-w-lg rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-y-auto">
    <div className="p-6">
      {/* Modal content */}
    </div>
  </div>
</div>
```

## 🎭 Animation & Interaction

### Touch Feedback
```typescript
// Touch feedback for interactive elements
<button className="active:scale-95 transition-transform duration-150">
  Touch me
</button>
```

### Smooth Transitions
```typescript
// Smooth transitions for state changes
<div className="transition-all duration-200 ease-in-out">
  Content
</div>
```

### Gesture Support
- **Swipe**: Left/right swipe gestures
- **Pull to Refresh**: Pull down to refresh content
- **Touch Callouts**: Disabled to prevent iOS callouts

## ♿ Accessibility Guidelines

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Clear focus states

### Keyboard Navigation
- **Tab Order**: Logical tab sequence
- **Focus Indicators**: Visible focus states
- **Skip Links**: Skip to main content

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Descriptive labels for complex components
- **Alt Text**: Descriptive alt text for images

## 🔧 Implementation Guidelines

### CSS Classes
```typescript
// Use Tailwind utility classes
<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
  <div className="flex-1">Content</div>
  <div className="flex-1">Content</div>
</div>
```

### Component Composition
```typescript
// Compose components from smaller parts
<Card className="p-4 sm:p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <StatCard title="Stat" value="123" />
  </CardContent>
</Card>
```

### Responsive Utilities
```typescript
// Mobile-first responsive utilities
import { mobileSpacing, mobileLayout, mobileUtils } from '@/lib/mobile-utils';

// Use predefined patterns
<div className={mobileSpacing.container}>
  <div className={mobileLayout.responsiveGrid}>
    {items.map(item => (
      <div key={item.id} className={mobileUtils.showOnMobile}>
        {item.content}
      </div>
    ))}
  </div>
</div>
```

## 📊 Performance Considerations

### Bundle Size
- **Minimal Dependencies**: Only essential libraries
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Route-based splitting

### Mobile Performance
- **Touch Latency**: Minimize touch response time
- **Smooth Scrolling**: Hardware-accelerated animations
- **Image Optimization**: Next.js automatic optimization

## 🧪 Testing Guidelines

### Visual Testing
- **Screenshot Testing**: Compare with reference screenshots
- **Cross-Device Testing**: Test on various screen sizes
- **Touch Testing**: Verify touch interactions

### Accessibility Testing
- **Screen Reader Testing**: Test with VoiceOver/NVDA
- **Keyboard Testing**: Navigate with keyboard only
- **Color Contrast Testing**: Verify contrast ratios

## 📚 Resources

### Design References
- [Screenshots](./docs/screenshots/) - Visual reference for all features
- [Component Examples](./src/components/) - Live component examples
- [Design Tokens](./src/lib/design-tokens.ts) - All design tokens

### External Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Note**: This design system prioritizes mobile-first design, accessibility, and performance while maintaining the Bugal brand identity. All components should be tested on mobile devices first, then enhanced for desktop.
