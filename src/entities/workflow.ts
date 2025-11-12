export type WorkflowBase = {
  id: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type WFFlow = WorkflowBase;

export type WFActivity = WorkflowBase & {
  deadline: number | null;
};

export type WFActivityFlow = WorkflowBase & {
  activityId: number;
  flowId: number;
  activity?: WFActivity;
  flow?: WFFlow;
};

export type WFProcess = WorkflowBase & {
  flowId: number;
  activityFromId: number | null;
  activityToId: number | null;
  initialActivity: boolean;
  activityFrom?: WFActivity | null;
  activityTo?: WFActivity | null;
};
