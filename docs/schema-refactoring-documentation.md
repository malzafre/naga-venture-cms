# Schema Refactoring Documentation

## Overview

The NAGA VENTURE project has undergone a comprehensive schema refactoring to create a centralized, well-organized validation library. This document outlines the new structure and migration details.

## New Schema Structure

### 📁 `/schemas/` - Centralized Schema Library

| File | Purpose | Legacy Location |
|------|---------|----------------|
| `base.schemas.ts` | Common, reusable validation schemas | `common/baseSchemas.ts` |
| `profile.schemas.ts` | User profiles and authentication | `auth/authSchemas.ts` |
| `booking.schemas.ts` | Booking and reservation system | _New_ |
| `review.schemas.ts` | Reviews and ratings | _New_ |
| `storage.schemas.ts` | File upload and storage | _New_ |
| `amenities.schemas.ts` | Amenities management | `amenitiesSchemas.ts` |
| `categories.schemas.ts` | Category management | `categoriesSchemas.ts` |
| `tourism.schemas.ts` | Tourism content (events, spots) | `tourism/eventSchemas.ts`, `tourism/touristSpotSchemas.ts` |
| `business.schemas.ts` | Business management | `business/businessSchemas.ts` |
| `index.ts` | Barrel export for all schemas | _Updated_ |

## Key Improvements

### 🎯 **Centralized Imports**
**Before:**
```typescript
import { UuidSchema } from '@/schemas/common/baseSchemas';
import { AmenitySchema } from '@/schemas/amenitiesSchemas';
import { BusinessSchema } from '@/schemas/business/businessSchemas';
```

**After:**
```typescript
import { UuidSchema, AmenitySchema, BusinessSchema } from '@/schemas';
```

### 🔄 **Better Organization**
- **Feature-based grouping**: Related schemas are now grouped by domain
- **Reusable base schemas**: Common patterns like UUIDs, names, dates are centralized
- **Clear naming conventions**: Consistent schema and type naming across all features

### 🛡️ **Enhanced Type Safety**
- **Comprehensive validation**: All CRUD operations have proper schemas
- **Form validation**: Dedicated schemas for client-side form validation
- **API validation**: Structured request/response validation
- **Filter schemas**: Type-safe filtering and search operations

### 🔧 **Backwards Compatibility**
- **Legacy aliases**: Old schema names are aliased to prevent breaking changes
- **Gradual migration**: Legacy imports are commented out but preserved
- **Flexible schemas**: Extended schemas accommodate existing data structures

## Migration Details

### ✅ **Completed Migrations**

1. **Base Schemas**
   - All common validation patterns centralized
   - UUID, Name, Email, Phone, Date schemas standardized

2. **User Management**
   - Profile and authentication schemas unified
   - Staff management schemas enhanced

3. **Amenities System**
   - Complete CRUD validation
   - Usage analytics schemas
   - Filter and search schemas

4. **Categories System**
   - Main and sub-category schemas
   - Hierarchy management validation
   - Business assignment schemas

5. **Business Management**
   - Comprehensive business validation
   - Location and geographic schemas
   - Form validation and filtering

6. **Tourism Content**
   - Event and tourist spot schemas
   - Media and content validation

### 🔄 **Legacy Schema Handling**

Legacy schema files are preserved but no longer exported:

```typescript
// schemas/index.ts
// Legacy exports (commented out to prevent conflicts)
// export * from './amenitiesSchemas';
// export * from './categoriesSchemas';
// export * from './business/businessSchemas';
```

### 📝 **Schema Patterns**

#### **Base Schema Structure**
```typescript
// Every feature follows this pattern:

// 1. Enums and Constants
export const CategoryTypeSchema = z.enum([...]);

// 2. Base Schema (core fields)
export const CategoryBaseSchema = z.object({...});

// 3. Complete Schema (with database fields)
export const CategorySchema = CategoryBaseSchema.extend({
  ...BaseEntitySchema.shape,
  // additional fields
});

// 4. CRUD Schemas
export const CategoryCreateSchema = ...;
export const CategoryUpdateSchema = ...;

// 5. Filtering and Search
export const CategoryFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  // feature-specific filters
});

// 6. Legacy Aliases (for backwards compatibility)
export const CategoryInsertSchema = CategoryCreateSchema;
```

#### **Common Base Schemas**
```typescript
// Available in all feature schemas:
UuidSchema           // UUID validation
NameSchema          // Name validation (1-100 chars)
OptionalNameSchema  // Optional name validation
EmailSchema         // Email validation
PhoneSchema         // Phone number validation
DateSchema          // Date validation
UrlSchema           // URL validation
PaginationSchema    // { page, limit }
SortSchema          // { sortBy, sortOrder }
SearchSchema        // { searchQuery }
BaseEntitySchema    // { id, created_at, updated_at, created_by, updated_by }
```

## Usage Examples

### **Creating a New Feature Schema**

```typescript
// schemas/newFeature.schemas.ts
import { z } from 'zod';
import {
  UuidSchema,
  NameSchema,
  BaseEntitySchema,
  PaginationSchema,
  SortSchema,
  SearchSchema,
} from './base.schemas';

// 1. Define enums
export const FeatureTypeSchema = z.enum(['type1', 'type2']);

// 2. Base schema
export const FeatureBaseSchema = z.object({
  name: NameSchema,
  type: FeatureTypeSchema,
  // ... other fields
});

// 3. Complete schema
export const FeatureSchema = FeatureBaseSchema.extend({
  ...BaseEntitySchema.shape,
});

// 4. CRUD schemas
export const FeatureCreateSchema = FeatureBaseSchema.extend({
  created_by: UuidSchema.optional(),
});

export const FeatureUpdateSchema = FeatureBaseSchema.partial().extend({
  updated_by: UuidSchema.optional(),
});

// 5. Filters
export const FeatureFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  type: FeatureTypeSchema.optional(),
});

// 6. Types
export type Feature = z.infer<typeof FeatureSchema>;
export type FeatureCreate = z.infer<typeof FeatureCreateSchema>;
export type FeatureUpdate = z.infer<typeof FeatureUpdateSchema>;
export type FeatureFilters = z.infer<typeof FeatureFiltersSchema>;
```

### **Using Schemas in Hooks**

```typescript
// hooks/features/newFeature/useFeatureManagement.ts
import {
  FeatureSchema,
  FeatureCreateSchema,
  FeatureUpdateSchema,
  FeatureFiltersSchema,
  type Feature,
  type FeatureCreate,
  type FeatureUpdate,
  type FeatureFilters,
} from '@/schemas';

export const useFeatureManagement = () => {
  // All validation handled by centralized schemas
  const createFeature = useMutation({
    mutationFn: async (data: FeatureCreate) => {
      const validatedData = FeatureCreateSchema.parse(data);
      // ... API call
    },
  });
  
  // ... rest of hook
};
```

## Benefits Achieved

### 🚀 **Developer Experience**
- **Single import path**: All schemas from `@/schemas`
- **IntelliSense support**: Better autocomplete and type checking
- **Consistent patterns**: Predictable schema structure across features
- **Reduced boilerplate**: Reusable base schemas eliminate duplication

### 🛡️ **Type Safety**
- **End-to-end validation**: From form input to database storage
- **Compile-time checks**: TypeScript catches schema mismatches
- **Runtime validation**: Zod ensures data integrity
- **API contract enforcement**: Request/response validation

### 🔧 **Maintainability**
- **Centralized changes**: Update base schemas to affect all features
- **Clear dependencies**: Easy to track schema relationships
- **Version control**: Better diff tracking for schema changes
- **Documentation**: Self-documenting schema structure

### ⚡ **Performance**
- **Tree shaking**: Only import needed schemas
- **Lazy validation**: Schemas only parsed when needed
- **Caching**: Schema compilation can be cached
- **Bundle optimization**: Reduced duplicate validation code

## Future Considerations

### 🔮 **Potential Enhancements**
1. **Schema versioning**: Add version numbers for API compatibility
2. **Custom validators**: Create domain-specific validation functions
3. **Schema generation**: Auto-generate schemas from database
4. **OpenAPI integration**: Generate API documentation from schemas
5. **Testing utilities**: Helper functions for schema testing

### 📋 **Maintenance Tasks**
1. **Regular audits**: Check for unused or outdated schemas
2. **Performance monitoring**: Monitor validation performance
3. **Documentation updates**: Keep examples and patterns current
4. **Breaking change management**: Plan schema evolution carefully

---

**Last Updated**: June 18, 2025  
**Migration Status**: ✅ Complete  
**Total Schemas Migrated**: 8 feature domains, 50+ individual schemas
