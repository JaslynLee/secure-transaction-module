import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { useGetTransactionsQuery } from '@/api/transactionApi';
import { CATEGORY_EMOJIS } from '@/constants';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RootState } from '@/store';
import { Transaction } from '@/types';
import { formatAmount, formatDateShort, getErrorMessage } from '@/utils/formatters';

export default function AllTransactions() {
  const { colors } = useTheme();

  const { isAmountMasked } = useSelector((state: RootState) => state.user);

  const { data: transactions = [], isLoading, isFetching, error, refetch } = useGetTransactionsQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'debit' | 'credit'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || tx.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, selectedType]);

  const renderTxItem = ({ item, index }: { item: Transaction; index: number }) => {
    const emoji = CATEGORY_EMOJIS[item.category] || '💸';
    const isCredit = item.type === 'credit';
    const amountColor = isCredit ? '#34C759' : colors.text;

    return (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 40, 400)).duration(350)}
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <View style={styles.contentWrapper}>

        <View style={styles.searchFilterContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.backgroundElement, color: colors.text }]}
            placeholder="Search descriptions, categories..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.filterRow}>
            {(['all', 'debit', 'credit'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedType === type ? colors.backgroundSelected : 'transparent',
                    borderColor: colors.backgroundSelected,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: selectedType === type ? colors.text : colors.textSecondary,
                      fontWeight: selectedType === type ? '600' : '400',
                    },
                  ]}>
                  {type === 'all' ? 'All' : type === 'debit' ? 'Spending' : 'Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching secure vault...</Text>
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
            data={filteredTransactions}
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
                  No matching transactions found.
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
    paddingTop: Spacing.two,
  },
  searchFilterContainer: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  searchInput: {
    height: 45,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  resultsHeader: {
    marginVertical: Spacing.two,
    paddingHorizontal: 2,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '500',
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
