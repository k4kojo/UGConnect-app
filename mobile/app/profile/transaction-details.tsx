import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Colors from '@/constants/colors';
import paymentVerificationService, { TransactionRecord } from '@/services/paymentVerificationService';

const TransactionDetailsScreen = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();
  const { transactionId } = useLocalSearchParams();

  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactionDetails();
  }, [transactionId]);

  const loadTransactionDetails = async () => {
    try {
      if (!transactionId) return;
      
      // In a real implementation, you'd fetch by transaction ID
      // For now, we'll simulate getting transaction details
      const mockTransaction: TransactionRecord = {
        id: transactionId as string,
        reference: 'MC_1234567890_123',
        amount: 160.00,
        currency: 'GHS',
        status: 'success',
        method: 'Credit Card',
        appointmentId: 'apt_123',
        userId: 'user_123',
        providerRef: 'paystack_ref_123',
        metadata: {
          doctorName: 'Dr. John Doe',
          specialty: 'Cardiology',
          appointmentDate: '2024-01-15T10:00:00Z',
        },
        createdAt: '2024-01-15T09:45:00Z',
        updatedAt: '2024-01-15T09:46:00Z',
        verifiedAt: '2024-01-15T09:46:00Z',
      };
      
      setTransaction(mockTransaction);
    } catch (error) {
      console.error('Failed to load transaction details:', error);
      Alert.alert(t('payments.error'), t('payments.detailsLoadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!transaction) return;

    const receiptData = paymentVerificationService.generateReceiptData(transaction);
    const receiptText = `
Payment Receipt - MediConnect

Reference: ${receiptData.reference}
Amount: ${paymentVerificationService.formatAmount(receiptData.amount)}
Method: ${paymentVerificationService.getPaymentMethodDisplayName(receiptData.method)}
Status: ${receiptData.status}
Date: ${new Date(receiptData.date).toLocaleString()}

Thank you for using MediConnect!
    `.trim();

    try {
      await Share.share({
        message: receiptText,
        title: 'Payment Receipt',
      });
    } catch (error) {
      console.error('Failed to share receipt:', error);
    }
  };

  const handleRetryPayment = async () => {
    if (!transaction) return;

    try {
      const result = await paymentVerificationService.retryPayment(transaction.reference);
      if (result.success) {
        Alert.alert(t('payments.success'), t('payments.retrySuccess'));
        await loadTransactionDetails();
      } else {
        Alert.alert(t('payments.error'), result.error || t('payments.retryFailed'));
      }
    } catch (error) {
      Alert.alert(t('payments.error'), t('payments.retryFailed'));
    }
  };

  const handleVerifyPayment = async () => {
    if (!transaction) return;

    try {
      const verified = await paymentVerificationService.verifyAndUpdatePayment(
        transaction.reference,
        transaction.appointmentId
      );
      
      if (verified) {
        Alert.alert(t('payments.success'), t('payments.verificationSuccess'));
        await loadTransactionDetails();
      } else {
        Alert.alert(t('payments.error'), t('payments.verificationFailed'));
      }
    } catch (error) {
      Alert.alert(t('payments.error'), t('payments.verificationFailed'));
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.errorText, { color: themeColors.text }]}>
          {t('payments.transactionNotFound')}
        </Text>
      </View>
    );
  }

  const statusInfo = paymentVerificationService.getPaymentStatusInfo(transaction.status);
  const methodDisplay = paymentVerificationService.getPaymentMethodDisplayName(transaction.method);
  const formattedAmount = paymentVerificationService.formatAmount(transaction.amount);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t('payments.transactionDetails')}
        </Text>
        <TouchableOpacity onPress={handleShareReceipt}>
          <Ionicons name="share-outline" size={24} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.statusHeader}>
            <Ionicons
              name={statusInfo.icon as any}
              size={32}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={[styles.amountText, { color: themeColors.text }]}>
            {formattedAmount}
          </Text>
          <Text style={[styles.methodText, { color: themeColors.subText }]}>
            {methodDisplay}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={[styles.detailsCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            {t('payments.transactionDetails')}
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
              {t('payments.reference')}
            </Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>
              {transaction.reference}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
              {t('payments.date')}
            </Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>
              {new Date(transaction.createdAt).toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
              {t('payments.currency')}
            </Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>
              {transaction.currency}
            </Text>
          </View>

          {transaction.appointmentId && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
                {t('payments.appointmentId')}
              </Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>
                {transaction.appointmentId}
              </Text>
            </View>
          )}

          {transaction.verifiedAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
                {t('payments.verifiedAt')}
              </Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>
                {new Date(transaction.verifiedAt).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Appointment Details */}
        {transaction.metadata && (
          <View style={[styles.detailsCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>
              {t('payments.appointmentDetails')}
            </Text>
            
            {transaction.metadata.doctorName && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
                  {t('payments.doctor')}
                </Text>
                <Text style={[styles.detailValue, { color: themeColors.text }]}>
                  {transaction.metadata.doctorName}
                </Text>
              </View>
            )}

            {transaction.metadata.specialty && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
                  {t('payments.specialty')}
                </Text>
                <Text style={[styles.detailValue, { color: themeColors.text }]}>
                  {transaction.metadata.specialty}
                </Text>
              </View>
            )}

            {transaction.metadata.appointmentDate && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.subText }]}>
                  {t('payments.appointmentDate')}
                </Text>
                <Text style={[styles.detailValue, { color: themeColors.text }]}>
                  {new Date(transaction.metadata.appointmentDate).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {transaction.status === 'failed' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.brand.primary }]}
              onPress={handleRetryPayment}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t('payments.retry')}</Text>
            </TouchableOpacity>
          )}

          {transaction.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.brand.accent }]}
              onPress={handleVerifyPayment}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t('payments.verify')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  methodText: {
    fontSize: 14,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TransactionDetailsScreen;
