import http from '@/shared/lib/axios';
import type { WFFlow } from '@/entities/workflow';
import type { PaginatedResponse, PaginationParams } from '../model/pagination';
import { configuracoesEndpoints } from './endpoints';

export type WFFlowActivityDto = {
  id?: number;
  activityId: number;
  description?: string | null;
};

export type WFFlowProcessDto = {
  id?: number;
  description?: string | null;
  activityFromId: number | null;
  activityToId: number;
  initialActivity: boolean;
};

export type WFFlowPayload = {
  description: string;
  activityFlows: WFFlowActivityDto[];
  processes: WFFlowProcessDto[];
};

export async function fetchWFFlows(params: PaginationParams = {}) {
  const payload = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  const { data } = await http.post<any>(
    configuracoesEndpoints.wfFlowsSearch,
    payload,
  );
  return data.data;
}

export async function createWFFlow(payload: WFFlowPayload) {
  const { data } = await http.post<WFFlow>(
    configuracoesEndpoints.wfFlows,
    payload,
  );
  return data;
}

export async function updateWFFlow(id: number, payload: WFFlowPayload) {
  const { data } = await http.patch<WFFlow>(
    configuracoesEndpoints.wfFlowById(id),
    payload,
  );
  return data;
}

export async function getWFFlowById(id: number) {
  const { data } = await http.get<any>(
    configuracoesEndpoints.wfFlowById(id),
  );
  return data.data;
}

export async function deleteWFFlow(id: number) {
  await http.delete(configuracoesEndpoints.wfFlowById(id));
}
