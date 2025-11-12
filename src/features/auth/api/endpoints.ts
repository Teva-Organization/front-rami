export const authEndpoints = {
  login: '/Auth/signin',
  signup: '/Auth/signup',
  authenticated: '/Auth/authenticated',
  logout: '/Auth/signout',
  supabase: (id: string) => `/Auth/supabase/${id}`,
} as const;
