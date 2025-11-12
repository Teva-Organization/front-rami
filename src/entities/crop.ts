import { WFFlow } from "./workflow";

export interface Crop {
  id: number;
  description: string;
  flowId: number;
  createdAt?: string;
  updatedAt?: string;
  flow?: WFFlow;
}
