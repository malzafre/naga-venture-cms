/**
 * @fileoverview This file contains the central color palette for the NAGA VENTURE Tourism CMS.
 * It follows the single source of truth principle, ensuring consistent branding and theming across the application.
 * Colors are organized by their functional purpose (brand, text, background, UI, semantic).
 */

export const Colors = {
  // Primary Brand Colors
  primary: '#0A1B47', // Brand Headings, Navigation Backgrounds
  accent: '#2E5AA7', // Primary Buttons, Links, Interactive Elements
  active: '#1F4C85', // Selected Navigation Items
  complementary: '#D67F35', // Alert Banners, Highlights

  // Text Colors
  text: '#0A1B47', // Primary text using brand color
  textSecondary: '#6C757D', // Neutral 500 - Secondary Text, Labels
  textMuted: '#6C757D', // Same as secondary for consistency

  // Background Colors
  background: '#FFFFFF', // Main Content Background
  backgroundSecondary: '#F8F9FA', // Neutral 100 - Subtle Backgrounds
  backgroundCard: '#F8F8F8', // Card Background - Content Containers

  // UI Colors
  border: '#E9ECEF', // Neutral 200 - Borders, Input Fields
  borderLight: '#F8F9FA', // Neutral 100 - Subtle dividers

  // Interactive States
  hover: '#1A3F7A', // Primary Button Hover State
  primaryLight: '#E3F2FD', // Light variant for selected states

  // Semantic Colors
  success: '#2E7D32', // Success Messages, Valid States
  warning: '#E58A3B', // Warnings, Non-Critical Alerts
  error: '#C62828', // Destructive - Error Messages, Critical Alerts
  info: '#2E5AA7', // Using accent color for info

  // Secondary Interactive
  secondaryButton: '#E3E6EB', // Secondary Button Background
  secondaryButtonHover: '#D1D5DB', // Secondary Button Hover
  disabled: 'rgba(151, 151, 151, 0.5)', // Disabled State

  // Neutral Variations
  neutral100: '#F8F9FA',
  neutral200: '#E9ECEF',
  neutral300: '#DEE2E6',
  neutral500: '#6C757D',

  // Icon colors
  icon: '#6C757D', // Default icon color
  iconActive: '#0A1B47', // Active icon color
};
