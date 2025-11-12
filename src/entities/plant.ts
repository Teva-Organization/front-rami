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
}
