import paystackConfig from '@/config/paystack';
import apiService from './api';

export interface PaymentVerificationResult {
  success: boolean;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending';
    gateway_response: string;
    paid_at?: string;
    created_at: string;
    channel: string;
    customer: {
      email: string;
      customer_code?: string;
    };
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
    metadata?: any;
  };
  message?: string;
  error?: string;
}

export interface TransactionRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  method: 'Credit Card' | 'MTN MoMo' | 'Telecel Cash';
  appointmentId?: string;
  userId: string;
  providerRef: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

class PaymentVerificationService {
  private baseUrl = paystackConfig.baseUrl;

  /**
   * Verify a payment transaction with Paystack
   */
  async verifyPaystackTransaction(reference: string): Promise<PaymentVerificationResult> {
    try {
      // In a real implementation, this would be done on the backend
      // to keep the secret key secure. For now, we'll simulate the verification
      console.log('Verifying Paystack transaction:', reference);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would make this call from your backend:
      // const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      //   headers: {
      //     'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      // For now, return a mock successful verification
      return {
        success: true,
        data: {
          reference,
          amount: 0, // This would come from Paystack
          currency: 'GHS',
          status: 'success',
          gateway_response: 'Successful',
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          channel: 'card',
          customer: {
            email: 'user@example.com',
          },
        },
      };
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Verify payment with backend and update local records
   */
  async verifyAndUpdatePayment(reference: string, appointmentId?: string): Promise<boolean> {
    try {
      // First verify with Paystack
      const verification = await this.verifyPaystackTransaction(reference);
      
      if (!verification.success || !verification.data) {
        throw new Error(verification.error || 'Payment verification failed');
      }

      // Update payment record in backend
      const updateResult = await this.updatePaymentRecord(reference, {
        status: verification.data.status,
        verifiedAt: new Date().toISOString(),
        paystackData: verification.data,
      });

      return updateResult;
    } catch (error) {
      console.error('Payment verification and update failed:', error);
      return false;
    }
  }

  /**
   * Update payment record in backend
   */
  private async updatePaymentRecord(reference: string, updates: any): Promise<boolean> {
    try {
      const response = await apiService.put(`/api/v0/payments/${reference}/verify`, updates);
      // Check if the request was successful (status 2xx)
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to update payment record:', error);
      return false;
    }
  }

  /**
   * Get payment status from backend
   */
  async getPaymentStatus(reference: string): Promise<TransactionRecord | null> {
    try {
      const response = await apiService.get(`/api/v0/payments/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return null;
    }
  }

  /**
   * Get user's payment history
   */
  async getUserPaymentHistory(userId: string, limit = 20, offset = 0): Promise<TransactionRecord[]> {
    try {
      const response = await apiService.get(`/api/v0/payments/user`, {
        params: { limit, offset },
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to get payment history:', error);
      return [];
    }
  }

  /**
   * Retry failed payment
   */
  async retryPayment(reference: string): Promise<PaymentVerificationResult> {
    try {
      const response = await apiService.post(`/api/v0/payments/${reference}/retry`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment retry failed',
      };
    }
  }

  /**
   * Cancel pending payment
   */
  async cancelPayment(reference: string): Promise<boolean> {
    try {
      const response = await apiService.post(`/api/v0/payments/${reference}/cancel`);
      // Check if the request was successful (status 2xx)
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      return false;
    }
  }

  /**
   * Check if payment reference is valid format
   */
  isValidReference(reference: string): boolean {
    // Check if reference matches expected format (e.g., MC_timestamp_random)
    const referencePattern = /^(MC|MM)_\d+(_\d+)?$/;
    return referencePattern.test(reference);
  }

  /**
   * Generate payment receipt data
   */
  generateReceiptData(transaction: TransactionRecord): any {
    return {
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      method: transaction.method,
      date: transaction.createdAt,
      appointmentId: transaction.appointmentId,
      metadata: transaction.metadata,
    };
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency = 'GHS'): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodDisplayName(method: string): string {
    const methodMap: Record<string, string> = {
      'Credit Card': 'Credit/Debit Card',
      'MTN MoMo': 'MTN Mobile Money',
      'Telecel Cash': 'Telecel Cash',
    };
    return methodMap[method] || method;
  }

  /**
   * Get payment status display info
   */
  getPaymentStatusInfo(status: string): { color: string; label: string; icon: string } {
    const statusMap: Record<string, { color: string; label: string; icon: string }> = {
      success: { color: '#10B981', label: 'Successful', icon: 'checkmark-circle' },
      pending: { color: '#F59E0B', label: 'Pending', icon: 'time' },
      failed: { color: '#EF4444', label: 'Failed', icon: 'close-circle' },
      cancelled: { color: '#6B7280', label: 'Cancelled', icon: 'ban' },
    };
    return statusMap[status] || { color: '#6B7280', label: 'Unknown', icon: 'help-circle' };
  }

  /**
   * Create a payment record in the backend
   */
  async createPaymentRecord(paymentData: {
    appointmentId: string;
    userId: string;
    amount: number;
    method: string;
    providerRef: string;
    metadata?: any;
  }): Promise<TransactionRecord | null> {
    try {
      const response = await apiService.post('/api/v0/payments', {
        appointmentId: paymentData.appointmentId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        method: paymentData.method,
        providerRef: paymentData.providerRef,
        // Note: status will default to 'pending' in backend, can be updated later
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create payment record:', error);
      return null;
    }
  }

  /**
   * Update payment status to completed after successful transaction
   */
  async updatePaymentStatus(paymentId: string, status: 'completed' | 'failed' | 'pending' | 'processing'): Promise<boolean> {
    try {
      const response = await apiService.put(`/api/v0/payments/${paymentId}`, {
        status,
        updatedAt: new Date().toISOString(),
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const paymentVerificationService = new PaymentVerificationService();
export default paymentVerificationService;
