import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePaystack } from 'react-native-paystack-webview';
import paystackService, { PaymentData } from '@/services/paystackService';
import paystackConfig from '@/config/paystack';
import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  description?: string;
  metadata?: PaymentData['metadata'];
  onSuccess: (result: any) => Promise<void> | void;
  onError?: (error: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  amount,
  title,
  description,
  metadata,
  onSuccess,
  onError,
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();
  const { popup } = usePaystack();

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Paystack service
  useEffect(() => {
    paystackService.setPublicKey(paystackConfig.publicKey);
  }, []);

  const resetForm = () => {
    setSelectedMethod(null);
    setMobileNumber('');
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  const validateForm = (): boolean => {
    if (!selectedMethod) {
      Alert.alert(t('payments.error'), t('confirm.choosePaymentMethod'));
      return false;
    }

    if ((selectedMethod === 'MTN MoMo' || selectedMethod === 'Telecel Cash') && !mobileNumber.trim()) {
      Alert.alert(t('payments.error'), t('confirm.enterMobileNumber'));
      return false;
    }

    if (!paystackService.validateAmount(amount)) {
      Alert.alert(t('payments.error'), t('confirm.invalidAmount'));
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    if (selectedMethod === 'Credit/Debit Card') {
      await handleCardPayment();
    } else {
      await handleMobileMoneyPayment();
    }
  };

  const handleCardPayment = async () => {
    try {
      setIsProcessing(true);

      const paymentData = await paystackService.preparePaymentData(amount, metadata);
      if (!paymentData) {
        Alert.alert(t('auth.error'), t('auth.missingEmail'));
        return;
      }

      paystackService.logPaymentAttempt(paymentData, 'card_payment');

      popup.checkout({
        email: paymentData.email,
        amount: paymentData.amount,
        reference: paymentData.reference,
        metadata: paymentData.metadata,
        onSuccess: async (transactionRef: any) => {
          try {
            const providerRef = paystackService.extractTransactionReference(transactionRef);
            
            paystackService.logPaymentResult({
              reference: paymentData.reference,
              status: 'success',
              transaction: transactionRef,
            });

            await onSuccess({
              reference: paymentData.reference,
              providerRef,
              transaction: transactionRef,
              amount,
              method: 'Credit Card',
            });

            handleClose();
          } catch (err: any) {
            const msg = paystackService.formatErrorMessage(err);
            Alert.alert(t('payments.error'), msg);
            if (onError) onError(err);
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: () => {
          setIsProcessing(false);
          paystackService.logPaymentResult({
            reference: paymentData.reference,
            status: 'cancelled',
            message: 'User cancelled payment',
          });
          Alert.alert(t('payments.cancelled'), t('payments.cancelledMessage'));
        },
        onError: (err: any) => {
          setIsProcessing(false);
          const msg = paystackService.formatErrorMessage(err);
          paystackService.logPaymentResult({
            reference: paymentData.reference,
            status: 'failed',
            message: msg,
          });
          Alert.alert(t('payments.failed'), msg);
          if (onError) onError(err);
        },
      });
    } catch (error: any) {
      setIsProcessing(false);
      const message = paystackService.formatErrorMessage(error);
      Alert.alert(t('payments.failed'), message);
      if (onError) onError(error);
    }
  };

  const handleMobileMoneyPayment = async () => {
    try {
      setIsProcessing(true);
      
      // For mobile money, we'll create a pending payment record
      // In a real implementation, you'd integrate with mobile money APIs
      const reference = paystackService.generateReference('MM');
      
      await onSuccess({
        reference,
        providerRef: reference,
        amount,
        method: selectedMethod,
        mobileNumber,
        status: 'pending', // Mobile money payments typically require manual verification
      });

      Alert.alert(
        t('payments.mobileMoney.initiated'),
        t('payments.mobileMoney.instructions', { number: mobileNumber, amount })
      );

      handleClose();
    } catch (error: any) {
      const message = paystackService.formatErrorMessage(error);
      Alert.alert(t('payments.failed'), message);
      if (onError) onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'Credit/Debit Card', icon: 'card-outline', label: 'Credit/Debit Card' },
    { id: 'MTN MoMo', icon: 'phone-portrait-outline', label: 'MTN Mobile Money' },
    { id: 'Telecel Cash', icon: 'phone-portrait-outline', label: 'Telecel Cash' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={isProcessing}>
            <Ionicons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Payment Summary */}
          <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.summaryTitle, { color: themeColors.text }]}>
              {t('payments.summary')}
            </Text>
            {description && (
              <Text style={[styles.summaryDescription, { color: themeColors.subText }]}>
                {description}
              </Text>
            )}
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: themeColors.subText }]}>
                {t('payments.amount')}
              </Text>
              <Text style={[styles.amountValue, { color: Colors.brand.primary }]}>
                ₵{amount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={[styles.section, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t('confirm.paymentMethod')}
            </Text>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodButton,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: selectedMethod === method.id ? Colors.brand.primary : themeColors.border,
                  },
                  selectedMethod === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
              >
                <Ionicons
                  name={method.icon as any}
                  size={20}
                  color={selectedMethod === method.id ? Colors.brand.primary : themeColors.text}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    {
                      color: selectedMethod === method.id ? Colors.brand.primary : themeColors.text,
                    },
                  ]}
                >
                  {method.label}
                </Text>
                {selectedMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.brand.primary} />
                )}
              </TouchableOpacity>
            ))}

            {/* Mobile Number Input */}
            {(selectedMethod === 'MTN MoMo' || selectedMethod === 'Telecel Cash') && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                  {t('confirm.mobileMoneyNumber')}
                </Text>
                <TextInput
                  placeholder={t('confirm.enterMobileNumber')}
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  style={[
                    styles.input,
                    {
                      color: themeColors.text,
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    },
                  ]}
                  editable={!isProcessing}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: themeColors.background }]}>
          <TouchableOpacity
            style={[
              styles.payButton,
              {
                backgroundColor: Colors.brand.primary,
                opacity: isProcessing ? 0.7 : 1,
              },
            ]}
            onPress={handlePayment}
            disabled={isProcessing || !selectedMethod}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {t('payments.payNow', { amount: amount.toFixed(2) })}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderWidth: 2,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentModal;
