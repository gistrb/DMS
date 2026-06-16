export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roleName: string;
  roleId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  description: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  version: number;
  uploadedByName: string;
  categoryName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentListResponse {
  items: DocumentItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  isActive?: boolean;
  roleId?: number;
}
