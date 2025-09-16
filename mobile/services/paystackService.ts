import AsyncStorage from '@react-native-async-storage/async-storage';
import Paystack from 'react-native-paystack-webview';

// Define our own PaystackProps interface based on the library's expected props
interface PaystackProps {
  paystackKey: string;
  email: string;
  amount: number;
  reference: string;
  metadata?: any;
  onCancel: () => void;
  onSuccess: (result: any) => Promise<void> | void;
  onError: (error: any) => void;
}

export interface PaymentData {
  email: string;
  amount: number; // Amount in minor currency units (pesewas for GHS)
  reference: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: any;
  };
}

export interface PaymentResult {
  reference: string;
  status: 'success' | 'cancelled' | 'failed';
  message?: string;
  transaction?: any;
}

export interface PaymentCallbacks {
  onSuccess: (result: any) => Promise<void> | void;
  onCancel: () => void;
  onError: (error: any) => void;
}

class PaystackService {
  private publicKey: string;
  
  constructor() {
    // Use test key for development, production key should be set via environment variables
    this.publicKey = __DEV__ 
      ? 'pk_test_your_test_public_key_here' 
      : 'pk_live_your_live_public_key_here';
  }

  /**
   * Set the Paystack public key
   */
  setPublicKey(key: string) {
    this.publicKey = key;
  }

  /**
   * Get the current public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Generate a unique payment reference
   */
  generateReference(prefix: string = 'MC'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Convert amount to minor currency units (pesewas for GHS)
   */
  toMinorCurrency(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from minor currency units to major units
   */
  fromMinorCurrency(amount: number): number {
    return amount / 100;
  }

  /**
   * Get user email from AsyncStorage
   */
  async getUserEmail(): Promise<string | null> {
    try {
      const raw = await AsyncStorage.getItem('authUser');
      const user = raw ? JSON.parse(raw) : null;
      return user?.email || null;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  /**
   * Get user ID from AsyncStorage
   */
  async getUserId(): Promise<string | null> {
    try {
      const raw = await AsyncStorage.getItem('authUser');
      const user = raw ? JSON.parse(raw) : null;
      return user?.userId || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Prepare payment data for Paystack
   */
  async preparePaymentData(
    amount: number,
    metadata?: PaymentData['metadata'],
    reference?: string
  ): Promise<PaymentData | null> {
    const email = await this.getUserEmail();
    if (!email) {
      throw new Error('User email not found. Please ensure you are logged in.');
    }

    return {
      email,
      amount: this.toMinorCurrency(amount),
      reference: reference || this.generateReference(),
      metadata,
    };
  }

  /**
   * Create Paystack configuration for react-native-paystack-webview
   */
  createPaystackConfig(
    paymentData: PaymentData,
    callbacks: PaymentCallbacks
  ): PaystackProps {
    return {
      paystackKey: this.publicKey,
      email: paymentData.email,
      amount: paymentData.amount,
      reference: paymentData.reference,
      metadata: paymentData.metadata,
      onCancel: callbacks.onCancel,
      onSuccess: callbacks.onSuccess,
      onError: callbacks.onError,
    };
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount);
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create metadata for appointment payments
   */
  createAppointmentMetadata(
    doctorId: string,
    appointmentDate: string,
    appointmentType: string,
    additionalData?: Record<string, any>
  ): PaymentData['metadata'] {
    return {
      custom_fields: [
        {
          display_name: 'Doctor ID',
          variable_name: 'doctor_id',
          value: doctorId,
        },
        {
          display_name: 'Appointment Date',
          variable_name: 'appointment_date',
          value: appointmentDate,
        },
        {
          display_name: 'Appointment Type',
          variable_name: 'appointment_type',
          value: appointmentType,
        },
      ],
      payment_type: 'appointment',
      ...additionalData,
    };
  }

  /**
   * Extract transaction reference from Paystack response
   */
  extractTransactionReference(response: any): string {
    return (
      response?.reference ||
      response?.transactionRef?.reference ||
      response?.transactionRef?.trxref ||
      response?.transactionRef?.transaction ||
      response?.trxref ||
      response?.transaction ||
      ''
    );
  }

  /**
   * Format error message for user display
   */
  formatErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    return (
      error?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      'Payment processing failed. Please try again.'
    );
  }

  /**
   * Log payment attempt for debugging
   */
  logPaymentAttempt(paymentData: PaymentData, type: string = 'appointment') {
    if (__DEV__) {
      console.log('Paystack Payment Attempt:', {
        type,
        reference: paymentData.reference,
        amount: this.fromMinorCurrency(paymentData.amount),
        email: paymentData.email,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Log payment result for debugging
   */
  logPaymentResult(result: PaymentResult) {
    if (__DEV__) {
      console.log('Paystack Payment Result:', {
        ...result,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export singleton instance
export const paystackService = new PaystackService();
export default paystackService;
