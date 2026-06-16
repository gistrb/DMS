import api from './axios';
import type { User, UpdateUserRequest } from '../types';

export const getUsersApi = async (): Promise<User[]> => {
  const res = await api.get<User[]>('/users');
  return res.data;
};

export const getUserApi = async (id: number): Promise<User> => {
  const res = await api.get<User>(`/users/${id}`);
  return res.data;
};

export const updateUserApi = async (id: number, data: UpdateUserRequest): Promise<User> => {
  const res = await api.put<User>(`/users/${id}`, data);
  return res.data;
};

export const deleteUserApi = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
