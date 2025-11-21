import type { Crop } from "./crop";
import { WFActivity } from "./workflow";

export interface Plant {
  id: number;
  cropId?: number;
  areaSize: number;
  soilCorrection: boolean;
  irrigationDimension?: string;
  fertileIrrigation: boolean;
  seed: boolean;
  seedType?: string;
  variety?: string;
  seedlingSupplier?: string;
  areaLocationName: string;
  flowId?: number;
  wFInstanceId?: number;
  createdAt?: string;
  status?: string;
  geo?: { lat: number; lng: number } | null;
  wfInstance?: WFInstance | null;
  crop?: Crop | null;
}

export interface WFInstance {
  id: number;
  entityId: number;
  createdAt: string;
  updatedAt?: string;
  instanceActivities: WFInstanceActivity[];
  nextActivities: WFActivity[];
}

export interface WFInstanceActivity {
  id: number;
  wfPreviousActivityId?: number | null;
  wfCurrentActivityId: number;
  wfInstanceId: number;
  userId?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;

  wfCurrentActivity: WFActivity;
}
