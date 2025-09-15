import Constants from 'expo-constants';
import { PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY } from './env';

export interface PaystackConfig {
  publicKey: string;
  secretKey?: string; // Only for server-side operations
  baseUrl: string;
  currency: string;
  environment: 'test' | 'live';
}

// Paystack configuration
const paystackConfig: PaystackConfig = {
  // Use environment variables or fallback to test keys
  publicKey: Constants.expoConfig?.extra?.paystackPublicKey || 
            PAYSTACK_PUBLIC_KEY ||
            'pk_test_your_test_public_key_here',
  baseUrl: 'https://api.paystack.co',
  currency: 'GHS', // Ghana Cedis
  environment: __DEV__ ? 'test' : 'live',
};

// Validation
if (!paystackConfig.publicKey || paystackConfig.publicKey.includes('your_test_public_key_here')) {
  console.warn('⚠️ Paystack public key not configured properly. Please set EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY in your environment variables.');
}

export default paystackConfig;

// Helper functions
export const getPaystackPublicKey = (): string => {
  return paystackConfig.publicKey;
};

export const isTestEnvironment = (): boolean => {
  return paystackConfig.environment === 'test' || __DEV__;
};

export const getPaystackCurrency = (): string => {
  return paystackConfig.currency;
};

// Paystack supported currencies for Ghana
export const SUPPORTED_CURRENCIES = {
  GHS: 'GHS', // Ghana Cedis
  USD: 'USD', // US Dollars
  EUR: 'EUR', // Euros
  GBP: 'GBP', // British Pounds
} as const;

// Minimum amounts per currency (in major units)
export const MINIMUM_AMOUNTS = {
  GHS: 1.00,
  USD: 0.50,
  EUR: 0.50,
  GBP: 0.30,
} as const;
