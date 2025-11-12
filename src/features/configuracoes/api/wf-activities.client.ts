import http from '@/shared/lib/axios';
import type { WFActivity } from '@/entities/workflow';
import type { PaginationParams, PaginatedResponse } from '../model/pagination';
import { configuracoesEndpoints } from './endpoints';

export type WFActivityPayload = {
  description: string;
  deadline: number | null;
};

export async function fetchWFActivities(params: PaginationParams = {}) {
  const payload = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  const { data } = await http.post<any>(
    configuracoesEndpoints.WFActivitiesSearch,
    payload,
  );
  return data.data;
}

export async function getWFActivityById(id: number) {
  const { data } = await http.get<WFActivity>(
    configuracoesEndpoints.wfActivityById(id),
  );
  return data;
}

export async function createWFActivity(payload: WFActivityPayload) {
  const { data } = await http.post<WFActivity>(
    configuracoesEndpoints.wfActivities,
    payload,
  );
  return data;
}

export async function updateWFActivity(id: number, payload: WFActivityPayload) {
  const { data } = await http.put<WFActivity>(
    configuracoesEndpoints.wfActivityById(id),
    payload,
  );
  return data;
}

export async function deleteWFActivity(id: number) {
  await http.delete(configuracoesEndpoints.wfActivityById(id));
}
