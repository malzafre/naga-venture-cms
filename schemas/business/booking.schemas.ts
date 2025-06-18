// filepath: schemas/booking.schemas.ts
/**
 * Booking and Accommodation Schemas
 *
 * Comprehensive validation schemas for booking management, room types,
 * and payment processing based on the database structure.
 */

import { z } from 'zod';
import {
  AuditableEntitySchema,
  BaseFiltersSchema,
  BookingStatusSchema,
  NonNegativeIntegerSchema,
  OptionalTextAreaSchema,
  PaymentMethodSchema,
  PaymentStatusSchema,
  PositiveIntegerSchema,
  PriceSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// ROOM TYPE SCHEMAS
// ============================================================================

/**
 * Room type schema based on database structure
 */
export const RoomTypeSchema = AuditableEntitySchema.extend({
  business_id: UuidSchema,
  name: z.string().min(1, 'Room type name is required'),
  description: z.string().min(1, 'Room description is required'),
  capacity: PositiveIntegerSchema,
  price_per_night: PriceSchema,
  quantity: PositiveIntegerSchema.default(1),
  is_available: z.boolean().default(true),
});

export type RoomType = z.infer<typeof RoomTypeSchema>;

/**
 * Room type creation schema
 */
export const RoomTypeCreateSchema = RoomTypeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
});

export type RoomTypeCreate = z.infer<typeof RoomTypeCreateSchema>;

/**
 * Room type update schema
 */
export const RoomTypeUpdateSchema = RoomTypeCreateSchema.partial();

export type RoomTypeUpdate = z.infer<typeof RoomTypeUpdateSchema>;

// ============================================================================
// ROOM AMENITIES SCHEMAS
// ============================================================================

/**
 * Room amenities junction schema
 */
export const RoomAmenitySchema = z.object({
  id: UuidSchema,
  room_type_id: UuidSchema,
  amenity_id: UuidSchema,
  created_at: z.string().datetime(),
});

export type RoomAmenity = z.infer<typeof RoomAmenitySchema>;

// ============================================================================
// ROOM IMAGES SCHEMAS
// ============================================================================

/**
 * Room images schema
 */
export const RoomImageSchema = z.object({
  id: UuidSchema,
  room_type_id: UuidSchema,
  image_url: z.string().url('Invalid image URL'),
  caption: OptionalTextAreaSchema,
  is_primary: z.boolean().default(false),
  display_order: NonNegativeIntegerSchema.default(0),
  created_at: z.string().datetime(),
});

export type RoomImage = z.infer<typeof RoomImageSchema>;

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

/**
 * Booking schema based on database structure
 */
export const BookingSchema = AuditableEntitySchema.extend({
  booking_number: z.string().min(1, 'Booking number is required'),
  guest_id: UuidSchema,
  business_id: UuidSchema,
  room_type_id: UuidSchema.nullable().optional(),
  check_in_date: z.string().date('Invalid check-in date'),
  check_out_date: z.string().date('Invalid check-out date'),
  number_of_guests: PositiveIntegerSchema,
  special_requests: OptionalTextAreaSchema,
  total_amount: PriceSchema,
  status: BookingStatusSchema.default('pending'),
  payment_status: PaymentStatusSchema.default('pending'),
  payment_method: PaymentMethodSchema.nullable().optional(),
  payment_reference: z.string().nullable().optional(),
});

export type Booking = z.infer<typeof BookingSchema>;

/**
 * Booking creation schema
 */
export const BookingCreateSchema = z
  .object({
    guest_id: UuidSchema,
    business_id: UuidSchema,
    room_type_id: UuidSchema.optional(),
    check_in_date: z.string().date('Invalid check-in date'),
    check_out_date: z.string().date('Invalid check-out date'),
    number_of_guests: PositiveIntegerSchema,
    special_requests: OptionalTextAreaSchema,
    payment_method: PaymentMethodSchema.optional(),
  })
  .refine(
    (data) => new Date(data.check_out_date) > new Date(data.check_in_date),
    {
      message: 'Check-out date must be after check-in date',
      path: ['check_out_date'],
    }
  );

export type BookingCreate = z.infer<typeof BookingCreateSchema>;

/**
 * Booking update schema
 */
export const BookingUpdateSchema = z
  .object({
    check_in_date: z.string().date().optional(),
    check_out_date: z.string().date().optional(),
    number_of_guests: PositiveIntegerSchema.optional(),
    special_requests: OptionalTextAreaSchema,
    status: BookingStatusSchema.optional(),
    payment_status: PaymentStatusSchema.optional(),
    payment_method: PaymentMethodSchema.optional(),
    payment_reference: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.check_in_date && data.check_out_date) {
        return new Date(data.check_out_date) > new Date(data.check_in_date);
      }
      return true;
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['check_out_date'],
    }
  );

export type BookingUpdate = z.infer<typeof BookingUpdateSchema>;

// ============================================================================
// PAYMENT TRANSACTION SCHEMAS
// ============================================================================

/**
 * Payment transaction schema based on database structure
 */
export const PaymentTransactionSchema = AuditableEntitySchema.extend({
  booking_id: UuidSchema,
  amount: PriceSchema,
  payment_method: PaymentMethodSchema,
  transaction_id: z.string().nullable().optional(),
  payment_status: PaymentStatusSchema,
  payment_gateway: z.string().min(1, 'Payment gateway is required'),
  gateway_response: z.any().nullable().optional(), // JSONB field
});

export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;

/**
 * Payment transaction creation schema
 */
export const PaymentTransactionCreateSchema = PaymentTransactionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
});

export type PaymentTransactionCreate = z.infer<
  typeof PaymentTransactionCreateSchema
>;

// ============================================================================
// FILTERING AND QUERY SCHEMAS
// ============================================================================

/**
 * Booking filters schema
 */
export const BookingFiltersSchema = BaseFiltersSchema.extend({
  status: BookingStatusSchema.optional(),
  payment_status: PaymentStatusSchema.optional(),
  business_id: UuidSchema.optional(),
  guest_id: UuidSchema.optional(),
  check_in_date_from: z.string().date().optional(),
  check_in_date_to: z.string().date().optional(),
  check_out_date_from: z.string().date().optional(),
  check_out_date_to: z.string().date().optional(),
  sortBy: z
    .enum(['created_at', 'check_in_date', 'check_out_date', 'total_amount'])
    .default('created_at'),
});

export type BookingFilters = z.infer<typeof BookingFiltersSchema>;

/**
 * Room type filters schema
 */
export const RoomTypeFiltersSchema = BaseFiltersSchema.extend({
  business_id: UuidSchema.optional(),
  is_available: z.boolean().optional(),
  min_capacity: PositiveIntegerSchema.optional(),
  max_capacity: PositiveIntegerSchema.optional(),
  min_price: PriceSchema.optional(),
  max_price: PriceSchema.optional(),
  sortBy: z
    .enum(['created_at', 'name', 'price_per_night', 'capacity'])
    .default('created_at'),
});

export type RoomTypeFilters = z.infer<typeof RoomTypeFiltersSchema>;

// ============================================================================
// AVAILABILITY SCHEMAS
// ============================================================================

/**
 * Room availability check schema
 */
export const RoomAvailabilityCheckSchema = z
  .object({
    room_type_id: UuidSchema,
    check_in_date: z.string().date(),
    check_out_date: z.string().date(),
    number_of_guests: PositiveIntegerSchema,
  })
  .refine(
    (data) => new Date(data.check_out_date) > new Date(data.check_in_date),
    {
      message: 'Check-out date must be after check-in date',
      path: ['check_out_date'],
    }
  );

export type RoomAvailabilityCheck = z.infer<typeof RoomAvailabilityCheckSchema>;

/**
 * Room availability response schema
 */
export const RoomAvailabilityResponseSchema = z.object({
  room_type_id: UuidSchema,
  is_available: z.boolean(),
  available_quantity: NonNegativeIntegerSchema,
  total_quantity: PositiveIntegerSchema,
  conflicting_bookings: z.array(UuidSchema).optional(),
});

export type RoomAvailabilityResponse = z.infer<
  typeof RoomAvailabilityResponseSchema
>;

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

/**
 * Booking analytics schema
 */
export const BookingAnalyticsSchema = z.object({
  total_bookings: NonNegativeIntegerSchema,
  confirmed_bookings: NonNegativeIntegerSchema,
  cancelled_bookings: NonNegativeIntegerSchema,
  completed_bookings: NonNegativeIntegerSchema,
  total_revenue: PriceSchema,
  average_booking_value: PriceSchema,
  occupancy_rate: z.number().min(0).max(100),
  popular_room_types: z.array(
    z.object({
      room_type_id: UuidSchema,
      room_type_name: z.string(),
      booking_count: NonNegativeIntegerSchema,
    })
  ),
});

export type BookingAnalytics = z.infer<typeof BookingAnalyticsSchema>;

/**
 * Bulk booking operation schema
 */
export const BulkBookingOperationSchema = z.object({
  booking_ids: z
    .array(UuidSchema)
    .min(1, 'At least one booking ID is required'),
  operation: z.enum(['confirm', 'cancel', 'complete', 'mark_no_show']),
  reason: z.string().optional(),
});

export type BulkBookingOperation = z.infer<typeof BulkBookingOperationSchema>;
