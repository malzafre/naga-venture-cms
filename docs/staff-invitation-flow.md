# Staff Creation and Authentication Flow

## Overview

The NAGA VENTURE CMS implements a practical staff creation and authentication flow using auto-generated passwords sent via email. This approach provides immediate access while maintaining security.

## Flow Description

### 1. Admin Creates Staff Account

When a Tourism Admin uses the "Add Staff" modal:

1. **Validation**: Email is checked for uniqueness
2. **Password Generation**: Secure random password is generated (12 characters with mixed case, numbers, symbols)
3. **User Creation**: `supabase.auth.admin.createUser()` creates authenticated user account
4. **Profile Setup**: Profile is created/updated with role and metadata
5. **JWT Metadata**: User role is synced to JWT claims for immediate access
6. **Permissions**: Staff permissions are created if specified
7. **Credentials Display**: Temporary password is shown to admin for secure sharing

### 2. Staff Member Receives Credentials

The admin securely shares:
- **Email**: Staff member's login email
- **Temporary Password**: Auto-generated secure password
- **Login URL**: Direct link to CMS login page
- **Instructions**: Change password after first login

### 3. First Login Flow

When staff logs in for the first time:

1. **Standard Login**: Uses email and temporary password
2. **Immediate Access**: Full CMS access based on assigned role
3. **Password Change**: Encouraged to change password via profile settings
4. **Role-Based Navigation**: Automatic sidebar and permissions based on role

## Key Benefits

✅ **Immediate Access**: No waiting for email verification  
✅ **Secure**: Auto-generated strong passwords  
✅ **Simple**: Standard login flow, no complex onboarding  
✅ **Practical**: Admin can immediately share credentials  
✅ **Production-Ready**: Uses Supabase's core authentication  
✅ **Role-Based**: JWT claims are automatically synced  

## Implementation Details

### Password Generation

```typescript
const generateRandomPassword = (): string => {
  const length = 12;
  // Ensures at least one: lowercase, uppercase, number, special character
  // Returns shuffled 12-character password
};
```

### Hook: `useCreateStaff`

```typescript
// Located in: hooks/useUserManagement.ts
export function useCreateStaff() {
  return useMutation({
    mutationFn: async ({ email, role, firstName, lastName, phoneNumber, permissions }) => {
      // 1. Check for existing users
      // 2. Generate secure random password
      // 3. Create user with supabase.auth.admin.createUser()
      // 4. Update profile with role and metadata
      // 5. Create staff permissions
      // 6. Return success with temporary password
    }
  });
}
```

### Component: `StaffFormModal`

```typescript
// Located in: components/molecules/StaffFormModal.tsx
// Provides floating modal UI for staff creation
// Shows temporary password in success alert with copy option
// Includes security reminders for admin
```

## Security Considerations

1. **Strong Passwords**: Auto-generated 12-character passwords with mixed complexity
2. **Secure Sharing**: Admin responsible for secure credential transmission
3. **Password Change**: Staff encouraged to change password after first login
4. **Role Validation**: Only valid staff roles can be assigned
5. **JWT Claims**: Role information is immediately available in session
6. **Auto-Verification**: Staff accounts are pre-verified by admin creation

## Admin Instructions

When creating a new staff member:

1. **Fill Form**: Complete all required staff information
2. **Set Permissions**: Configure role-specific permissions
3. **Create Account**: Click "Create Staff Member"
4. **Copy Password**: Use "Copy Password" button in success dialog
5. **Share Securely**: Send credentials to staff member via secure method
6. **Verify Login**: Confirm staff can log in successfully

## Staff Instructions

When receiving credentials:

1. **Visit Login Page**: Go to provided CMS URL
2. **Enter Credentials**: Use provided email and temporary password
3. **Access CMS**: Full access granted based on assigned role
4. **Change Password**: Update password in Profile Settings for security

## Example Credentials Email Template

```
Subject: NAGA VENTURE Tourism CMS - Your Account Access

Hello [Staff Name],

Your staff account has been created for the NAGA VENTURE Tourism CMS.

Login Credentials:
- Email: [email]
- Password: [temporary_password]
- URL: [cms_url]

Important:
- Please change your password after first login
- Keep your credentials secure
- Contact admin if you have any issues

Role: [assigned_role]

Welcome to the team!
```

## Testing the Flow

1. **Create Staff**: Use "Add Staff" button in User Management
2. **Copy Password**: Note the temporary password from success dialog
3. **Test Login**: Verify staff can log in with provided credentials
4. **Verify Access**: Confirm appropriate features are accessible
5. **Password Change**: Test password update functionality

## Troubleshooting

### Common Issues:

1. **Login Failed**: Verify email and password are entered correctly
2. **Access Denied**: Check role assignment and RLS policies
3. **Permission Issues**: Verify staff_permissions table entries

### Debugging:

```sql
-- Check user creation
SELECT id, email, role, is_verified FROM profiles WHERE email = 'staff@example.com';

-- Check authentication
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'staff@example.com';

-- Check JWT metadata
SELECT raw_app_meta_data FROM auth.users WHERE email = 'staff@example.com';
```

This implementation provides a practical, secure, and immediate staff onboarding solution that's perfect for CMS environments.
