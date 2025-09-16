# HMS WebApp Component Breakdown

## 📋 **Overview**

This document outlines the breakdown of the HMS (Hospital Management System) webapp into reusable components. The goal is to eliminate code duplication, improve maintainability, and create a consistent user experience across different user roles.

## 🏗️ **Component Architecture**

### **Directory Structure**
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── StatCard.jsx       # Statistics display cards
│   │   ├── QuickActionCard.jsx # Quick action buttons
│   │   ├── Calendar.jsx       # Calendar component
│   │   ├── Noticeboard.jsx    # Notification display
│   │   ├── AppointmentCard.jsx # Appointment information cards
│   │   ├── Modal.jsx          # Reusable modal dialogs
│   │   ├── LoadingSpinner.jsx # Loading states
│   │   ├── Button.jsx         # Standardized buttons
│   │   ├── ProfileAvatar.jsx  # User profile avatars
│   │   └── index.js           # Component exports
│   ├── layout/                # Layout components
│   │   ├── Header.jsx         # Application header
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   └── index.js           # Layout exports
│   └── Layout.jsx             # Main layout wrapper
├── pages/
│   ├── admin/
│   │   └── Dashboard.jsx      # Admin dashboard (refactored)
│   ├── doctor/
│   │   └── Dashboard.jsx      # Doctor dashboard (refactored)
│   └── Login.jsx              # Login page
```

## 🧩 **Reusable Components**

### **1. UI Components (`/components/ui/`)**

#### **StatCard**
- **Purpose**: Display statistics with icons and counts
- **Props**: `title`, `value`, `icon`, `color`, `className`, `onClick`
- **Usage**: Used in both admin and doctor dashboards for statistics

```jsx
import { StatCard } from '../components/ui';
import { User } from 'lucide-react';

<StatCard
  title="Total Patients"
  value={dashboardData.totalPatients}
  icon={User}
  color="blue"
  onClick={() => navigate('/patients')}
/>
```

#### **QuickActionCard**
- **Purpose**: Quick action buttons with icons
- **Props**: `name`, `icon`, `color`, `onClick`, `description`
- **Usage**: Quick actions section in dashboards

```jsx
import { QuickActionCard } from '../components/ui';
import { Calendar } from 'lucide-react';

<QuickActionCard
  name="appointments"
  icon={Calendar}
  color="bg-purple-100 hover:bg-purple-200"
  onClick={() => navigate('/appointments')}
  description="Manage appointments"
/>
```

#### **Calendar**
- **Purpose**: Interactive calendar with events
- **Props**: `currentMonth`, `onMonthChange`, `events`, `onDayClick`, `className`
- **Usage**: Calendar schedule in dashboards

```jsx
import { Calendar } from '../components/ui';

<Calendar
  currentMonth={currentMonth}
  onMonthChange={setCurrentMonth}
  events={calendarEvents}
  onDayClick={(day) => handleDayClick(day)}
/>
```

#### **Noticeboard**
- **Purpose**: Display notifications with different types
- **Props**: `notices`, `title`, `className`
- **Usage**: Notification display in dashboards

```jsx
import { Noticeboard } from '../components/ui';

<Noticeboard
  notices={notifications}
  title="System Notifications"
/>
```

#### **AppointmentCard**
- **Purpose**: Display appointment information
- **Props**: `appointment`, `onViewDetails`, `onStartSession`, `onReschedule`, `className`
- **Usage**: Today's appointments section

```jsx
import { AppointmentCard } from '../components/ui';

<AppointmentCard
  appointment={appointment}
  onViewDetails={(app) => handleViewDetails(app)}
  onStartSession={(app) => handleStartSession(app)}
  onReschedule={(app) => handleReschedule(app)}
/>
```

#### **Modal**
- **Purpose**: Reusable modal dialogs
- **Props**: `isOpen`, `onClose`, `title`, `children`, `size`, `className`
- **Usage**: Various modals throughout the application

```jsx
import { Modal } from '../components/ui';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Schedule Appointment"
  size="md"
>
  {/* Modal content */}
</Modal>
```

#### **LoadingSpinner**
- **Purpose**: Consistent loading states
- **Props**: `size`, `color`, `className`, `text`
- **Usage**: Loading states throughout the application

```jsx
import { LoadingSpinner } from '../components/ui';

<LoadingSpinner
  size="lg"
  color="blue"
  text="Loading dashboard data..."
/>
```

#### **Button**
- **Purpose**: Standardized buttons with variants
- **Props**: `children`, `variant`, `size`, `onClick`, `disabled`, `type`, `className`, `icon`, `loading`
- **Usage**: All buttons throughout the application

```jsx
import { Button } from '../components/ui';
import { Plus } from 'lucide-react';

<Button
  variant="primary"
  size="md"
  icon={Plus}
  onClick={handleClick}
  loading={isLoading}
>
  Add New Patient
</Button>
```

#### **ProfileAvatar**
- **Purpose**: Display user profile images or initials as fallback
- **Props**: `user`, `size`, `className`, `showBorder`, `onClick`
- **Usage**: User avatars in headers, user menus, and profile sections

```jsx
import { ProfileAvatar } from '../components/ui';

// Basic usage with initials
<ProfileAvatar user={{ first_name: 'John', last_name: 'Doe' }} />

// With profile image
<ProfileAvatar 
  user={{ 
    first_name: 'Jane', 
    last_name: 'Smith', 
    profile_image: 'https://example.com/avatar.jpg' 
  }} 
/>

// Large size with border and click handler
<ProfileAvatar 
  user={user}
  size="xl"
  showBorder={true}
  onClick={() => navigate('/profile')}
/>
```

### **2. Layout Components (`/components/layout/`)**

#### **Header**
- **Purpose**: Application header with user menu
- **Props**: `title`, `user`, `onUserMenuToggle`, `userMenuOpen`, `children`
- **Usage**: Main application header

```jsx
import { Header } from '../components/layout';

<Header
  title="UNIVERSITY OF GHANA HOSPITAL MANAGEMENT SYSTEM"
  user={user}
  onUserMenuToggle={handleUserMenuToggle}
  userMenuOpen={userMenuOpen}
>
  {/* Additional header content */}
</Header>
```

#### **Sidebar**
- **Purpose**: Navigation sidebar with role-based items
- **Props**: `items`, `settingsItems`, `isOpen`, `onToggle`, `onItemClick`, `onLogout`, `user`, `className`
- **Usage**: Main navigation sidebar

```jsx
import { Sidebar } from '../components/layout';

<Sidebar
  items={navigationItems}
  settingsItems={settingsItems}
  isOpen={sidebarOpen}
  onToggle={handleSidebarToggle}
  onItemClick={handleNavigation}
  onLogout={handleLogout}
  user={user}
/>
```

## 🔄 **Refactoring Benefits**

### **Before (Monolithic Components)**
- ❌ Code duplication between admin and doctor dashboards
- ❌ Large, hard-to-maintain components
- ❌ Inconsistent styling and behavior
- ❌ Difficult to test individual features
- ❌ Hard to reuse functionality

### **After (Component-Based)**
- ✅ Reusable components across different pages
- ✅ Consistent styling and behavior
- ✅ Easier testing and maintenance
- ✅ Better separation of concerns
- ✅ Improved developer experience

## 📊 **Component Usage Examples**

### **Admin Dashboard Refactored**
```jsx
import React, { useState, useEffect } from 'react';
import { 
  StatCard, 
  QuickActionCard, 
  Calendar, 
  Noticeboard,
  LoadingSpinner 
} from '../components/ui';
import { Header, Sidebar } from '../components/layout';

const AdminDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  // Statistics cards
  const statCards = [
    { title: 'Total Doctors', value: dashboardData.totalDoctors, icon: User, color: 'blue' },
    { title: 'Total Patients', value: dashboardData.totalPatients, icon: Users, color: 'green' },
    // ... more stats
  ];

  // Quick actions
  const quickActions = [
    { name: 'doctors', icon: User, color: 'bg-blue-100 hover:bg-blue-200', onClick: () => navigate('/doctors') },
    { name: 'patients', icon: Users, color: 'bg-green-100 hover:bg-green-200', onClick: () => navigate('/patients') },
    // ... more actions
  ];

  if (loading) return <LoadingSpinner size="2xl" />;

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {quickActions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>

      {/* Calendar and Noticeboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          events={calendarEvents}
        />
        <Noticeboard notices={notifications} />
      </div>
    </div>
  );
};
```

### **Doctor Dashboard Refactored**
```jsx
import React, { useState, useEffect } from 'react';
import { 
  StatCard, 
  QuickActionCard, 
  Calendar, 
  Noticeboard,
  AppointmentCard,
  LoadingSpinner 
} from '../components/ui';

const DoctorDashboard = () => {
  // Similar structure to admin dashboard but with doctor-specific data
  const doctorStats = [
    { title: 'Today Patients', value: dashboardData.todayStats.total, icon: User, color: 'blue' },
    { title: 'Completed Today', value: dashboardData.todayStats.completed, icon: CheckCircle, color: 'green' },
    // ... more stats
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {doctorStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="space-y-4">
        {todayAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onViewDetails={handleViewDetails}
            onStartSession={handleStartSession}
            onReschedule={handleReschedule}
          />
        ))}
      </div>

      {/* Calendar and Noticeboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          events={calendarEvents}
        />
        <Noticeboard notices={notifications} />
      </div>
    </div>
  );
};
```

## 🎯 **Implementation Guidelines**

### **1. Component Design Principles**
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Use clear, descriptive prop names
- **Default Values**: Provide sensible defaults for optional props
- **Flexibility**: Make components configurable through props
- **Consistency**: Use consistent naming and styling patterns

### **2. State Management**
- Keep component state local when possible
- Use context for global state (auth, theme, etc.)
- Pass data down through props
- Use callbacks for parent-child communication

### **3. Styling**
- Use Tailwind CSS classes consistently
- Create reusable color and size variants
- Maintain responsive design patterns
- Follow the existing design system

### **4. Testing**
- Test components in isolation
- Mock dependencies and external services
- Test different prop combinations
- Ensure accessibility standards

## 🚀 **Next Steps**

1. **Refactor Existing Pages**: Update admin and doctor dashboards to use new components
2. **Create Additional Components**: Add more specialized components as needed
3. **Documentation**: Maintain component documentation and examples
4. **Testing**: Add comprehensive tests for all components
5. **Performance**: Optimize component rendering and bundle size

## 📝 **Component Checklist**

When creating new components, ensure they follow these guidelines:

- [ ] Single responsibility principle
- [ ] Clear prop interface with TypeScript (if applicable)
- [ ] Default values for optional props
- [ ] Consistent styling with design system
- [ ] Responsive design
- [ ] Accessibility features
- [ ] Error handling
- [ ] Loading states
- [ ] Documentation and examples
- [ ] Unit tests

This component breakdown provides a solid foundation for building a maintainable, scalable, and consistent hospital management system.
