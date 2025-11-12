export const userEndpoints = {
  search: '/Users/search',
  userById: (id: string) => `/Users/supabase/${id}`,
} as const;
