# NAGA VENTURE

## Role-Based Access Control (RBAC) Documentation

**Date:** June 9, 2025

---

## Table of Contents

- [Introduction]
- [User Roles Overview]
- [1. Tourism Admin]
- [2. Business Listing Manager]
- [3. Tourism Content Manager]
- [4. Business Registration Manager]
- [Implementation Guidelines]
- [Conclusion]

---

## Introduction

This document outlines the Role-Based Access Control (RBAC) structure for the NAGA VENTURE tourism platform. It details the sidebar navigation elements and permissions for each user role in the system.

## User Roles Overview

The NAGA VENTURE platform has the following user roles:

1. **Tourism Admin** - Full system access and control
2. **Business Listing Manager** - Manages business listings and related content
3. **Tourism Content Manager** - Manages tourist spots, events, and tourism content
4. **Business Registration Manager** - Handles business registration approvals

---

## 1. Tourism Admin

### Sidebar Sections

#### 1. Dashboard

- Overview statistics
- Recent activities
- System health metrics
- Quick access to pending approvals

#### 2. User Management

- Staff accounts (managers)
- Business owners
- Tourist accounts
- Role assignments
- Verification status

#### 3. Business Listings

- Accommodations
- Shops
- Services
- Pending approvals
- Featured businesses

#### 4. Tourism Content

- Tourist spots
- Events
- Promotions
- Featured content

#### 5. Categories

- Main categories
- Subcategories
- Category management

#### 6. Bookings & Reservations

- Accommodation bookings
- Booking statistics
- Issue resolution

#### 7. Reviews & Ratings

- Review moderation
- Reported reviews
- Rating analytics

#### 8. Content Approval

- Pending business profiles
- Pending tourist spots
- Pending events
- Pending promotions

#### 9. Analytics

- Visitor statistics
- Popular locations
- Booking trends
- User engagement

#### 10. System Settings

- API integrations
- Storage management
- Security settings
- Backup & restore

### Permissions

#### User Management

- Create, view, update, and delete all user accounts
- Assign and modify user roles
- Verify business owners
- Reset passwords
- View user activity logs
- Manage staff permissions

#### Business Listings

- Approve or reject new business registrations
- Edit any business listing information
- Feature/unfeature businesses
- Deactivate problematic businesses
- Manage business categories
- View all business analytics

#### Tourism Content

- Create and manage tourist spots
- Create and manage events
- Approve or reject content submissions
- Feature/unfeature content
- Manage content categories
- Upload and manage images

#### Categories

- Create new main categories and subcategories
- Edit category information
- Reorder categories
- Activate/deactivate categories
- Assign categories to businesses/spots

#### Bookings & Reservations

- View all bookings across the platform
- Modify booking status
- Handle booking disputes
- Access payment information
- Generate booking reports

#### Reviews & Ratings

- View all reviews
- Edit or delete inappropriate reviews
- Respond to reviews
- View rating analytics

#### Content Approval

- Review all submitted content
- Approve or reject with comments
- Edit submitted content
- Manage approval workflows
- View approval history

#### Analytics

- Access all platform analytics
- Generate custom reports
- Export data
- Set up automated reports
- View business performance metrics

#### System Settings

- Configure API integrations (Google Maps, payment gateways)
- Manage storage buckets and policies
- Configure security settings
- Perform database backups
- Update system parameters

---

## 2. Business Listing Manager

### Sidebar Sections

#### 1. Dashboard

- Business listing statistics
- Recent business activities
- Pending approvals

#### 2. Business Listings

- Accommodations
- Shops
- Services
- Pending approvals
- Featured businesses

#### 3. Categories

- Main categories
- Subcategories
- Category management

#### 4. Reviews & Ratings

- Review moderation for businesses
- Reported reviews
- Business rating analytics

#### 5. Content Approval

- Pending business profiles
- Pending business updates

#### 6. Analytics

- Business performance metrics
- Popular businesses
- Business engagement

### Permissions

#### Business Listings

- Approve or reject new business registrations
- Edit any business listing information
- Feature/unfeature businesses
- Deactivate problematic businesses
- Manage business categories
- View all business analytics

#### Categories

- Create new business-related categories
- Edit category information
- Reorder categories
- Activate/deactivate categories
- Assign categories to businesses

#### Reviews & Ratings

- View all business reviews
- Approve or reject business reviews
- Edit or delete inappropriate reviews
- View business rating analytics

#### Content Approval

- Review business profile submissions
- Approve or reject with comments
- Edit submitted business content
- View business approval history

#### Analytics

- Access business-related analytics
- Generate business reports
- Export business data
- View business performance metrics

---

## 3. Tourism Content Manager

### Sidebar Sections

#### 1. Dashboard

- Tourism content statistics
- Recent content activities
- Pending content approvals

#### 2. Tourism Content

- Tourist spots
- Events
- Special Promotions
- Featured content

#### 3. Categories

- Tourism-related categories
- Category management

#### 4. Reviews & Ratings

- Review moderation for tourist spots and events
- Reported reviews
- Tourism content rating analytics

#### 5. Analytics

- Tourism content performance
- Popular tourist spots
- Event engagement

### Permissions

#### Tourism Content

- Create and manage tourist spots
- Create and manage events
- Create and manage Special Promotions
- Feature/unfeature content
- Manage content categories
- Upload and manage images

#### Categories

- Create new tourism-related categories
- Edit category information
- Reorder categories
- Activate/deactivate categories
- Assign categories to tourist spots and events

#### Reviews & Ratings

- View all tourist spot and event reviews
- Edit or delete inappropriate reviews
- View tourism content rating analytics

#### Analytics

- Access tourism content analytics
- Generate tourism content reports
- Export tourism content data
- View tourism content performance metrics

---

## 4. Business Registration Manager

### Sidebar Sections

#### 1. Dashboard

- Registration statistics
- Pending registrations
- Recent registration activities

#### 2. Business Registrations

- Pending registrations
- Approved registrations
- Rejected registrations
- Registration history

#### 3. Business Owners

- Business owner accounts
- Verification requests
- Account issues

#### 4. Analytics

- Registration metrics
- Approval rates
- Registration trends

### Permissions

#### Business Registrations

- View all business registration requests
- Approve or reject business registrations
- Request additional information from applicants
- View registration history
- Generate registration reports

#### Business Owners

- View business owner accounts
- Verify business owner identities
- Reset business owner passwords
- Deactivate problematic accounts
- Communicate with business owners

#### Analytics

- Access registration analytics
- Generate registration reports
- View registration trends
- Monitor approval/rejection rates

---

## Implementation Guidelines

### Security Considerations

1. **Server-Side Validation**: Always validate permissions on the server side, not just in the UI
2. **RLS Policies**: Implement Row Level Security policies in the database as the primary security mechanism
3. **Token Validation**: Validate JWT tokens and check permissions on each API request
4. **Audit Logging**: Log all permission-related actions for security auditing
5. **Least Privilege**: Grant only the minimum permissions needed for each role

---

## Conclusion

This RBAC structure provides a comprehensive security model for the NAGA VENTURE tourism platform. By clearly defining roles, sidebar sections, and permissions, the platform ensures that users can only access and modify data appropriate to their role while providing an intuitive and focused user experience.
