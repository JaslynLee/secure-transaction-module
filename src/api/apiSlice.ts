import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Transactions', 'Profile'],
  endpoints: () => ({}),
});
