export type PaginationParams = {
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
};
