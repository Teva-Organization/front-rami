import type { User } from '../../../entities/user';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UserSearchFilters {
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface UserSearchResponse {
  items: User[];
  meta: PaginationMeta;
}

export interface UserDto {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  roles?: string[];
}
