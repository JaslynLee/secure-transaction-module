import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { useGetTransactionsQuery } from '@/api/transactionApi';
import { CATEGORY_EMOJIS } from '@/constants';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authenticateWithBiometrics } from '@/services/biometrics';
import { RootState } from '@/store';
import { toggleAmountMask } from '@/store/userSlice';
import { formatAmount, formatDateLong } from '@/utils/formatters';

export default function TransactionDetail() {
  const { colors } = useTheme();

  const dispatch = useDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAmountMasked } = useSelector((state: RootState) => state.user);

  const { data: transactions = [] } = useGetTransactionsQuery();
  const transaction = transactions.find((tx) => tx.id === id);

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
        <Text style={styles.errorText}>⚠️ Transaction not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleToggleMask = async () => {
    if (!isAmountMasked) {
      dispatch(toggleAmountMask());
      return;
    }

    const result = await authenticateWithBiometrics('Verify identity to reveal amount');
    if (result.success) {
      dispatch(toggleAmountMask());
    } else {
      if (result.error === 'BIOMETRICS_UNAVAILABLE' || Platform.OS === 'web') {
        dispatch(toggleAmountMask());
      }
    }
  };

  const isCredit = transaction.type === 'credit';
  const emoji = CATEGORY_EMOJIS[transaction.category] || '💸';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>

          <View style={styles.receiptHeader}>
            <View style={[styles.emojiCircle, { backgroundColor: colors.backgroundElement }]}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </View>
            <Text style={[styles.description, { color: colors.text }]}>
              {transaction.description}
            </Text>
            <Text style={[styles.category, { color: colors.textSecondary }]}>
              {transaction.category}
            </Text>

            <View style={styles.amountContainer}>
              <Text style={[styles.amount, { color: isCredit ? '#34C759' : colors.text }]}>
                {formatAmount(transaction.amount, transaction.type, isAmountMasked)}
              </Text>
              <TouchableOpacity onPress={handleToggleMask} style={styles.eyeIconButton}>
                <Ionicons
                  name={isAmountMasked ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.detailsCard, { backgroundColor: colors.backgroundElement }]}>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: transaction.status === 'completed' ? '#D1FADF' : '#FFE6A3' }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: transaction.status === 'completed' ? '#027A48' : '#8A6D00' }
                ]}>
                  {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateLong(transaction.date)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Reference ID</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {transaction.referenceNumber}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {transaction.category}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Transaction Type</Text>
              <Text style={[styles.detailValue, { color: colors.text, textTransform: 'capitalize' }]}>
                {transaction.type}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fee</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {transaction.fee === 0 ? 'Free' : `$${transaction.fee.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Charged</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatAmount(transaction.amount + transaction.fee, transaction.type, isAmountMasked)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.one,
    borderWidth: 1,
    borderColor: 'gray',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptHeader: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  emojiText: {
    fontSize: 32,
  },
  description: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
    gap: Spacing.two,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  eyeIconButton: {
    padding: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    width: '100%',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginLeft: Spacing.two,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginVertical: Spacing.one,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
