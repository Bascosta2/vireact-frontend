/**
 * Authentication utility functions
 */

// Provider display names mapping
const PROVIDER_DISPLAY_NAMES = {
  google: 'Google',
  local: 'email/password',
  email: 'email/password'
} as const;

/**
 * Get user-friendly display name for authentication provider
 * @param provider - The provider string from backend
 * @returns User-friendly provider name
 */
export const getProviderDisplayName = (provider: string): string => {
  const normalizedProvider = provider.toLowerCase();
  return PROVIDER_DISPLAY_NAMES[normalizedProvider as keyof typeof PROVIDER_DISPLAY_NAMES] || provider;
};

/**
 * Check if an error message indicates a provider conflict
 * @param errorMessage - The error message to check
 * @returns True if the error is a provider conflict
 */
export const isProviderConflictError = (errorMessage: string): boolean => {
  return errorMessage.includes('already registered via') || 
         errorMessage.includes('already signed up with');
};

/**
 * Extract provider name from provider conflict error message
 * @param errorMessage - The error message containing provider info
 * @returns The provider name if found, null otherwise
 */
export const extractProviderFromError = (errorMessage: string): string | null => {
  const match = errorMessage.match(/already registered via (\w+)/i);
  return match ? match[1] : null;
};

/**
 * Format a user-friendly provider conflict message
 * @param existingProvider - The provider the account was created with
 * @param attemptedProvider - The provider the user tried to use
 * @returns Formatted error message
 */
export const formatProviderConflictMessage = (
  existingProvider: string, 
  attemptedProvider: string
): string => {
  const existingDisplayName = getProviderDisplayName(existingProvider);
  return `This email is already registered via ${existingDisplayName}. Please log in with ${existingDisplayName} instead.`;
};
