import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { useGetProfileQuery } from '@/api/profileApi';
import { useGetTransactionsQuery } from '@/api/transactionApi';
import { CATEGORY_EMOJIS } from '@/constants';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authenticateWithBiometrics } from '@/services/biometrics';
import { RootState } from '@/store';
import { toggleAmountMask } from '@/store/userSlice';
import { Transaction } from '@/types';
import { formatAmount, formatBalance, formatDateShort, getErrorMessage } from '@/utils/formatters';

export default function TransactionHistory() {
  const { colors } = useTheme();

  const dispatch = useDispatch();
  const { isAmountMasked } = useSelector((state: RootState) => state.user);

  const {
    data: transactions = [],
    isLoading: isTransactionsLoading,
    isFetching: isTransactionsFetching,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useGetTransactionsQuery();

  const {
    data: user,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  const isLoading = isTransactionsLoading || isProfileLoading;
  const isFetching = isTransactionsFetching || isProfileFetching;
  const error = transactionsError || profileError;

  const refetch = () => {
    refetchTransactions();
    refetchProfile();
  };

  const handleToggleMask = async () => {
    if (!isAmountMasked) {
      dispatch(toggleAmountMask());
      return;
    }

    const result = await authenticateWithBiometrics('Authorize to reveal sensitive amounts');
    if (result.success) {
      dispatch(toggleAmountMask());
    } else {
      if (result.error === 'BIOMETRICS_UNAVAILABLE' || Platform.OS === 'web') {
        dispatch(toggleAmountMask());
      }
    }
  };

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const highlightTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions]);

  const renderHighlightCard = ({ item, index }: { item: Transaction; index: number }) => {
    const emoji = CATEGORY_EMOJIS[item.category] || '💸';
    const isCredit = item.type === 'credit';
    const amountColor = isCredit ? '#34C759' : colors.text;

    return (
      <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: item.id } })}
          style={[styles.carouselCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.carouselCardTop}>
            <View style={[styles.carouselCardEmojiCircle, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={styles.carouselCardEmoji}>{emoji}</Text>
            </View>
            <Text style={[styles.carouselCardValue, { color: amountColor }]}>
              {formatAmount(item.amount, item.type, isAmountMasked)}
            </Text>
          </View>
          <View style={styles.carouselCardBottom}>
            <Text numberOfLines={1} style={[styles.carouselCardDesc, { color: colors.text }]}>
              {item.description}
            </Text>
            <View style={styles.carouselMetaRow}>
              <Text numberOfLines={1} style={[styles.carouselCardCategory, { color: colors.textSecondary, flex: 1 }]}>
                {item.category}
              </Text>
              <View style={[
                styles.typeBadge,
                { backgroundColor: isCredit ? 'rgba(52, 199, 89, 0.12)' : 'rgba(142, 142, 147, 0.12)' }
              ]}>
                <Text style={[
                  styles.typeBadgeText,
                  { color: isCredit ? '#34C759' : colors.textSecondary }
                ]}>
                  {isCredit ? 'Credit' : 'Debit'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTxItem = ({ item, index }: { item: Transaction; index: number }) => {
    const emoji = CATEGORY_EMOJIS[item.category] || '💸';
    const isCredit = item.type === 'credit';
    const amountColor = isCredit ? '#34C759' : colors.text;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(300)}
        layout={Layout.springify()}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: item.id } })}
          style={[styles.txItem, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.txLeft}>
            <View style={[styles.emojiCircle, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </View>
            <View style={styles.txInfo}>
              <Text numberOfLines={1} style={[styles.txDescription, { color: colors.text }]}>
                {item.description}
              </Text>
              <View style={styles.txMetaRow}>
                <Text style={[styles.txMeta, { color: colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>
                  {item.category}
                </Text>
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: isCredit ? 'rgba(52, 199, 89, 0.12)' : 'rgba(142, 142, 147, 0.12)' }
                ]}>
                  <Text style={[
                    styles.typeBadgeText,
                    { color: isCredit ? '#34C759' : colors.textSecondary }
                  ]}>
                    {isCredit ? 'Credit' : 'Debit'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.txDate, { color: colors.textSecondary }]} numberOfLines={1}>
                {formatDateShort(item.date)}
              </Text>
            </View>
          </View>
          <View style={styles.txRight}>
            <Text style={[styles.txAmount, { color: amountColor }]}>
              {formatAmount(item.amount, item.type, isAmountMasked)}
            </Text>
            {item.status === 'pending' && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWrapper}>

        {/* Header Row */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/profile')}
            style={[styles.profileButton, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="person-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Balance Card Section */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Savings Balance</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={[styles.cardBalance, { color: colors.text }]}>
              {formatBalance(user?.savingsBalance || 0, isAmountMasked)}
            </Text>
            <TouchableOpacity onPress={handleToggleMask} style={styles.eyeIconButton}>
              <Ionicons
                name={isAmountMasked ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View>
              <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Account Number</Text>
              <Text style={[styles.footerValue, { color: colors.text }]}>
                {isAmountMasked ? '···· ···· ···· 9842' : user?.accountNumber}
              </Text>
            </View>
            <View style={styles.rightAlign}>
              <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Active Credit</Text>
              <Text style={[styles.footerValue, { color: colors.text }]}>
                {formatBalance(user?.creditBalance || 0, isAmountMasked)}
              </Text>
            </View>
          </View>
        </View>

        {/* Horizontal Highlights Carousel */}
        {!isLoading && !error && (
          <View style={styles.carouselContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Highlights</Text>
              <Text style={[styles.carouselHintText, { color: colors.textSecondary }]}>Swipe ➜</Text>
            </View>
            <FlatList
              horizontal
              data={highlightTransactions}
              keyExtractor={(item) => `carousel-${item.id}`}
              renderItem={renderHighlightCard}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselListContent}
            />
          </View>
        )}

        {/* Recent Transactions List Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/transaction')} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading secure data...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>⚠️ {getErrorMessage(error, 'Failed to load transactions')}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <Text style={[styles.retryButtonText, { color: colors.text }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={recentTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTxItem}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={refetch}
                tintColor={colors.text}
                colors={[colors.text]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No transactions found.
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  greetingText: {
    fontSize: 13,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    gap: Spacing.two,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockButton: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.one,
    borderRadius: Spacing.one,
  },
  lockIcon: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.one,
    gap: Spacing.two,
  },
  cardBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  eyeIconButton: {
    padding: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginVertical: Spacing.half,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  rightAlign: {
    alignItems: 'flex-end',
  },

  // Horizontal highlights carousel
  carouselContainer: {
    marginBottom: Spacing.four,
    gap: Spacing.one,
  },
  carouselHintText: {
    fontSize: 12,
    fontWeight: '500',
  },
  carouselListContent: {
    paddingRight: Spacing.three,
    gap: Spacing.two,
  },
  carouselCard: {
    width: 170,
    height: 108,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  carouselCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carouselCardEmojiCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselCardEmoji: {
    fontSize: 16,
  },
  carouselCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  carouselCardBottom: {
    gap: 1,
  },
  carouselCardDesc: {
    fontSize: 12,
    fontWeight: '700',
  },
  carouselCardCategory: {
    fontSize: 10,
  },
  carouselMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
    gap: 4,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: 'center',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  viewAllButton: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.one,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '600',
  },
  retryButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.one,
    borderWidth: 1,
    borderColor: 'gray',
    marginTop: Spacing.two,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txDescription: {
    fontSize: 15,
    fontWeight: '600',
  },
  txMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  txDate: {
    fontSize: 11,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#FFE6A3',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    color: '#8A6D00',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  emptyText: {
    fontSize: 14,
  },
});
