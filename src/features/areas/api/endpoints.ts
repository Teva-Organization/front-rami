export const areasEndpoints = {
  plant: '/Plant',
  plantSearch: '/Plant/search',
  plantById: (id: number | string) => `/Plant/${id}`,
  wfProcessSearch: '/WFProcess/search',
} as const;
