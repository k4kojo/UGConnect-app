# Paystack Integration Documentation

## Overview

This document provides comprehensive information about the Paystack payment integration in the MediConnect mobile application. The integration supports credit/debit card payments and mobile money payments for appointment bookings.

## Architecture

### Core Components

1. **PaystackService** (`services/paystackService.ts`)
   - Main service for payment processing
   - Handles payment data preparation and validation
   - Manages payment references and metadata

2. **PaymentVerificationService** (`services/paymentVerificationService.ts`)
   - Handles payment verification with Paystack
   - Manages transaction records and status updates
   - Provides payment history functionality

3. **PaymentModal** (`components/payment/PaymentModal.tsx`)
   - Reusable payment component
   - Supports multiple payment methods
   - Handles payment flow and user feedback

4. **Configuration** (`config/paystack.ts`)
   - Centralized Paystack configuration
   - Environment-specific settings
   - Currency and validation rules

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and set your Paystack public key:

```bash
# Expo public env vars (auto-exposed to the app bundle)
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- Use test keys for development (`pk_test_...`)
- Use live keys for production (`pk_live_...`)
- Never commit actual keys to version control

### 2. Dependencies

The following packages are already installed:

```json
{
  "react-native-paystack-webview": "^5.0.1",
  "react-native-webview": "13.13.5"
}
```

### 3. Provider Setup

The PaystackProvider is already configured in `app/_layout.tsx`:

```tsx
<PaystackProvider publicKey={PAYSTACK_PUBLIC_KEY} currency="GHS">
  {/* App content */}
</PaystackProvider>
```

## Usage Examples

### Basic Payment Processing

```tsx
import paystackService from '@/services/paystackService';
import { usePaystack } from 'react-native-paystack-webview';

const MyComponent = () => {
  const { popup } = usePaystack();

  const handlePayment = async () => {
    try {
      const paymentData = await paystackService.preparePaymentData(
        100.00, // Amount in GHS
        { custom_field: 'value' } // Optional metadata
      );

      popup.checkout({
        paystackKey: paystackService.getPublicKey(),
        email: paymentData.email,
        amount: paymentData.amount,
        reference: paymentData.reference,
        metadata: paymentData.metadata,
        onSuccess: (result) => {
          console.log('Payment successful:', result);
        },
        onCancel: () => {
          console.log('Payment cancelled');
        },
        onError: (error) => {
          console.error('Payment failed:', error);
        },
      });
    } catch (error) {
      console.error('Payment setup failed:', error);
    }
  };
};
```

### Using PaymentModal Component

```tsx
import PaymentModal from '@/components/payment/PaymentModal';

const MyScreen = () => {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <PaymentModal
      visible={showPayment}
      onClose={() => setShowPayment(false)}
      amount={150.00}
      title="Appointment Payment"
      description="Payment for consultation with Dr. John Doe"
      onSuccess={async (result) => {
        // Handle successful payment
        console.log('Payment completed:', result);
      }}
      onError={(error) => {
        // Handle payment error
        console.error('Payment failed:', error);
      }}
    />
  );
};
```

## Payment Flow

### 1. Appointment Booking Payment

The main payment flow is integrated into the appointment booking process:

1. **Doctor Selection** (`app/appointment/schedule.tsx`)
   - User selects doctor and sees consultation fee

2. **Time Selection** (`app/appointment/select-time.tsx`)
   - User selects appointment date/time and type

3. **Payment Confirmation** (`app/appointment/confirm.tsx`)
   - User reviews appointment details and payment summary
   - Selects payment method (Credit Card, MTN MoMo, Telecel Cash)
   - Completes payment through Paystack

4. **Success/Failure Handling**
   - Successful payments create appointment and payment records
   - Failed payments show error messages with retry options

### 2. Payment Methods Supported

- **Credit/Debit Cards**: Processed through Paystack popup
- **MTN Mobile Money**: Integrated with Paystack's mobile money API
- **Telecel Cash**: Integrated with Paystack's mobile money API

### 3. Payment Verification

All payments go through verification:

```tsx
import paymentVerificationService from '@/services/paymentVerificationService';

// Verify payment with Paystack
const verification = await paymentVerificationService.verifyPaystackTransaction(reference);

// Update local payment record
const updated = await paymentVerificationService.verifyAndUpdatePayment(reference, appointmentId);
```

## Security Considerations

### 1. API Keys
- **Public Key**: Safe to expose in client-side code
- **Secret Key**: NEVER expose in client-side code (backend only)
- Use environment variables for key management

### 2. Payment Verification
- Always verify payments on the backend
- Never trust client-side payment confirmations alone
- Implement webhook handlers for real-time verification

### 3. Data Validation
- Validate all payment amounts and user data
- Sanitize metadata before sending to Paystack
- Implement proper error handling

## Error Handling

### Common Error Scenarios

1. **Network Issues**
   - Retry mechanisms for failed requests
   - Offline payment queuing (future enhancement)

2. **Invalid Payment Data**
   - Amount validation (minimum amounts, currency)
   - Email format validation
   - Reference format validation

3. **Payment Failures**
   - Clear error messages for users
   - Retry options for failed payments
   - Support contact information

### Error Message Examples

```tsx
// Service provides formatted error messages
const errorMessage = paystackService.formatErrorMessage(error);
Alert.alert('Payment Failed', errorMessage);
```

## Payment History & Tracking

### Transaction Records

All payments are tracked with the following information:

```typescript
interface TransactionRecord {
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
```

### Payment History Screen

Users can view their payment history at `app/profile/payment-history.tsx`:

- Filter by payment status
- View transaction details
- Retry failed payments
- Share payment receipts

## Testing

### Test Environment Setup

1. Use Paystack test public key: `pk_test_...`
2. Use test card numbers provided by Paystack
3. Test different payment scenarios (success, failure, cancellation)

### Test Card Numbers

Paystack provides test card numbers for different scenarios:

- **Successful Payment**: 4084084084084081
- **Insufficient Funds**: 4000000000000002
- **Invalid CVV**: Use any card with CVV 200

### Testing Checklist

- [ ] Successful card payment
- [ ] Failed card payment
- [ ] Payment cancellation
- [ ] Mobile money payment
- [ ] Payment verification
- [ ] Payment history display
- [ ] Error handling
- [ ] Network failure scenarios

## Backend Integration

### Required API Endpoints

Your backend should implement these endpoints:

```
POST /payments/create
PUT /payments/:reference/verify
GET /payments/:reference
GET /payments/user/:userId
POST /payments/:reference/retry
POST /payments/:reference/cancel
```

### Webhook Handling

Implement Paystack webhooks for real-time payment updates:

```javascript
// Example webhook handler
app.post('/webhooks/paystack', (req, res) => {
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  
  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    
    if (event.event === 'charge.success') {
      // Update payment record
      updatePaymentStatus(event.data.reference, 'success');
    }
  }
  
  res.status(200).send('OK');
});
```

## Troubleshooting

### Common Issues

1. **"Paystack public key not configured"**
   - Ensure EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY is set in .env
   - Restart Expo dev server after adding environment variables

2. **"User email not found"**
   - Ensure user is properly authenticated
   - Check AsyncStorage for authUser data

3. **Payment popup not showing**
   - Verify PaystackProvider is properly configured
   - Check that react-native-webview is installed

4. **Payment verification failing**
   - Implement proper backend verification
   - Check webhook configuration
   - Verify secret key usage on backend

### Debug Mode

Enable debug logging in development:

```typescript
// PaystackService automatically logs in __DEV__ mode
paystackService.logPaymentAttempt(paymentData, 'appointment');
paystackService.logPaymentResult(result);
```

## Future Enhancements

### Planned Features

1. **Offline Payment Queue**
   - Queue payments when offline
   - Process when connection restored

2. **Subscription Payments**
   - Recurring appointment payments
   - Premium membership plans

3. **Multi-Currency Support**
   - Support for USD, EUR, GBP
   - Automatic currency conversion

4. **Enhanced Security**
   - Biometric authentication for payments
   - Transaction limits and controls

5. **Analytics**
   - Payment success rates
   - Popular payment methods
   - Revenue tracking

## Support

For issues related to Paystack integration:

1. Check this documentation
2. Review Paystack's official documentation
3. Contact the development team
4. Submit issues to the project repository

## Resources

- [Paystack Documentation](https://paystack.com/docs)
- [React Native Paystack WebView](https://github.com/PaystackOSS/react-native-paystack-webview)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments)
- [Webhook Documentation](https://paystack.com/docs/payments/webhooks)
