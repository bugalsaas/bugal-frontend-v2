# Development Guide

## Overview

This guide provides comprehensive instructions for developing Bugal Frontend V2, including the migration process, development workflow, and best practices. Follow this guide to ensure consistent, high-quality development while maintaining feature parity with the legacy frontend.

## 🚀 Migration Process

### Step-by-Step Migration Workflow

#### 1. **Reference Screenshots**
- Navigate to `/docs/screenshots/` directory
- Find the specific page/modal you're migrating
- Study the visual design, layout, and interactions
- Note any mobile-specific patterns or responsive behaviors

#### 2. **Analyze Legacy Code**
- Locate the corresponding Ant Design component in the old frontend
- Identify the backend API connections and data flow
- Understand the component's props, state, and side effects
- Note any business logic or validation rules

#### 3. **Rebuild with New Stack**
- Create the component using Next.js + Tailwind + Radix UI
- Implement mobile-first responsive design
- Use the design system tokens and components
- Ensure touch-friendly interactions (44px minimum touch targets)

#### 4. **Wire to Backend**
- Connect to existing API endpoints using the shared API layer
- Implement the same data flow as the legacy component
- Maintain identical API contracts (no backend changes)
- Handle loading states, errors, and success states

#### 5. **Verify Functionality**
- Test all interactions and user flows
- Compare behavior with the legacy frontend
- Ensure data consistency between old and new frontends
- Test on mobile and desktop devices

#### 6. **Library Constraints**
- **Minimal Dependencies**: Keep external libraries to a minimum - only bring in what's truly needed
- **Developer Constraint**: "On the libraries subject, please try to keep them at a minimum and only really bring the ones needed"
- **Bundle Size Monitoring**: Regular analysis to prevent bloat
- **Essential Only**: Each library must provide significant value

#### 7. **Parallel Deployment Preparation**
- **Design for Toggle**: Ensure components work independently of old frontend
- **User Preference**: Implement localStorage for user's frontend preference
- **Fallback Safety**: Design graceful fallback if new frontend has issues
- **Session Persistence**: Maintain user state across frontend switches

### Migration Checklist

For each component/page being migrated:

- [ ] **Visual Design**
  - [ ] Matches screenshot reference
  - [ ] Mobile-first responsive design
  - [ ] Touch-friendly interactions
  - [ ] Proper spacing and typography

- [ ] **Functionality**
  - [ ] All features work identically to legacy
  - [ ] API integration matches legacy behavior
  - [ ] Error handling works the same
  - [ ] Loading states implemented

- [ ] **Code Quality**
  - [ ] TypeScript types defined
  - [ ] Component is reusable
  - [ ] Follows design system patterns
  - [ ] Minimal external dependencies

- [ ] **Testing**
  - [ ] Works on mobile devices
  - [ ] Works on desktop
  - [ ] Cross-browser compatibility
  - [ ] Accessibility compliance

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Access to Bugal backend API

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd frontend-v2

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Set API base URL
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001" >> .env.local

# Start development server
npm run dev
```

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📁 Project Structure Guidelines

### File Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── [feature]/         # Feature-specific pages
│   │   ├── page.tsx       # Main page
│   │   ├── [id]/          # Dynamic routes
│   │   └── components/     # Page-specific components
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   ├── [feature]/         # Feature-specific components
│   └── layout/            # Layout components
├── contexts/              # React Context providers
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions
```

### Naming Conventions
- **Files**: kebab-case (`contact-form.tsx`)
- **Components**: PascalCase (`ContactForm`)
- **Hooks**: camelCase starting with `use` (`useContacts`)
- **Types**: PascalCase (`Contact`, `ContactFormData`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

## 🎨 Component Development

### Component Structure
```typescript
// components/ui/contact-card.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MobileCard } from './mobile-card';
import { Contact } from '@/shared/types/contacts';

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  className?: string;
}

export function ContactCard({ 
  contact, 
  onEdit, 
  onDelete, 
  className 
}: ContactCardProps) {
  return (
    <MobileCard 
      interactive 
      className={cn('cursor-pointer', className)}
      onClick={() => onEdit?.(contact)}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">
              {contact.name.charAt(0)}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {contact.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {contact.email}
          </p>
        </div>
        <div className="flex-shrink-0">
          <span className="text-gray-400">→</span>
        </div>
      </div>
    </MobileCard>
  );
}
```

### Component Guidelines
1. **Mobile-First**: Design for mobile, enhance for desktop
2. **Accessibility**: Include proper ARIA labels and keyboard navigation
3. **TypeScript**: Define proper interfaces and types
4. **Reusability**: Make components flexible and composable
5. **Performance**: Use React.memo for expensive components

### Form Components
```typescript
// components/forms/contact-form.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mobileForm } from '@/lib/mobile-utils';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  initialData?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ContactForm({ initialData, onSubmit, onCancel }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className={mobileForm.label}>
            Name *
          </Label>
          <Input
            id="name"
            {...register('name')}
            className={mobileForm.input}
            placeholder="Enter contact name"
          />
          {errors.name && (
            <p className={mobileForm.error}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className={mobileForm.label}>
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={mobileForm.input}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className={mobileForm.error}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className={mobileForm.label}>
            Phone
          </Label>
          <Input
            id="phone"
            {...register('phone')}
            className={mobileForm.input}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-12 text-base"
        >
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 text-base"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

## 🔌 API Integration

### Using Shared API Services
```typescript
// pages/contacts/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/shared/api/contacts';
import { ContactCard } from '@/components/contact-card';
import { ContactForm } from '@/components/forms/contact-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ContactsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.getAll(),
  });

  // Create contact mutation
  const createContact = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsCreateModalOpen(false);
    },
  });

  const handleCreateContact = async (data: any) => {
    try {
      await createContact.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create contact:', error);
    }
  };

  if (isLoading) return <div>Loading contacts...</div>;
  if (error) return <div>Error loading contacts: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Add Contact
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts?.map(contact => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleCreateContact}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## 📱 Mobile-First Development

### Responsive Design Patterns
```typescript
// Mobile-first responsive patterns
const responsivePatterns = {
  // Stack on mobile, side-by-side on desktop
  stackToSide: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4',
  
  // Grid that adapts to screen size
  responsiveGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  
  // Mobile cards, desktop table
  cardToTable: 'block sm:hidden', // Show cards on mobile
  tableToCard: 'hidden sm:block', // Show table on desktop
  
  // Mobile spacing
  mobileSpacing: 'p-4 sm:p-6',
  
  // Touch-friendly buttons
  touchButton: 'min-h-[44px] min-w-[44px] px-4 py-2',
};
```

### Mobile Navigation
```typescript
// Mobile bottom navigation
function MobileBottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
      <div className="flex justify-around py-2">
        {items.map(item => (
          <button
            key={item.id}
            className="flex flex-col items-center space-y-1 min-h-[44px] min-w-[44px]"
            onClick={item.onClick}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
```

## 🧪 Testing Guidelines

### Component Testing
```typescript
// __tests__/contact-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactCard } from '@/components/contact-card';
import { Contact } from '@/shared/types/contacts';

const mockContact: Contact = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
};

test('renders contact information', () => {
  render(<ContactCard contact={mockContact} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});

test('calls onEdit when clicked', () => {
  const onEdit = jest.fn();
  render(<ContactCard contact={mockContact} onEdit={onEdit} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(onEdit).toHaveBeenCalledWith(mockContact);
});
```

### Integration Testing
```typescript
// __tests__/contacts-page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContactsPage from '@/app/contacts/page';

test('displays contacts list', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ContactsPage />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## 🔒 Security Best Practices

### Input Validation
```typescript
// Always validate user inputs
const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
});
```

### API Security
```typescript
// Never expose sensitive data in client-side code
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📊 Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <div>Loading...</div>,
});
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/contact-avatar.jpg"
  alt="Contact avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

### Bundle Size Monitoring
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## 🐛 Debugging

### Development Tools
- **React DevTools**: Component inspection and state debugging
- **Next.js DevTools**: Performance and routing debugging
- **TanStack Query DevTools**: API state debugging
- **Browser DevTools**: Network, console, and performance

### Common Issues
1. **Hydration Mismatch**: Ensure server and client render the same content
2. **API Errors**: Check network tab and API response format
3. **Mobile Issues**: Test on actual devices, not just browser dev tools
4. **Performance**: Use React DevTools Profiler to identify bottlenecks

## 📚 Code Review Guidelines

### Review Checklist
- [ ] **Functionality**: Works identically to legacy frontend
- [ ] **Mobile-First**: Responsive design with touch-friendly interactions
- [ ] **API Integration**: Proper use of shared API layer
- [ ] **TypeScript**: Proper types and interfaces
- [ ] **Performance**: No unnecessary re-renders or API calls
- [ ] **Accessibility**: Proper ARIA labels and keyboard navigation
- [ ] **Error Handling**: Graceful error handling and user feedback
- [ ] **Code Quality**: Clean, readable, and maintainable code

### Pull Request Template
```markdown
## Description
Brief description of changes

## Screenshots
Before/after screenshots if applicable

## Testing
- [ ] Tested on mobile device
- [ ] Tested on desktop
- [ ] Verified API integration
- [ ] Checked error handling

## Migration Notes
Reference to legacy component and any important changes
```

## 🔄 User Toggle Mechanism

### Implementation Strategy
The user toggle mechanism allows users to switch between the old and new frontend seamlessly:

```typescript
// User preference management
const FRONTEND_PREFERENCE_KEY = 'bugal-frontend-preference';

export function setFrontendPreference(preference: 'v1' | 'v2') {
  localStorage.setItem(FRONTEND_PREFERENCE_KEY, preference);
}

export function getFrontendPreference(): 'v1' | 'v2' {
  return localStorage.getItem(FRONTEND_PREFERENCE_KEY) as 'v1' | 'v2' || 'v1';
}

// Toggle component
function FrontendToggle() {
  const currentPreference = getFrontendPreference();
  
  const handleToggle = () => {
    const newPreference = currentPreference === 'v1' ? 'v2' : 'v1';
    setFrontendPreference(newPreference);
    
    // Redirect to appropriate frontend
    if (newPreference === 'v1') {
      window.location.href = 'https://app.bugal.com.au';
    } else {
      window.location.href = 'https://app-v2.bugal.com.au';
    }
  };

  return (
    <Button onClick={handleToggle} variant="outline">
      Switch to {currentPreference === 'v1' ? 'New' : 'Old'} Frontend
    </Button>
  );
}
```

### Toggle Placement
- **Header**: Prominent toggle button in the main header
- **Settings**: Option in user settings/preferences
- **Footer**: Secondary toggle option in footer
- **Mobile**: Accessible in mobile navigation menu

### User Experience
- **Clear Labeling**: "Switch to New Frontend" / "Switch to Old Frontend"
- **Visual Indicators**: Show which frontend is currently active
- **Confirmation**: Optional confirmation dialog for first-time switches
- **Help Text**: Brief explanation of what each frontend offers

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Test production build locally
npm start

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Environment Configuration
```bash
# Staging (with parallel deployment)
NEXT_PUBLIC_API_BASE_URL=https://staging-api.bugal.com.au
NEXT_PUBLIC_LEGACY_FRONTEND_URL=https://staging-app.bugal.com.au

# Production (with parallel deployment)
NEXT_PUBLIC_API_BASE_URL=https://api.bugal.com.au
NEXT_PUBLIC_LEGACY_FRONTEND_URL=https://app.bugal.com.au
```

### Parallel Deployment Setup
1. **Domain Configuration**: Deploy to `app-v2.bugal.com.au`
2. **CDN Setup**: Configure CDN for both frontends
3. **Load Balancing**: Ensure both frontends can handle traffic
4. **Monitoring**: Set up monitoring for both frontends
5. **Rollback Plan**: Quick rollback capability if issues arise

## 📞 Support & Resources

### Documentation
- [Architecture Guide](./ARCHITECTURE.md) - System architecture
- [Design System Guide](./DESIGN_SYSTEM.md) - UI components and patterns
- [API Guide](./API_GUIDE.md) - API integration
- [Screenshots](./docs/screenshots/) - Visual reference

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

---

**Note**: This development guide prioritizes mobile-first design, minimal dependencies, and maintaining feature parity with the legacy frontend while ensuring zero backend changes.
