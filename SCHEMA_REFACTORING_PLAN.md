// SUGGESTED REFACTORING STRUCTURE

schemas/business/
├── core/
│   ├── enums.ts           // BusinessTypeSchema, BusinessStatusSchema
│   ├── base.ts            // Core BusinessSchema
│   └── location.ts        // Location-related schemas
├── forms/
│   ├── create.ts          // Business creation forms
│   ├── update.ts          // Business update forms
│   └── steps.ts           // Multi-step form schemas
├── relationships/
│   ├── images.ts          // Image schemas
│   ├── categories.ts      // Category relationships
│   ├── owner.ts           // Owner/profile relationships
│   └── composite.ts       // Combined schemas (WithImages, WithRelations)
├── filters/
│   └── query.ts           // Search and filter schemas
└── index.ts               // Clean barrel export

// BENEFITS:
// ✅ Each file < 100 lines
// ✅ Single responsibility
// ✅ Easy to find specific schemas
// ✅ Better maintainability
// ✅ Reduced cognitive load
