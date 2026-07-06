import { Transaction } from '@/types';
import mockData from '../constants/mockData.json';
import { apiSlice } from './apiSlice';

export const transactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      queryFn: async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const transactions = mockData.transactions as Transaction[];
          return { data: transactions };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              message: error instanceof Error ? error.message : 'An error occurred fetching transactions',
            },
          };
        }
      },
      providesTags: ['Transactions'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetTransactionsQuery } = transactionApi;
