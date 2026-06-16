import api from './axios';
import type { DocumentItem, DocumentListResponse } from '../types';

export interface DocumentQueryParams {
  search?: string;
  categoryId?: number;
  sortBy?: string;
  descending?: boolean;
  page?: number;
  pageSize?: number;
}

export const getDocumentsApi = async (params: DocumentQueryParams): Promise<DocumentListResponse> => {
  const res = await api.get<DocumentListResponse>('/documents', { params });
  return res.data;
};

export const getDocumentApi = async (id: number): Promise<DocumentItem> => {
  const res = await api.get<DocumentItem>(`/documents/${id}`);
  return res.data;
};

export const uploadDocumentApi = async (formData: FormData): Promise<DocumentItem> => {
  const res = await api.post<DocumentItem>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateDocumentApi = async (id: number, data: { title: string; description: string; categoryId?: number }): Promise<DocumentItem> => {
  const res = await api.put<DocumentItem>(`/documents/${id}`, data);
  return res.data;
};

export const newVersionApi = async (id: number, formData: FormData): Promise<DocumentItem> => {
  const res = await api.post<DocumentItem>(`/documents/${id}/version`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteDocumentApi = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};

export const downloadDocumentApi = async (id: number): Promise<Blob> => {
  const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
  return res.data;
};
