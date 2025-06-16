/**
 * Enhanced Query Key Factory - Phase 3 Optimization
 *
 * Comprehensive query key management system following TanStack Query best practices.
 * Provides hierarchical, type-safe query keys with optimized cache invalidation patterns.
 *
 * Features:
 * - Hierarchical key structure for precise cache management
 * - Type-safe query key generation with TypeScript support
 * - Optimized invalidation patterns for related data
 * - Consistent naming conventions across all domains
 * - Support for complex filtering and relationships
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */

// Base query keys following domain-driven design
const queryKeys = {
  // Business Management Domain
  businesses: {
    all: ['businesses'] as const,
    lists: () => [...queryKeys.businesses.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.businesses.lists(), { ...filters }] as const,
    details: () => [...queryKeys.businesses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.businesses.details(), id] as const,

    // Business-specific relationships
    images: (businessId: string) => [...queryKeys.businesses.detail(businessId), 'images'] as const,
    categories: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'categories'] as const,
    reviews: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'reviews'] as const,
    amenities: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'amenities'] as const,
    hours: (businessId: string) => [...queryKeys.businesses.detail(businessId), 'hours'] as const,

    // Business filtering and search
    byStatus: (status: string) => [...queryKeys.businesses.lists(), { status }] as const,
    byType: (type: string) => [...queryKeys.businesses.lists(), { business_type: type }] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.businesses.lists(), { category: categoryId }] as const,
    byOwner: (ownerId: string) => [...queryKeys.businesses.lists(), { owner: ownerId }] as const,
    search: (query: string) => [...queryKeys.businesses.all, 'search', query] as const,
    featured: () => [...queryKeys.businesses.lists(), { featured: true }] as const,
    pending: () => [...queryKeys.businesses.lists(), { status: 'pending' }] as const,

    // Analytics and statistics
    analytics: () => [...queryKeys.businesses.all, 'analytics'] as const,
    stats: (timeframe?: string) => [...queryKeys.businesses.all, 'stats', timeframe] as const,
  },

  // Category Management Domain
  categories: {
    all: ['categories'] as const,

    // Main Categories
    mainLists: () => [...queryKeys.categories.all, 'main', 'list'] as const,
    mainList: (filters: Record<string, unknown>) =>
      [...queryKeys.categories.mainLists(), { ...filters }] as const,
    mainDetails: () => [...queryKeys.categories.all, 'main', 'detail'] as const,
    mainDetail: (id: string) => [...queryKeys.categories.mainDetails(), id] as const,

    // Sub Categories
    subLists: () => [...queryKeys.categories.all, 'sub', 'list'] as const,
    subList: (filters: Record<string, unknown>) =>
      [...queryKeys.categories.subLists(), { ...filters }] as const,
    subDetails: () => [...queryKeys.categories.all, 'sub', 'detail'] as const,
    subDetail: (id: string) => [...queryKeys.categories.subDetails(), id] as const,

    // Category relationships
    subsByMain: (mainCategoryId: string) =>
      [...queryKeys.categories.mainDetail(mainCategoryId), 'subcategories'] as const,

    // Category analytics and usage
    analytics: () => [...queryKeys.categories.all, 'analytics'] as const,
    usage: (type: 'business' | 'tourist_spot') =>
      [...queryKeys.categories.all, 'usage', type] as const,
  },

  // User Management Domain
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.users.lists(), { ...filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,

    // Staff-specific queries
    staff: () => [...queryKeys.users.all, 'staff'] as const,
    staffWithPermissions: (filters: Record<string, unknown>) =>
      [...queryKeys.users.staff(), 'permissions', { ...filters }] as const,

    // User filtering
    byRole: (role: string) => [...queryKeys.users.lists(), { role }] as const,
    byStatus: (isVerified: boolean) =>
      [...queryKeys.users.lists(), { is_verified: isVerified }] as const,
    search: (query: string) => [...queryKeys.users.all, 'search', query] as const,
  },

  // Analytics Domain
  analytics: {
    all: ['analytics'] as const,
    userStats: () => [...queryKeys.analytics.all, 'users'] as const,
    businessStats: () => [...queryKeys.analytics.all, 'businesses'] as const,
    categoryStats: () => [...queryKeys.analytics.all, 'categories'] as const,
  },
};

export default queryKeys;
