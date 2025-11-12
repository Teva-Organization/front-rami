import http from '@/shared/lib/axios';
import type { WFActivityFlow } from '@/entities/workflow';
import type { PaginatedResponse, PaginationParams } from '../model/pagination';
import { configuracoesEndpoints } from './endpoints';

export type WFActivityFlowPayload = {
  activityId: number;
  flowId: number;
  description: string;
};

export async function fetchWFActivityFlows(params: PaginationParams = {}) {
  const payload = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  const { data } = await http.post<any>(
    configuracoesEndpoints.wfActivityFlowsSearch,
    payload,
  );
  return data.data;
}

export async function createWFActivityFlow(payload: WFActivityFlowPayload) {
  const { data } = await http.post<WFActivityFlow>(
    configuracoesEndpoints.wfActivityFlows,
    payload,
  );
  return data;
}

export async function updateWFActivityFlow(
  id: number,
  payload: WFActivityFlowPayload,
) {
  const { data } = await http.put<WFActivityFlow>(
    configuracoesEndpoints.wfActivityFlowById(id),
    payload,
  );
  return data;
}

export async function deleteWFActivityFlow(id: number) {
  await http.delete(configuracoesEndpoints.wfActivityFlowById(id));
}
