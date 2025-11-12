import { UserDto } from "@/features/users";

export interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
}

export interface LoginCreateDto {
  email: string;
  password: string;
}

export interface RegisterCreateDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
