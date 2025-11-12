import http from '@/shared/lib/axios';
import type { Crop } from '@/entities/crop';
import type { PaginatedResponse, PaginationParams } from '@/features/configuracoes/model/pagination';

const cropEndpoints = {
  base: '/Crop',
  search: '/Crop/search',
  byId: (id: number | string) => `/Crop/${id}`,
} as const;

export type CropPayload = {
  description: string;
  flowId: number;
};

export async function fetchCrops(params: PaginationParams = {}) {
  const payload = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };
  const { data } = await http.post<any>(
    cropEndpoints.search,
    payload,
  );
  return data.data;
}

export async function getCropById(id: number) {
  const { data } = await http.get<any>(cropEndpoints.byId(id));
  return data.data;
}

export async function createCrop(payload: CropPayload) {
  const { data } = await http.post<any>(cropEndpoints.base, payload);
  return data.data;
}

export async function updateCrop(id: number, payload: CropPayload) {
  const { data } = await http.put<any>(cropEndpoints.byId(id), payload);
  return data.data;
}

export async function deleteCrop(id: number) {
  await http.delete(cropEndpoints.byId(id));
}
