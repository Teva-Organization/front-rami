import http from '../../../shared/lib/axios';
import { authEndpoints } from './endpoints';
import type { LoginCreateDto, RegisterCreateDto } from '../model/auth';
import type { User } from '../../../entities/user';

export async function login(payload: LoginCreateDto) {
  const { data } = await http.post<User>(authEndpoints.login, payload);
  return data;
}

export async function logout() {
  const { data } = await http.post<boolean>(authEndpoints.logout);
  return data;
}

export async function signup(payload: RegisterCreateDto) {
  await http.post(authEndpoints.signup, payload);
}

export async function checkAuthentication() {
  const { data } = await http.get<any>(authEndpoints.authenticated);
  return data.result;
}

export async function getAuthFromSupabase(id: string) {
  const { data } = await http.get<User>(authEndpoints.supabase(id));
  return data;
}
