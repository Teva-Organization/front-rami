import type { PaginatedResponse, PaginationParams } from "@/features/configuracoes/model/pagination";
import http from "@/shared/lib/axios";
import { areasEndpoints } from "./endpoints";
import { Plant } from "@/entities/plant";
import type { WFProcess } from "@/entities/workflow";

export type PlantPayload = {
  areaSize: number;
  soilCorrection: boolean;
  irrigationDimension?: string;
  fertileIrrigation: boolean;
  seed: boolean;
  seedType?: string;
  variety?: string;
  seedlingSupplier?: string;
  areaLocationName: string;
  cropId?: number;
  flowId?: number;
  wFInstanceId?: number;
};

export async function fetchPlants(params: PaginationParams = {}) {
  const payload = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  const { data } = await http.post<any>(areasEndpoints.plantSearch, payload);
  return data.data;
}

export async function getPlantById(id: number) {
  const { data } = await http.get<any>(areasEndpoints.plantById(id));
  return data.data;
}

export async function createPlant(payload: PlantPayload) {
  const { data } = await http.post<any>(areasEndpoints.plant, payload);
  return data.data;
}

export async function updatePlant(id: number, payload: PlantPayload) {
  const { data } = await http.put<any>(areasEndpoints.plantById(id), payload);
  return data.data;
}

export async function deletePlant(id: number) {
  await http.delete(areasEndpoints.plantById(id));
}

type NextActivitiesParams = PaginationParams & {
  activityFromId: number;
  flowId?: number;
};

export async function fetchNextActivities(params: NextActivitiesParams): Promise<PaginatedResponse<WFProcess>> {
  const payload = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    activityFromId: params.activityFromId,
    flowId: params.flowId,
  };

  const { data } = await http.post<any>(areasEndpoints.wfProcessSearch, payload);
  return data.data;
}
