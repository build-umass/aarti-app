/**
 * Centralized brand colors and theme constants for the Aarti app.
 * All color values should be referenced from here to maintain consistency.
 */

export const BrandColors = {
  // Primary brand colors
  primary: '#5f2446',        // Deep purple - used for headers, primary actions
  primaryLight: '#f0e6ed',   // Light purple background

  // Secondary colors
  pink: '#EE628C',           // Pink from logo

  // UI colors
  blue: '#2270CA',           // Info/resources color
  blueLight: '#e8f4f8',      // Light blue background

  green: '#22c55e',          // Success/chat color
  greenLight: '#e8f5e9',     // Light green background

  orange: '#f59e0b',         // Warning/profile color
  orangeLight: '#fff4e6',    // Light orange background

  // Neutral colors
  gray: '#687076',           // Secondary text
  grayLight: '#f8f8f8',      // Card backgrounds
  grayMedium: '#e5e5ea',     // Borders, dividers
  grayDark: '#11181C',       // Primary text

  // Status colors
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',

  // Background colors
  white: '#fff',
  background: '#f9fafb',
};

/**
 * Progress bar color - used throughout the app for consistency
 */
export const ProgressBarColor = BrandColors.primary;
