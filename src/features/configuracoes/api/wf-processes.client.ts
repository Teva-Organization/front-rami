import http from '@/shared/lib/axios';
import type { WFProcess } from '@/entities/workflow';
import type { PaginatedResponse, PaginationParams } from '../model/pagination';
import { configuracoesEndpoints } from './endpoints';

export type WFProcessPayload = {
  description: string;
  activityFromId: number;
  activityToId: number;
  initialActivity: boolean;
  flowId: number;
};

export async function fetchWFProcesses(params: PaginationParams = {}) {
  const payload = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  const { data } = await http.post<any>(
    configuracoesEndpoints.wfProcessesSearch,
    payload,
  );
  return data.data;
}

export async function createWFProcess(payload: WFProcessPayload) {
  const { data } = await http.post<WFProcess>(
    configuracoesEndpoints.wfProcesses,
    payload,
  );
  return data;
}

export async function updateWFProcess(id: number, payload: WFProcessPayload) {
  const { data } = await http.put<WFProcess>(
    configuracoesEndpoints.wfProcessById(id),
    payload,
  );
  return data;
}

export async function deleteWFProcess(id: number) {
  await http.delete(configuracoesEndpoints.wfProcessById(id));
}
