import apiClient from './client';
import type {
  LoginResponse,
  TokenRefreshResponse,
  User,
  UserRole,
} from '@/types';

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/login/', {
    email,
    password,
  });
  return response.data;
}

export async function refreshToken(
  refresh: string
): Promise<TokenRefreshResponse> {
  const response = await apiClient.post<TokenRefreshResponse>(
    '/api/auth/token/refresh/',
    { refresh }
  );
  return response.data;
}

export async function logout(refresh: string): Promise<void> {
  await apiClient.post('/api/auth/logout/', { refresh });
}

export async function register(
  email: string,
  password: string,
  role: UserRole
): Promise<User> {
  const response = await apiClient.post<User>('/api/auth/register/', {
    email,
    password,
    role,
  });
  return response.data;
}

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/api/auth/users/');
  return response.data;
}
