import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Colors from '@/constants/colors';
import paymentVerificationService, { TransactionRecord } from '@/services/paymentVerificationService';
import paystackService from '@/services/paystackService';
import EmptyState from '@/components/EmptyState';

const PaymentHistoryScreen = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const userId = await paystackService.getUserId();
      if (!userId) return;

      const history = await paymentVerificationService.getUserPaymentHistory(userId);
      setTransactions(history);
    } catch (error) {
      console.error('Failed to load payment history:', error);
      Alert.alert(t('payments.error'), t('payments.historyLoadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'all') return true;
    return transaction.status === selectedFilter;
  });

  const handleTransactionPress = (transaction: TransactionRecord) => {
    router.push(`/profile/transaction-details?transactionId=${transaction.id}`);
  };

  const handleRetryPayment = async (transaction: TransactionRecord) => {
    try {
      const result = await paymentVerificationService.retryPayment(transaction.reference);
      if (result.success) {
        Alert.alert(t('payments.success'), t('payments.retrySuccess'));
        await loadPaymentHistory();
      } else {
        Alert.alert(t('payments.error'), result.error || t('payments.retryFailed'));
      }
    } catch (error) {
      Alert.alert(t('payments.error'), t('payments.retryFailed'));
    }
  };

  const renderTransactionItem = ({ item }: { item: TransactionRecord }) => {
    const statusInfo = paymentVerificationService.getPaymentStatusInfo(item.status);
    const methodDisplay = paymentVerificationService.getPaymentMethodDisplayName(item.method);
    const formattedAmount = paymentVerificationService.formatAmount(item.amount);
    const date = new Date(item.createdAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={[styles.transactionCard, { backgroundColor: themeColors.card }]}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionAmount, { color: themeColors.text }]}>
              {formattedAmount}
            </Text>
            <Text style={[styles.transactionMethod, { color: themeColors.subText }]}>
              {methodDisplay}
            </Text>
          </View>
          <View style={styles.transactionStatus}>
            <Ionicons
              name={statusInfo.icon as any}
              size={20}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionRef, { color: themeColors.subText }]}>
            {t('payments.reference')}: {item.reference}
          </Text>
          <Text style={[styles.transactionDate, { color: themeColors.subText }]}>
            {date}
          </Text>
        </View>

        {item.status === 'failed' && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors.brand.primary }]}
            onPress={() => handleRetryPayment(item)}
          >
            <Text style={styles.retryButtonText}>{t('payments.retry')}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === filter ? Colors.brand.primary : themeColors.card,
          borderColor: selectedFilter === filter ? Colors.brand.primary : themeColors.border,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedFilter === filter ? '#fff' : themeColors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );


  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t('Payments History')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', t('All'))}
        {renderFilterButton('success', t('Successful'))}
        {renderFilterButton('pending', t('Pending'))}
        {renderFilterButton('failed', t('Failed'))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.text}
          />
        }
        ListEmptyComponent={!isLoading ? (
          <EmptyState
            icon="card-outline"
            title="No payments recorded"
          />
        ) : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 14,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionDetails: {
    marginBottom: 8,
  },
  transactionRef: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PaymentHistoryScreen;
