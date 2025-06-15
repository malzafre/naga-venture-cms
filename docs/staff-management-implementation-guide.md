# Staff Management Implementation Guide

## Overview

Based on your current NAGA VENTURE CMS implementation, here's how Tourism Admin staff management would work with your existing architecture.

## Current Architecture Analysis

### ✅ Database Schema (Ready)
```sql
-- User roles already defined
CREATE TYPE user_role AS ENUM(
  'tourism_admin',
  'business_listing_manager', 
  'tourism_content_manager',
  'business_registration_manager',
  'business_owner',
  'tourist'
);

-- Profiles table with role management
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'tourist',
  -- ... other fields
);

-- Staff permissions table for granular control
CREATE TABLE staff_permissions (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  can_manage_users BOOLEAN DEFAULT false,
  can_manage_businesses BOOLEAN DEFAULT false,
  can_manage_tourist_spots BOOLEAN DEFAULT false,
  can_manage_events BOOLEAN DEFAULT false,
  can_approve_content BOOLEAN DEFAULT false,
  can_manage_categories BOOLEAN DEFAULT false
);
```

### ✅ Existing Hooks (useUserManagement.ts)
- `useUserListings(filters)` - Can filter by role, search, pagination
- `useUpdateStaffPermissions()` - Updates staff permissions
- `useUpdateUserProfile()` - Updates basic profile data
- Complete Zod validation with error handling

### ✅ Query Keys Structure (lib/queryKeys.ts)
- Added user management domain keys
- Cache invalidation patterns for staff operations

## Implementation Approach

### 1. Staff Filtering Pattern
```typescript
// Filter users to show only staff roles
const STAFF_ROLES: UserRole[] = [
  'tourism_admin',
  'business_listing_manager',
  'tourism_content_manager', 
  'business_registration_manager'
];

// Use existing useUserListings with role filtering
const useStaffListings = (filters: UserFilters = {}) => {
  return useUserListings({
    ...filters,
    // Custom filter for staff roles only
    staff_only: true
  });
};
```

### 2. Staff Management Operations

#### A. View Staff Members
```typescript
// Tourism Admin can view all staff
const { data: staffData, isLoading } = useStaffListings({
  searchQuery: 'john@example.com',
  role: 'business_listing_manager', // Optional role filter
  page: 1,
  limit: 20
});
```

#### B. Create Staff Member
```typescript
// Enhanced hook needed for staff creation
const useCreateStaff = () => {
  return useMutation({
    mutationFn: async ({ email, role, permissions }) => {
      // 1. Create auth user via Supabase Admin API
      const { data: authUser } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { role }
      });
      
      // 2. Update profile with role
      await supabase.from('profiles')
        .update({ role, is_verified: true })
        .eq('id', authUser.user.id);
        
      // 3. Create staff permissions
      await supabase.from('staff_permissions')
        .insert({ profile_id: authUser.user.id, ...permissions });
    }
  });
};
```

#### C. Update Staff Role
```typescript
// Use existing pattern with role validation
const useUpdateStaffRole = () => {
  return useMutation({
    mutationFn: async ({ userId, newRole }) => {
      // Validate role is a staff role
      if (!STAFF_ROLES.includes(newRole)) {
        throw new Error('Invalid staff role');
      }
      
      return supabase.from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
    }
  });
};
```

#### D. Update Staff Permissions
```typescript
// Already implemented in useUserManagement.ts
const { mutate: updatePermissions } = useUpdateStaffPermissions();

updatePermissions({
  userId: 'staff-id',
  permissions: {
    can_manage_businesses: true,
    can_approve_content: false
  }
});
```

### 3. Component Structure

#### A. Staff Management Page
```typescript
// app/(sidebar)/user-management/staff-management.tsx
export default function StaffManagementScreen() {
  const [filters, setFilters] = useState({});
  
  const { data: staffData, isLoading } = useStaffListings(filters);
  const { mutate: createStaff } = useCreateStaff();
  const { mutate: updateRole } = useUpdateStaffRole();
  const { mutate: updatePermissions } = useUpdateStaffPermissions();
  
  return (
    <StaffDataTable 
      data={staffData}
      onCreateStaff={createStaff}
      onUpdateRole={updateRole}
      onUpdatePermissions={updatePermissions}
    />
  );
}
```

#### B. Components Needed
1. **StaffDataTable** - Display staff with actions
2. **StaffFormModal** - Create/edit staff form
3. **PermissionsMatrix** - Permission checkboxes
4. **RoleSelector** - Staff role dropdown

### 4. Permission Management

#### Permission Matrix Interface
```typescript
interface StaffPermissions {
  can_manage_users: boolean;
  can_manage_businesses: boolean;
  can_manage_tourist_spots: boolean;
  can_manage_events: boolean;
  can_approve_content: boolean;
  can_manage_categories: boolean;
}

// Component for permission editing
const PermissionsMatrix = ({ 
  permissions, 
  onUpdate 
}: {
  permissions: StaffPermissions;
  onUpdate: (permissions: Partial<StaffPermissions>) => void;
}) => {
  return (
    <View>
      {Object.entries(permissions).map(([key, value]) => (
        <Switch 
          key={key}
          label={formatPermissionLabel(key)}
          value={value}
          onValueChange={(newValue) => 
            onUpdate({ [key]: newValue })
          }
        />
      ))}
    </View>
  );
};
```

### 5. Security & Access Control

#### Row Level Security Policies
```sql
-- Only tourism_admin can manage staff
CREATE POLICY staff_management_admin_only ON profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'tourism_admin'
  )
);

-- Staff can view their own permissions
CREATE POLICY staff_view_own_permissions ON staff_permissions
FOR SELECT USING (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'tourism_admin'
  )
);
```

#### Route Guards
```typescript
// Protect staff management routes
const StaffManagementRoute = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'tourism_admin') {
    return <UnauthorizedPage />;
  }
  
  return <StaffManagementScreen />;
};
```

## Key Features

### 1. Staff Dashboard
- **Overview**: Total staff count by role
- **Recent Activity**: New staff registrations, role changes
- **Quick Actions**: Create staff, pending verifications

### 2. Staff Listing
- **Filtering**: By role, verification status, search by name/email
- **Sorting**: By creation date, name, last activity
- **Pagination**: Handle large staff lists

### 3. Staff Profile Management
- **Basic Info**: Name, email, phone, profile image
- **Role Management**: Change staff roles with validation
- **Permission Matrix**: Granular permission control
- **Activity Log**: Track staff actions and changes

### 4. Staff Creation Workflow
1. **Email Invitation**: Send invite to new staff member
2. **Role Assignment**: Select appropriate staff role
3. **Permission Setup**: Configure initial permissions
4. **Account Activation**: Auto-verify staff accounts

### 5. Permission Management
- **Role-Based**: Default permissions per role
- **Custom Permissions**: Override defaults per user
- **Permission Inheritance**: Hierarchy-based permissions
- **Audit Trail**: Track permission changes

## Implementation Priority

### Phase 1: Core Staff Management (Week 1-2)
1. Enhance useUserManagement with staff-specific hooks
2. Create StaffDataTable component
3. Implement basic CRUD operations
4. Add role validation and filtering

### Phase 2: Advanced Features (Week 3-4)
1. Staff creation workflow with email invites
2. Permission matrix interface
3. Staff activity monitoring
4. Bulk operations (role changes, permissions)

### Phase 3: Analytics & Reporting (Week 5-6)
1. Staff performance analytics
2. Permission usage reports
3. Staff activity dashboards
4. Audit logs and compliance

## Technical Decisions

### Data Fetching Strategy
- **TanStack Query**: For caching and optimistic updates
- **Parallel Queries**: Load staff data and permissions together
- **Pagination**: Client-side for small datasets, server-side for large

### State Management
- **Server State**: TanStack Query for all staff data
- **Local State**: React hooks for form state and UI interactions
- **Global State**: Minimal - only user auth context

### Form Management
- **React Hook Form**: For staff creation/editing
- **Zod Validation**: Schema validation for all operations
- **Optimistic Updates**: Immediate UI feedback

### Error Handling
- **Comprehensive**: All operations have proper error boundaries
- **User-Friendly**: Clear error messages and recovery options
- **Logging**: All errors logged for debugging

This implementation leverages your existing architecture while adding the specific functionality needed for comprehensive staff management.
