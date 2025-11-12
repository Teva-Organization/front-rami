import http from '../../../shared/lib/axios';
import type { User } from '../../../entities/user';
import { userEndpoints } from './endpoints';
import type { UserSearchFilters, UserSearchResponse } from '../model/user';

export async function searchUsers(params: UserSearchFilters = {}) {
  const { data } = await http.get<UserSearchResponse>(userEndpoints.search, {
    params,
  });
  return data;
}

export async function getUserById(id: string) {
  const { data } = await http.get<User>(userEndpoints.userById(id));
  return data;
}
