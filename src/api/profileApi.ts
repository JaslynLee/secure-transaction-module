import { UserProfile } from '@/types';
import mockData from '../constants/mockData.json';
import { apiSlice } from './apiSlice';

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      queryFn: async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const profile = mockData.user as UserProfile;
          return { data: profile };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              message: error instanceof Error ? error.message : 'An error occurred fetching profile details',
            },
          };
        }
      },
      providesTags: ['Profile'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetProfileQuery } = profileApi;
