export const areasEndpoints = {
  plant: '/Plant',
  plantSearch: '/Plant/search',
  plantById: (id: number | string) => `/Plant/${id}`,

} as const;
