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
    images: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'images'] as const,
    categories: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'categories'] as const,
    reviews: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'reviews'] as const,
    amenities: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'amenities'] as const,
    hours: (businessId: string) =>
      [...queryKeys.businesses.detail(businessId), 'hours'] as const,

    // Business filtering and search
    byStatus: (status: string) =>
      [...queryKeys.businesses.lists(), { status }] as const,
    byType: (type: string) =>
      [...queryKeys.businesses.lists(), { business_type: type }] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.businesses.lists(), { category: categoryId }] as const,
    byOwner: (ownerId: string) =>
      [...queryKeys.businesses.lists(), { owner: ownerId }] as const,
    search: (query: string) =>
      [...queryKeys.businesses.all, 'search', query] as const,
    featured: () =>
      [...queryKeys.businesses.lists(), { featured: true }] as const,
    pending: () =>
      [...queryKeys.businesses.lists(), { status: 'pending' }] as const,

    // Analytics and statistics
    analytics: () => [...queryKeys.businesses.all, 'analytics'] as const,
    stats: (timeframe?: string) =>
      [
        ...queryKeys.businesses.analytics(),
        'stats',
        timeframe || 'all',
      ] as const,
  },

  // User Management Domain
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.users.lists(), { ...filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,

    // User relationships
    profile: (userId: string) =>
      [...queryKeys.users.detail(userId), 'profile'] as const,
    businesses: (userId: string) =>
      [...queryKeys.users.detail(userId), 'businesses'] as const,
    permissions: (userId: string) =>
      [...queryKeys.users.detail(userId), 'permissions'] as const,

    // User filtering
    byRole: (role: string) => [...queryKeys.users.lists(), { role }] as const,
    staff: () => [...queryKeys.users.lists(), { type: 'staff' }] as const,
    tourists: () => [...queryKeys.users.lists(), { type: 'tourists' }] as const,
    businessOwners: () =>
      [...queryKeys.users.lists(), { type: 'business_owners' }] as const,
  },

  // Category Management Domain
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,

    // Category hierarchy
    main: () => [...queryKeys.categories.lists(), { type: 'main' }] as const,
    sub: (mainCategoryId?: string) =>
      mainCategoryId
        ? ([
            ...queryKeys.categories.lists(),
            { type: 'sub', parent: mainCategoryId },
          ] as const)
        : ([...queryKeys.categories.lists(), { type: 'sub' }] as const),

    // Category relationships
    businesses: (categoryId: string) =>
      [...queryKeys.categories.detail(categoryId), 'businesses'] as const,
    touristSpots: (categoryId: string) =>
      [...queryKeys.categories.detail(categoryId), 'tourist-spots'] as const,
    events: (categoryId: string) =>
      [...queryKeys.categories.detail(categoryId), 'events'] as const,
  },

  // Tourist Spots Domain
  touristSpots: {
    all: ['tourist-spots'] as const,
    lists: () => [...queryKeys.touristSpots.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.touristSpots.lists(), { ...filters }] as const,
    details: () => [...queryKeys.touristSpots.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.touristSpots.details(), id] as const,

    // Tourist spot relationships
    images: (spotId: string) =>
      [...queryKeys.touristSpots.detail(spotId), 'images'] as const,
    reviews: (spotId: string) =>
      [...queryKeys.touristSpots.detail(spotId), 'reviews'] as const,
    events: (spotId: string) =>
      [...queryKeys.touristSpots.detail(spotId), 'events'] as const,

    // Tourist spot filtering
    byType: (type: string) =>
      [...queryKeys.touristSpots.lists(), { spot_type: type }] as const,
    byStatus: (status: string) =>
      [...queryKeys.touristSpots.lists(), { status }] as const,
    featured: () =>
      [...queryKeys.touristSpots.lists(), { featured: true }] as const,
    nearby: (lat: number, lng: number, radius: number) =>
      [
        ...queryKeys.touristSpots.lists(),
        { location: { lat, lng, radius } },
      ] as const,

    // Tourist spot analytics
    analytics: () => [...queryKeys.touristSpots.all, 'analytics'] as const,
    dashboard: () => [...queryKeys.touristSpots.all, 'dashboard'] as const,
    filtered: (filters: Record<string, unknown>) =>
      [...queryKeys.touristSpots.lists(), { ...filters }] as const,
  },

  // Events Domain
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.events.lists(), { ...filters }] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,

    // Event relationships
    images: (eventId: string) =>
      [...queryKeys.events.detail(eventId), 'images'] as const,
    reviews: (eventId: string) =>
      [...queryKeys.events.detail(eventId), 'reviews'] as const,

    // Event filtering
    byStatus: (status: string) =>
      [...queryKeys.events.lists(), { status }] as const,
    byDateRange: (startDate: string, endDate: string) =>
      [
        ...queryKeys.events.lists(),
        { dateRange: { startDate, endDate } },
      ] as const,
    upcoming: () =>
      [...queryKeys.events.lists(), { status: 'upcoming' }] as const,
    ongoing: () =>
      [...queryKeys.events.lists(), { status: 'ongoing' }] as const,
    featured: () => [...queryKeys.events.lists(), { featured: true }] as const,

    // Event analytics
    analytics: () => [...queryKeys.events.all, 'analytics'] as const,
    dashboard: () => [...queryKeys.events.all, 'dashboard'] as const,
    calendar: (filters: Record<string, unknown>) =>
      [...queryKeys.events.lists(), 'calendar', { ...filters }] as const,
    filtered: (filters: Record<string, unknown>) =>
      [...queryKeys.events.lists(), { ...filters }] as const,
  },

  // Bookings Domain
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.bookings.lists(), { ...filters }] as const,
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,

    // Booking relationships
    payments: (bookingId: string) =>
      [...queryKeys.bookings.detail(bookingId), 'payments'] as const,

    // Booking filtering
    byGuest: (guestId: string) =>
      [...queryKeys.bookings.lists(), { guest: guestId }] as const,
    byBusiness: (businessId: string) =>
      [...queryKeys.bookings.lists(), { business: businessId }] as const,
    byStatus: (status: string) =>
      [...queryKeys.bookings.lists(), { status }] as const,
    byDateRange: (startDate: string, endDate: string) =>
      [
        ...queryKeys.bookings.lists(),
        { dateRange: { startDate, endDate } },
      ] as const,
  },

  // Reviews Domain
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.reviews.lists(), { ...filters }] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,

    // Review relationships
    responses: (reviewId: string) =>
      [...queryKeys.reviews.detail(reviewId), 'responses'] as const,
    images: (reviewId: string) =>
      [...queryKeys.reviews.detail(reviewId), 'images'] as const,

    // Review filtering
    byType: (type: 'business' | 'tourist_spot' | 'event') =>
      [...queryKeys.reviews.lists(), { review_type: type }] as const,
    byTarget: (type: string, targetId: string) =>
      [
        ...queryKeys.reviews.lists(),
        { target: { type, id: targetId } },
      ] as const,
    byReviewer: (reviewerId: string) =>
      [...queryKeys.reviews.lists(), { reviewer: reviewerId }] as const,
    pending: () =>
      [...queryKeys.reviews.lists(), { status: 'pending' }] as const,
  },

  // Promotions Domain
  promotions: {
    all: ['promotions'] as const,
    lists: () => [...queryKeys.promotions.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.promotions.lists(), { ...filters }] as const,
    details: () => [...queryKeys.promotions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.promotions.details(), id] as const,

    // Promotion relationships
    images: (promotionId: string) =>
      [...queryKeys.promotions.detail(promotionId), 'images'] as const,

    // Promotion filtering
    byBusiness: (businessId: string) =>
      [...queryKeys.promotions.lists(), { business: businessId }] as const,
    byStatus: (status: string) =>
      [...queryKeys.promotions.lists(), { status }] as const,
    active: () =>
      [...queryKeys.promotions.lists(), { status: 'active' }] as const,
    platform: () =>
      [...queryKeys.promotions.lists(), { scope: 'platform' }] as const,
  },

  // Analytics Domain
  analytics: {
    all: ['analytics'] as const,

    // Business analytics
    businessStats: (timeframe?: string) =>
      [
        ...queryKeys.analytics.all,
        'business-stats',
        timeframe || 'all',
      ] as const,
    businessMetrics: (businessId: string, timeframe?: string) =>
      [
        ...queryKeys.analytics.all,
        'business-metrics',
        businessId,
        timeframe || 'all',
      ] as const,

    // User analytics
    userStats: (timeframe?: string) =>
      [...queryKeys.analytics.all, 'user-stats', timeframe || 'all'] as const,
    userActivity: (userId: string, timeframe?: string) =>
      [
        ...queryKeys.analytics.all,
        'user-activity',
        userId,
        timeframe || 'all',
      ] as const,

    // Platform analytics
    platformStats: (timeframe?: string) =>
      [
        ...queryKeys.analytics.all,
        'platform-stats',
        timeframe || 'all',
      ] as const,
    pageViews: (filters: Record<string, unknown>) =>
      [...queryKeys.analytics.all, 'page-views', { ...filters }] as const,

    // Revenue analytics
    revenue: (timeframe?: string) =>
      [...queryKeys.analytics.all, 'revenue', timeframe || 'all'] as const,
    bookingMetrics: (timeframe?: string) =>
      [
        ...queryKeys.analytics.all,
        'booking-metrics',
        timeframe || 'all',
      ] as const,
  },

  // Content Approval Domain - Phase 4
  contentApproval: {
    all: ['content-approval'] as const,
    queues: () => [...queryKeys.contentApproval.all, 'queue'] as const,
    queue: (filters: Record<string, unknown>) =>
      [...queryKeys.contentApproval.queues(), { ...filters }] as const,
    details: () => [...queryKeys.contentApproval.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.contentApproval.details(), id] as const,

    // Approval workflow
    pending: () =>
      [...queryKeys.contentApproval.queues(), { status: 'pending' }] as const,
    approved: () =>
      [...queryKeys.contentApproval.queues(), { status: 'approved' }] as const,
    rejected: () =>
      [...queryKeys.contentApproval.queues(), { status: 'rejected' }] as const,

    // Content type filtering
    byType: (
      contentType: 'business_profile' | 'tourist_spot' | 'event' | 'promotion'
    ) =>
      [
        ...queryKeys.contentApproval.queues(),
        { content_type: contentType },
      ] as const,
    bySubmitter: (submitterId: string) =>
      [
        ...queryKeys.contentApproval.queues(),
        { submitter: submitterId },
      ] as const,
    byReviewer: (reviewerId: string) =>
      [
        ...queryKeys.contentApproval.queues(),
        { reviewer: reviewerId },
      ] as const,

    // Content comparison and history
    comparison: (contentId: string) =>
      [...queryKeys.contentApproval.detail(contentId), 'comparison'] as const,
    history: () => [...queryKeys.contentApproval.all, 'history'] as const,
    changeHistory: (contentId: string) =>
      [...queryKeys.contentApproval.detail(contentId), 'history'] as const,

    // Analytics and metrics
    analytics: () => [...queryKeys.contentApproval.all, 'analytics'] as const,
    staffMetrics: (staffId: string, timeframe?: string) =>
      [
        ...queryKeys.contentApproval.analytics(),
        'staff',
        staffId,
        timeframe || 'month',
      ] as const,
    approvalStats: (timeframe?: string) =>
      [
        ...queryKeys.contentApproval.analytics(),
        'stats',
        timeframe || 'week',
      ] as const,
  },

  // Review Moderation Domain - Phase 4
  reviewModeration: {
    all: ['review-moderation'] as const,
    queues: () => [...queryKeys.reviewModeration.all, 'queue'] as const,
    queue: (filters: Record<string, unknown>) =>
      [...queryKeys.reviewModeration.queues(), { ...filters }] as const,

    // Moderation filtering
    flagged: () =>
      [...queryKeys.reviewModeration.queues(), { status: 'flagged' }] as const,
    pendingApproval: () =>
      [...queryKeys.reviewModeration.queues(), { status: 'pending' }] as const,
    autoModerated: () =>
      [
        ...queryKeys.reviewModeration.queues(),
        { auto_moderated: true },
      ] as const,

    // Content analysis
    sentiment: (reviewId: string) =>
      [...queryKeys.reviewModeration.all, 'sentiment', reviewId] as const,
    toxicity: (reviewId: string) =>
      [...queryKeys.reviewModeration.all, 'toxicity', reviewId] as const,

    // Response management
    responses: () => [...queryKeys.reviewModeration.all, 'responses'] as const,
    pendingResponses: () =>
      [
        ...queryKeys.reviewModeration.responses(),
        { status: 'pending' },
      ] as const,

    // Analytics
    analytics: () => [...queryKeys.reviewModeration.all, 'analytics'] as const,
    moderationStats: (timeframe?: string) =>
      [
        ...queryKeys.reviewModeration.analytics(),
        'stats',
        timeframe || 'week',
      ] as const,
  },

  // System Domain
  system: {
    all: ['system'] as const,

    // Configuration
    config: () => [...queryKeys.system.all, 'config'] as const,
    features: () => [...queryKeys.system.all, 'features'] as const,
    settings: () => [...queryKeys.system.all, 'settings'] as const,

    // Health and monitoring
    health: () => [...queryKeys.system.all, 'health'] as const,
    logs: (filters: Record<string, unknown>) =>
      [...queryKeys.system.all, 'logs', { ...filters }] as const,

    // Integrations
    integrations: () => [...queryKeys.system.all, 'integrations'] as const,
    apis: () => [...queryKeys.system.all, 'apis'] as const,
  },

  // Legacy compatibility (will be phased out)
  shops: {
    all: ['shops'] as const,
    lists: () => [...queryKeys.shops.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.shops.lists(), { ...filters }] as const,
    details: () => [...queryKeys.shops.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.shops.details(), id] as const,

    // Legacy shop queries
    featured: () => [...queryKeys.shops.all, 'featured'] as const,
    recommended: () => [...queryKeys.shops.all, 'recommended'] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.shops.lists(), { category: categoryId }] as const,
    bySubcategory: (subcategoryId: string) =>
      [...queryKeys.shops.lists(), { subcategory: subcategoryId }] as const,
    byIds: (ids: string[]) =>
      [...queryKeys.shops.lists(), { ids: ids.sort().join(',') }] as const,
    search: (query: string) =>
      [...queryKeys.shops.all, 'search', query] as const,
  },

  // Legacy special offers (migrate to promotions)
  specialOffers: {
    all: ['specialOffers'] as const,
    lists: () => [...queryKeys.specialOffers.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.specialOffers.lists(), { ...filters }] as const,
    details: () => [...queryKeys.specialOffers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.specialOffers.details(), id] as const,

    active: () =>
      [...queryKeys.specialOffers.lists(), { active: true }] as const,
    byCategory: (category: string) =>
      [...queryKeys.specialOffers.lists(), { category }] as const,
  },

  // Legacy auth (migrate to users)
  auth: {
    all: ['auth'] as const,
    profile: (userId: string) =>
      [...queryKeys.auth.all, 'profile', userId] as const,
    profiles: () => [...queryKeys.auth.all, 'profiles'] as const,
    profilesByRole: (role: string) =>
      [...queryKeys.auth.profiles(), { role }] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    permissions: (userId: string) =>
      [...queryKeys.auth.all, 'permissions', userId] as const,
  },
} as const;

export default queryKeys;

// Export individual query key factories for convenience
export const businessKeys = queryKeys.businesses;
export const userKeys = queryKeys.users;
export const categoryKeys = queryKeys.categories;
export const touristSpotKeys = queryKeys.touristSpots;
export const eventKeys = queryKeys.events;
export const bookingKeys = queryKeys.bookings;
export const reviewKeys = queryKeys.reviews;
export const promotionKeys = queryKeys.promotions;
export const analyticsKeys = queryKeys.analytics;
export const contentApprovalKeys = queryKeys.contentApproval;
export const reviewModerationKeys = queryKeys.reviewModeration;
export const systemKeys = queryKeys.system;
export const shopKeys = queryKeys.shops;
export const specialOfferKeys = queryKeys.specialOffers;
export const authKeys = queryKeys.auth;

// Utility types for better TypeScript support
export type ShopQueryKey =
  | typeof queryKeys.shops.all
  | ReturnType<typeof queryKeys.shops.lists>
  | ReturnType<typeof queryKeys.shops.list>
  | ReturnType<typeof queryKeys.shops.details>
  | ReturnType<typeof queryKeys.shops.detail>
  | ReturnType<typeof queryKeys.shops.featured>
  | ReturnType<typeof queryKeys.shops.recommended>
  | ReturnType<typeof queryKeys.shops.byCategory>
  | ReturnType<typeof queryKeys.shops.bySubcategory>
  | ReturnType<typeof queryKeys.shops.byIds>
  | ReturnType<typeof queryKeys.shops.search>;

export type CategoryQueryKey =
  | typeof queryKeys.categories.all
  | ReturnType<typeof queryKeys.categories.lists>
  | ReturnType<typeof queryKeys.categories.details>
  | ReturnType<typeof queryKeys.categories.detail>;

export type SpecialOfferQueryKey =
  | typeof queryKeys.specialOffers.all
  | ReturnType<typeof queryKeys.specialOffers.lists>
  | ReturnType<typeof queryKeys.specialOffers.list>
  | ReturnType<typeof queryKeys.specialOffers.details>
  | ReturnType<typeof queryKeys.specialOffers.detail>
  | ReturnType<typeof queryKeys.specialOffers.active>
  | ReturnType<typeof queryKeys.specialOffers.byCategory>;

export type AuthQueryKey =
  | typeof queryKeys.auth.all
  | ReturnType<typeof queryKeys.auth.profile>
  | ReturnType<typeof queryKeys.auth.profiles>
  | ReturnType<typeof queryKeys.auth.profilesByRole>
  | ReturnType<typeof queryKeys.auth.session>
  | ReturnType<typeof queryKeys.auth.permissions>;
